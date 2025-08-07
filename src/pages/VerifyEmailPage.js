import { useState } from 'react';
import { Mail, Loader } from 'lucide-react';
import { toast } from 'react-hot-toast';
import { useAuth } from '../contexts/AuthContext';
import { resendVerificationEmail, logout } from '../firebase';

const VerifyEmailScreen = () => {
  const { currentUser } = useAuth();
  const [isSending, setIsSending] = useState(false);
  const [sendSuccess, setSendSuccess] = useState(false);

  const handleResend = async () => {
    if (!currentUser || isSending) return;
    setIsSending(true);
    setSendSuccess(false);
    
    try {
      await resendVerificationEmail(currentUser);
      toast.success("Novo e-mail de verificação enviado!");
      setSendSuccess(true);
      // Desabilita o botão por um tempo para evitar spam
      setTimeout(() => setSendSuccess(false), 30000); 
    } catch (error) {
      toast.error("Falha ao reenviar. Tente novamente em alguns minutos.");
      console.error(error);
    } finally {
      setIsSending(false);
    }
  };

  const handleLogoutAndGoBack = async () => {
    try {
      await logout();
      toast.success("Você saiu da conta.");
      // A própria estrutura do AppGatekeeper vai redirecionar para a tela de login
    } catch (error) {
      toast.error("Erro ao sair.");
    }
  };

  return (
    <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 text-center animate-fade-in-up border border-slate-200">
      <Mail className="mx-auto text-sky-500 mb-4" size={48} />
      <h1 className="text-2xl font-bold text-slate-800">Verifique seu E-mail</h1>
      <p className="text-slate-600 mt-2 mb-6">
        Enviamos um link de confirmação para <strong>{currentUser?.email}</strong>. Por favor, clique no link para ativar sua conta.
      </p>
      <p className="text-sm text-slate-500 mb-6">
        Após verificar, <strong>atualize esta página</strong> para acessar a plataforma. Não se esqueça de checar sua caixa de spam.
      </p>
      
      <button 
        onClick={handleResend} 
        disabled={isSending || sendSuccess} 
        className="form-button-primary w-full"
      >
        {isSending && <Loader className="animate-spin mr-2" size={20} />}
        {sendSuccess ? 'Reenviado! Tente em 30s' : 'Reenviar E-mail de Confirmação'}
      </button>

      <button onClick={handleLogoutAndGoBack} className="w-full text-center text-sm font-semibold text-slate-600 hover:text-slate-800 mt-4 py-2">
        Usar outra conta
      </button>
    </div>
  );
};

export default VerifyEmailScreen;