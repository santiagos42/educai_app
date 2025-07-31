import React, { useState, useEffect, useMemo } from 'react';
import { useAuth } from './contexts/AuthContext';
import {
  signInWithGoogle, logout, signUpWithDetails, signInWithEmail,
  signInAsGuest, sendPasswordReset
} from './firebase';
import toast from 'react-hot-toast';
import { LogOut, User, Mail, Key, Loader, Book} from 'lucide-react';

const googleIconUrl = process.env.PUBLIC_URL + '/google.svg';
const logoUrl = process.env.PUBLIC_URL + '/logo900.png';

// =================================================================================
// 1. COMPONENTE DE MARKETING - CORRIGIDO
// =================================================================================
const AuthMarketing = ({ setView }) => {
  return (
    <div className="hidden lg:flex flex-col justify-between p-12 text-white h-full">
      
      {/* Seção Superior: Logo e Slogan (sem mudanças) */}
      <div className="text-center">
        <img src={logoUrl} alt="EducAI Logo" className="w-48 h-48 mx-auto mb-4" />
      </div>
      
      {/* Seção Central: Descrição (sem mudanças) */}
      <div className="w-full my-2">
        <h2 className="text-3xl font-bold text-center mt-0 mb-14" style={{ fontFamily: "'Patrick Hand', cursive" }}>Transforme sua forma de ensinar</h2>
        <p className="text-slate-300 text-center text-base mb-6">O EducAI - Assistente do Professor é seu copiloto inteligente para uma sala de aula mais dinâmica e organizada.</p>
        <p className="text-slate-300 text-center text-base mb-6">Trata-se de uma plataforma desenvolvida por professores para professores.</p>
      </div>

      {/* Seção Inferior: Slogan Final + NOVO BOTÃO */}
      <div className="text-center">
        <p className="text-1xl font-bold text-white mb-6" style={{ fontFamily: "'Patrick Hand', cursive" }}>O futuro está aqui. Experimente.</p>
        
        {/* ================================================= */}
        {/* NOVO BOTÃO ADICIONADO AQUI                     */}
        {/* ================================================= */}
        <button 
          onClick={() => setView('features')}
          className="bg-sky-500/20 text-sky-300 border border-sky-400/50 rounded-full px-8 py-3 font-semibold hover:bg-sky-500/40 hover:text-white transition-all duration-300"
        >
          Conheça as Funcionalidades
        </button>

      </div>

    </div>
  );
};


// =================================================================================
// 2. FORMULÁRIOS DE LOGIN, CADASTRO, ETC. - TOTALMENTE CORRIGIDOS
// =================================================================================
const LoginForm = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await signInWithEmail(email, password);
      toast.success("Login bem-sucedido!");
    } catch (error) {
     if (error.code === 'auth/email-already-in-use') {
      toast.error("Este e-mail já está em uso. Tente fazer login ou recuperar sua senha.");
    } else {
      // Para outros erros, como o de senha fraca que veremos a seguir
      toast.error(`Falha ao criar conta: ${error.message}`);
    }
    console.error("Erro no cadastro:", error); 
  } finally {
    setIsLoading(false);
  }
};

  // CORREÇÃO GERAL: Sintaxe JSX corrigida
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="input-group">
        <Mail className="input-icon" size={18} />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="input-group">
        <Key className="input-icon" size={18} />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <button type="submit" className="form-button-primary w-full" disabled={isLoading}>
        {isLoading ? <Loader className="animate-spin" size={20} /> : 'Entrar'}
      </button>
      <button type="button" onClick={() => setView('forgotPassword')} className="text-xs text-slate-500 hover:underline">
        Esqueceu sua senha?
      </button>
    </form>
  );
};

const SignUpForm = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithDetails(email, password, firstName, lastName, discipline);
      toast.success("Conta criada! Verifique seu e-mail para continuar.");
    } catch (error) {
      toast.error(`Falha ao criar conta: ${error.message}`);
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // CORREÇÃO GERAL: Sintaxe JSX corrigida e typos
  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="input-group col-span-1">
          <User className="input-icon" size={18} />
          <input type="text" placeholder="Nome" value={firstName} onChange={e => setFirstName(e.target.value)} required />
        </div>
        <div className="input-group col-span-1">
          <User className="input-icon" size={18} />
          <input type="text" placeholder="Sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} required />
        </div>
      </div>
      <div className="input-group">
        <Book className="input-icon" size={18} />
        <input type="text" placeholder="Disciplina que leciona" value={discipline} onChange={e => setDiscipline(e.target.value)} required />
      </div>
      <div className="input-group">
        <Mail className="input-icon" size={18} />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <div className="input-group">
        <Key className="input-icon" size={18} />
        <input type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required />
      </div>
      <div className="input-group">
        <Key className="input-icon" size={18} />
        <input type="password" placeholder="Confirme a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required />
      </div>
      <button type="submit" className="form-button-primary w-full" disabled={isLoading}>
        {isLoading ? <Loader className="animate-spin" size={20} /> : 'Criar minha conta'}
      </button>
    </form>
  );
};

const ForgotPasswordForm = ({ setView }) => {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleReset = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      await sendPasswordReset(email);
      toast.success("E-mail de recuperação enviado!");
      setSent(true);
    } catch (error) {
      toast.error("Não foi possível enviar o e-mail. Verifique o endereço digitado.");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (sent) {
    return (
      <div className="text-center">
        <p className="text-slate-600">Se uma conta com este e-mail existir, um link para redefinir sua senha foi enviado. Verifique sua caixa de entrada e spam.</p>
        <button onClick={() => setView('login')} className="form-button-secondary w-full mt-4">Voltar para Login</button>
      </div>
    );
  }

  // CORREÇÃO GERAL: Sintaxe JSX corrigida e typos
  return (
    <form onSubmit={handleReset} className="space-y-4">
      <div className="input-group">
        <Mail className="input-icon" size={18} />
        <input type="email" placeholder="Seu e-mail de cadastro" value={email} onChange={e => setEmail(e.target.value)} required />
      </div>
      <button type="submit" className="form-button-primary w-full" disabled={isLoading}>
        {isLoading ? <Loader className="animate-spin" size={20} /> : 'Enviar link de recuperação'}
      </button>
    </form>
  );
};


const InspirationalQuote = () => {
    const quotes = useMemo(() => [
      { text: "A tarefa do educador moderno não é derrubar florestas, mas irrigar desertos.", author: "C.S. Lewis" },
      { text: "A educação é a arma mais poderosa que você pode usar para mudar o mundo.", author: "Nelson Mandela" },
      { text: "Ensinar não é transferir conhecimento, mas criar as possibilidades para a sua própria produção ou a sua construção.", author: "Paulo Freire" },
    ], []);

    const [currentQuote, setCurrentQuote] = useState(quotes[0]);

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentQuote(quotes[Math.floor(Math.random() * quotes.length)]);
        }, 7000); // Aumentei um pouco o tempo
        return () => clearInterval(timer);
    }, [quotes]);
    
    const brandColor = "#062d58ff";

    return (
        <div className="text-center animate-fade-in">
            <p className="text-sm italic" style={{ color: brandColor }}>"{currentQuote.text}"</p>
            <p className="text-xs font-bold mt-2" style={{ color: brandColor }}>- {currentQuote.author}</p>
        </div>
    );
};


// =================================================================================
// 3. TELA PRINCIPAL DE AUTENTICAÇÃO (AuthScreen) - CORREÇÕES
// =================================================================================
export function AuthScreen({ setView }) {
  const [authView, setAuthView] = useState('login');
  const handleGoogleLogin = async () => { try { await signInWithGoogle(); toast.success('Login bem-sucedido!'); } catch (error) { toast.error('Falha no login com Google.'); } };
  const handleGuestLogin = async () => { try { await signInAsGuest(); toast.success('Entrando como convidado!'); } catch (error) { toast.error('Falha ao entrar como convidado.'); } };
  const titles = { login: "Acesse sua conta", signup: "Crie sua conta", forgotPassword: "Recuperar Senha" };
  const brandColor = "#63D4B4";

  return (
    // O bloco central, com 2 colunas, como no seu design original.
    // Ajustamos a largura máxima para ficar mais coeso sem os painéis laterais.
    <div className="w-full max-w-5xl bg-slate-800 rounded-2xl shadow-2xl flex flex-col lg:flex-row overflow-hidden animate-fade-in-up">
      
      {/* Coluna Esquerda: Sua Logo e Marketing, agora com o botão para a página de features */}
      <div className="w-full lg:w-1/2 hidden lg:flex">
        {/* Passamos `setView` para que o novo botão dentro de AuthMarketing funcione */}
        <AuthMarketing setView={setView} />
      </div>

      {/* Coluna Direita: Formulários e Citações */}
      <div className="w-full lg:w-1/2 bg-slate-50 p-8 flex flex-col">
                <div className="flex-grow flex flex-col justify-center">
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold" style={{ color: brandColor, fontFamily: "'Patrick Hand', cursive" }}>Junte-se a nós nessa missão</h1>
            <p className="text-slate-500 text-sm" style={{ color: brandColor, fontFamily: "'Patrick Hand', cursive" }} >O nosso objetivo é otimizar o seu trabalho</p>
          </div>
        </div>

        {/* Conteúdo principal que cresce para preencher o espaço */}
        <div className="flex-grow flex flex-col justify-center">
          <h2 className="text-xl font-bold text-slate-700 mb-5 text-center">{titles[authView]}</h2>

          {/* Renderização condicional dos formulários */}
          {authView === 'login' && <LoginForm setView={setAuthView} />}
          {authView === 'signup' && <SignUpForm setView={setAuthView} />}
          {authView === 'forgotPassword' && <ForgotPasswordForm setView={setAuthView} />}

          {/* Botões para alternar entre os formulários */}
          <div className="text-center mt-4">
            {authView === 'login' && (
              <button onClick={() => setAuthView('signup')} className="toggle-auth-view">
                Não tem uma conta? <strong>Crie uma agora</strong>
              </button>
            )}
            {(authView === 'signup' || authView === 'forgotPassword') && (
              <button onClick={() => setAuthView('login')} className="toggle-auth-view">
                Já tem uma conta? <strong>Faça o login</strong>
              </button>
            )}
          </div>
          
          <div className="separator">ou</div>
          
          {/* Botões de login social */}
          <div className="flex flex-col sm:flex-row gap-4">
            <button onClick={handleGoogleLogin} className="google-button flex-1"><img src={googleIconUrl} alt="Google" className="google-icon" />Entrar com Google</button>
            <button onClick={handleGuestLogin} className="form-button-secondary flex-1">Entrar como Convidado</button>
          </div>
        </div>

        {/* Rodapé com a citação inspiradora */}
        <div className="flex-shrink-0 pt-6 mt-6 border-t border-slate-200">
          <InspirationalQuote />
        </div>
      </div>
    </div>
  );
}

// =================================================================================
// 4. AuthHeader - CORREÇÕES
// =================================================================================
export function AuthHeader() {
  const { currentUser } = useAuth();
  
  const handleLogout = async () => {
    const userToDelete = currentUser;
    try {
      await logout();
      toast.success('Você saiu da sua conta.');
      if (userToDelete && userToDelete.isAnonymous) {
        await userToDelete.delete();
        console.log("Conta anônima excluída com sucesso.");
      }
    } catch (error) {
      toast.error('Falha ao sair da conta.');
      console.error("Erro no logout ou na exclusão do usuário anônimo:", error);
    }
  };

  return (
    <div className="auth-container-simple">
      {currentUser ? (
        <div className="user-info">
          {currentUser.isAnonymous ? (
            <div className="user-avatar-guest"><User size={20} /></div>
          ) : (
            // CORREÇÃO: currentUser.phot -> currentUser.photoURL
            currentUser.photoURL && <img src={currentUser.photoURL} alt={currentUser.displayName || 'Avatar'} className="user-avatar" />
          )}
          <span className="user-name">
            {currentUser.isAnonymous ? 'Convidado' : `Olá, ${currentUser.displayName ? currentUser.displayName.split(' ')[0] : (currentUser.email ? currentUser.email.split('@')[0] : 'Usuário')}`}
          </span>
          {/* CORREÇÃO: Adicionado texto "Sair" para melhor UX */}
          <button onClick={handleLogout} className="logout-button">
            <LogOut size={18} />
            <span className="hidden sm:inline ml-2">Sair</span>
          </button>
        </div>
      ) : null}
    </div>
  );
}