import React, { useState } from 'react';
import { useAuth } from './contexts/AuthContext';
// CORREÇÃO 1 e 2: Usando os nomes de função corretos que são exportados do seu firebase.js
import { signInWithGoogle, logout, signUpWithEmail, signInWithEmail, signInAsGuest } from './firebase'; 
import toast from 'react-hot-toast';
// CORREÇÃO 3: Adicionando 'Loader' aos imports
import { LogIn, LogOut, User, Mail, Key, Loader } from 'lucide-react';

// Assumindo que você criou o google.svg na pasta public
const googleIconUrl = process.env.PUBLIC_URL + '/google.svg';

// Componente para o cabeçalho, mostrando informações do usuário
export function AuthHeader() {
  const { currentUser } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Você saiu da sua conta.');
    } catch (error) {
      toast.error('Falha ao sair da conta.');
      console.error(error);
    }
  };

  return (
    <div className="auth-container">
      {currentUser ? (
        <div className="user-info">
          {currentUser.isAnonymous ? (
            <div className="user-avatar-guest">
              <User size={20} />
            </div>
          ) : (
            // Verificação de segurança: garante que photoURL existe antes de usá-lo
            currentUser.photoURL && <img src={currentUser.photoURL} alt={currentUser.displayName || 'Avatar'} className="user-avatar" />
          )}
          <span className="user-name">
            {currentUser.isAnonymous ? 'Convidado' : `Olá, ${currentUser.displayName ? currentUser.displayName.split(' ')[0] : (currentUser.email ? currentUser.email.split('@')[0] : 'Usuário')}`}
          </span>
          <button onClick={handleLogout} className="logout-button" title="Sair">
            <LogOut size={20} />
          </button>
        </div>
      ) : null}
    </div>
  );
}

// Componente para a tela de login em tela cheia
export function AuthScreen() {
  const [isLoginView, setIsLoginView] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { currentUser } = useAuth();

  const handleGoogleLogin = async () => {
    try {
      await signInWithGoogle();
      toast.success('Login realizado com sucesso!');
    } catch (error) {
      toast.error('Falha no login com o Google.');
      console.error("Erro no login com Google:", error);
    }
  };

  const handleGuestLogin = async () => {
    try {
      await signInAsGuest();
      toast.success('Bem-vindo, Convidado!');
    } catch (error) {
      toast.error('Falha ao entrar como convidado.');
      console.error("Erro no login como convidado:", error);
    }
  };

  const handleEmailPasswordSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      return toast.error("Por favor, preencha e-mail e senha.");
    }
    setIsLoading(true);

    try {
      if (isLoginView) {
        // CORREÇÃO 1: Usando o nome correto da função
        await signInWithEmail(email, password);
        toast.success("Login realizado com sucesso!");
      } else {
        // CORREÇÃO 2: Usando o nome correto da função
        await signUpWithEmail(email, password);
        toast.success("Conta criada com sucesso! Bem-vindo(a)!");
      }
    } catch (error) {
      const errorMessage = error.code ? error.code.replace('auth/', '').replace(/-/g, ' ') : "Ocorreu um erro";
      toast.error(`Erro: ${errorMessage}`);
      console.error("Erro no login/cadastro com e-mail:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (currentUser) return null;

  return (
    <div className="auth-form-container animate-fade-in-up">
      <h1 className="auth-title">Bem-vindo ao EducAI</h1>
      
      <button onClick={handleGoogleLogin} className="google-button">
        <img src={googleIconUrl} alt="Google" className="google-icon" />
        Entrar com Google
      </button>
      <button onClick={handleGuestLogin} className="guest-button">
        Continuar como Convidado
      </button>

      <div className="separator">ou</div>

      <form onSubmit={handleEmailPasswordSubmit}>
        <div className="input-group">
          <Mail className="input-icon" size={18} />
          <input 
            type="email" 
            placeholder="E-mail" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <Key className="input-icon" size={18} />
          <input 
            type="password" 
            placeholder="Senha (mín. 6 caracteres)"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        <button type="submit" className="form-button-primary full-width" disabled={isLoading}>
          {/* CORREÇÃO 3: Agora o <Loader /> será encontrado */}
          {isLoading ? <Loader className="animate-spin" size={20} /> : (isLoginView ? 'Entrar' : 'Criar Conta')}
        </button>
      </form>

      <button onClick={() => setIsLoginView(!isLoginView)} className="toggle-auth-view">
        {isLoginView ? 'Não tem uma conta? Crie uma agora' : 'Já tem uma conta? Faça o login'}
      </button>
    </div>
  );
}