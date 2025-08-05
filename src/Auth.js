import React, { useState, useEffect, useMemo, useRef } from 'react';
import { useAuth } from './contexts/AuthContext';
import {
  signInWithGoogle, logout, signUpWithDetails, signInWithEmail,
  signInAsGuest, sendPasswordReset
} from './firebase';
import toast from 'react-hot-toast';
import { LogOut, User, Mail, Key, Loader, Star, Check, Zap, ShieldCheck, MessageSquare, Sparkles, Rocket, Clock, Cpu, FolderClock, GraduationCap, Palette} from 'lucide-react';
import { loadStripe } from '@stripe/stripe-js';

// --- Assets ---
const googleIconUrl = process.env.PUBLIC_URL + '/google.svg';
const logoUrl = process.env.PUBLIC_URL + '/logo900.png';


// =================================================================================
// NOVO COMPONENTE 1: PAINEL DE PLANOS (PRICING)
// =================================================================================


// Coloque sua chave PUBLICÁVEL aqui
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLISHABLE_KEY);

const PricingTiers = ({ onNavigate }) => {
  const { currentUser } = useAuth(); // Pegamos o usuário para enviar o UID

  // Função específica para o clique no botão Premium
  const handlePremiumClick = async () => {
    const toastId = toast.loading("Redirecionando para o pagamento...");

    if (!currentUser || currentUser.isAnonymous) {
      toast.error("Você precisa criar uma conta para se tornar Premium.", { id: toastId });
      // Leva o usuário para a tela de cadastro se ele for convidado ou não estiver logado
      onNavigate('signup');
      return;
    }
    
    try {
      // Substitua pela URL real da sua Cloud Function
      const functionUrl = "https://us-central1-appeducai.cloudfunctions.net/createCheckoutSession";

      const response = await fetch(functionUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: currentUser.uid }),
      });

      const session = await response.json();

      if (!response.ok) {
        throw new Error(session.error || "Ocorreu um erro no servidor.");
      }
      
      const stripe = await stripePromise;
      await stripe.redirectToCheckout({ sessionId: session.id });
      toast.dismiss(toastId);

    } catch (error) {
      toast.error(`Falha ao iniciar o pagamento: ${error.message}`, { id: toastId });
    }
  };

  return (
    <div className="pricing-card">
      {/* Card do Plano Freemium */}
      <div className="plan-item">
        <div className="plan-header">
          <h3 className="plan-name">Plano Freemium</h3>
          <p className="plan-description">Ideal para explorar as funcionalidades essenciais.</p>
        </div>
        <div className="plan-price">
          R$0<span className="plan-period">/para sempre</span>
        </div>
        <ul className="plan-features">
          <li><Check size={16} className="feature-check-icon"/><span>Acesso limitado</span></li>
          <li><Check size={16} className="feature-check-icon"/><span>10 gerações de conteúdo por mês</span></li>
          <li><Check size={16} className="feature-check-icon"/><span>Salvar até 15 arquivos no Drive</span></li>
        </ul>
        {/* O botão Freemium leva para a tela de cadastro */}
        <button 
          onClick={() => onNavigate('signup')} 
          className="plan-button secondary-button"
        >
          <Zap size={16} className="mr-2"/>Criar Conta Gratuita
        </button>
      </div>

      {/* Card do Plano Premium */}
      <div className="plan-item primary">
        <div className="recommend-badge"><Star size={12} className="mr-1.5"/> Mais Popular</div>
        <div className="plan-header">
          <h3 className="plan-name">Plano Premium</h3>
          <p className="plan-description">Desbloqueie todo o potencial da plataforma.</p>
        </div>
        <div className="plan-price">
          R$29,90<span className="plan-period">/mês</span>
        </div>
        <ul className="plan-features">
          <li><Check size={16} className="feature-check-icon"/><span>Gerações de conteúdo ilimitadas</span></li>
          <li><Check size={16} className="feature-check-icon"/><span>Drive com armazenamento ilimitado</span></li>
          <li><Check size={16} className="feature-check-icon"/><span>Acesso a todas as funcionalidades</span></li>
        </ul>
        {/* >>> A CORREÇÃO ESTÁ AQUI <<< */}
        {/* O botão Premium chama a função handlePremiumClick */}
        <button 
          onClick={handlePremiumClick} 
          className="plan-button primary-button"
        >
          <Zap size={16} className="mr-2"/>Seja Premium
        </button>
      </div>
    </div>
  );
};


// =================================================================================
// COMPONENTE DE MARKETING 
// =================================================================================
const AuthMarketing = ({ onScrollClick }) => { // A prop agora é onScrollClick
  return (
    <div className="flex flex-col justify-center items-center text-center h-full p-8 text-white">
      <img 
        src={logoUrl} 
        alt="EducAI Logo" 
        className="w-100 h-100 lg:w-64 lg:h-64 xl:w-72 xl:h-72 mb-6 transition-all duration-300"
      />
      <h2 className="text-4xl font-bold text-center mb-4" style={{ fontFamily: "'Patrick Hand', cursive" }}>
        Transforme sua forma de ensinar
      </h2>
      <p className="text-slate-200 max-w-sm mb-8">
        O EducAI é seu copiloto inteligente para uma sala de aula mais dinâmica e organizada.
      </p>
      <button 
        onClick={onScrollClick} // Usa a nova função de scroll
        className="cta-features-button"
      >
        Conheça as Funcionalidades ↓
      </button>
    </div>
  );
};

const FeaturesScreen = ({ onNavigate }) => {
  // Reutilizamos os mesmos painéis de antes, talvez com descrições mais completas
  const allFeatures = [
    { icon: <Cpu size={28} />, title: "Geração Inteligente", description: "Crie planos de aula, atividades, simulados e resumos completos em segundos. Nossa IA é treinada para entender as nuances pedagógicas e entregar materiais de alta qualidade que você pode usar imediatamente." },
    { icon: <Clock size={28} />, title: "Foco no que Importa", description: "A maior queixa dos professores é a falta de tempo. Reduza horas de trabalho burocrático e planejamento em minutos. Deixe a IA cuidar das tarefas repetitivas para que você possa se dedicar ao que ama: ensinar e interagir com seus alunos." },
    { icon: <FolderClock size={28} />, title: "Organização Total", description: "Diga adeus às pastas perdidas no seu computador. Gerencie todos os seus materiais em um Drive intuitivo e seguro, organizado por turma, matéria ou projeto. Acesse de qualquer lugar, a qualquer hora." },
    { icon: <GraduationCap size={28} />, title: "Alinhamento com a BNCC", description: "Garanta uma prática pedagógica sempre atualizada. Gere conteúdo que já considera as habilidades e competências da Base Nacional Comum Curricular, facilitando seu planejamento e garantindo a relevância do ensino." },
    { icon: <Palette size={28} />, title: "Formatos Profissionais", description: "Exporte seus conteúdos para PDF e DOCX com um único clique. Os documentos já saem com formatação limpa e cabeçalhos profissionais, prontos para imprimir e entregar aos seus alunos ou coordenação." },
    { icon: <MessageSquare size={28} />, title: "Feedback Inteligente", description: "Crie gabaritos comentados e sugestões de respostas para suas atividades em segundos. Facilite o processo de correção e forneça retornos mais ricos e construtivos para o desenvolvimento dos estudantes." },
    { icon: <Sparkles size={28} />, title: "Aulas Mais Dinâmicas", description: "Saia da rotina. Gere estudos de caso, roteiros para debates e projetos que capturam a atenção dos alunos, promovem o pensamento crítico e tornam o aprendizado uma experiência memorável." },
    { icon: <ShieldCheck size={28} />, title: "Seguro e Acessível", description: "Sua privacidade e a segurança dos seus dados são nossa prioridade máxima. Utilizamos as melhores práticas de segurança para que você possa focar no que importa sem preocupações." },
    { icon: <Rocket size={28} />, title: "Suporte Contínuo", description: "O EducAI é uma plataforma viva, em constante evolução. Lançamos novas ferramentas e atualizações regularmente, muitas delas baseadas diretamente no feedback de professores como você." }
  ];

  return(
    <div className="w-full min-h-screen text-white px-4 py-16 sm:px-8 sm:py-24 lg:px-12 lg:py-32 animate-fade-in">
      <div className="max-w-7xl mx-auto">
        {/* Cabeçalho e CTA */}
        <header className="text-center mb-12 md:mb-20">
          <h1 className="text-4xl md:text-6xl font-bold" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            Uma Plataforma Completa Para o <span className="text-sky-400">Educador Moderno</span>
          </h1>
          <p className="mt-4 max-w-3xl mx-auto text-lg text-slate-300">
            Explore as ferramentas que estão revolucionando o planejamento de aulas e a criação de conteúdo pedagógico.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <button onClick={() => onNavigate('signup')} className="form-button-primary px-8 py-3 text-lg">
              Começar Agora (Grátis)
            </button>
            <button onClick={() => onNavigate('signup')} className="form-button-secondary px-8 py-3 text-lg">
              Voltar para o Login
            </button>
          </div>
        </header>

        {/* Grid de Funcionalidades */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {allFeatures.map((feature, index) => (
            <div key={index} className="feature-card-detailed">
              <div className="feature-icon">{feature.icon}</div>
              <h3 className="feature-title-detailed">{feature.title}</h3>
              <p className="feature-description-detailed">{feature.description}</p>
            </div>
          ))}
        </div>
        
        {/* Seção de Marketing Adicional: FAQ */}
        <section className="mt-20 max-w-4xl mx-auto">
          <h2 className="text-3xl font-bold text-center mb-8">Perguntas Frequentes</h2>
          <div className="space-y-4">
            <details className="faq-item">
              <summary>O plano Freemium é grátis para sempre?</summary>
              <p>Sim! O plano Freemium permite que você utilize as funcionalidades essenciais da plataforma com um limite mensal de gerações, sem custo e sem necessidade de cartão de crédito.</p>
            </details>
            <details className="faq-item">
              <summary>Meus dados e materiais estão seguros?</summary>
              <p>Absolutamente. A segurança e privacidade são nossa maior prioridade. Utilizamos criptografia de ponta e as melhores práticas do mercado para proteger todas as informações em sua conta.</p>
            </details>
             <details className="faq-item">
              <summary>Posso cancelar meu plano a qualquer momento?</summary>
              <p>Sim. Você tem total controle sobre sua assinatura. O cancelamento pode ser feito de forma simples e rápida diretamente no seu painel de controle, sem burocracia.</p>
            </details>
          </div>
        </section>

      </div>
    </div>
  );
};

// =================================================================================
// FORMULÁRIOS (SEM MUDANÇAS NA LÓGICA, APENAS ESTILO)
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
    // A MENSAGEM CORRETA PARA LOGIN
    toast.error("Falha no login. Verifique seu e-mail e senha.");
    console.error("Erro no login:", error); 
  } finally {
    setIsLoading(false);
  }
};
  
  return (
    <form onSubmit={handleLogin} className="space-y-4">
      <div className="input-group">
        <Mail className="input-icon" />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="auth-input"/>
      </div>
      <div className="input-group">
        <Key className="input-icon" />
        <input type="password" placeholder="Senha" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input"/>
      </div>
      <button type="submit" className="form-button-primary w-full" disabled={isLoading}>
        {isLoading ? <Loader className="animate-spin" size={20} /> : 'Entrar'}
      </button>
      <button type="button" onClick={() => setView('forgotPassword')} className="text-xs text-slate-100 hover:text-blue-600 hover:underline">
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
  const [isLoading, setIsLoading] = useState(false);

  const handleSignUp = async (e) => {
    e.preventDefault();
    if (password.length < 6) {
        toast.error("A senha deve ter pelo menos 6 caracteres.");
        return;
    }
    if (password !== confirmPassword) {
      toast.error("As senhas não coincidem.");
      return;
    }
    setIsLoading(true);
    try {
      await signUpWithDetails(email, password, firstName, lastName, "");
      toast.success("Conta criada! Verifique seu e-mail para continuar.");
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        toast.error("Este e-mail já está em uso. Tente fazer login.");
      } else {
        toast.error(`Falha ao criar conta: ${error.message}`);
      }
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="input-group">
          <User className="input-icon" />
          <input type="text" placeholder="Nome" value={firstName} onChange={e => setFirstName(e.target.value)} required className="auth-input"/>
        </div>
        <div className="input-group">
          <User className="input-icon" />
          <input type="text" placeholder="Sobrenome" value={lastName} onChange={e => setLastName(e.target.value)} required className="auth-input"/>
        </div>
      </div>
      <div className="input-group">
        <Mail className="input-icon" />
        <input type="email" placeholder="E-mail" value={email} onChange={e => setEmail(e.target.value)} required className="auth-input"/>
      </div>
      <div className="input-group">
        <Key className="input-icon" />
        <input type="password" placeholder="Senha (mín. 6 caracteres)" value={password} onChange={e => setPassword(e.target.value)} required className="auth-input"/>
      </div>
      <div className="input-group">
        <Key className="input-icon" />
        <input type="password" placeholder="Confirme a senha" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required className="auth-input"/>
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

// =================================================================================
// CITAÇÕES INSPIRADORAS (COM NOVA PALETA DE CORES)
// =================================================================================
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
    }, 6000);
    return () => clearInterval(timer);
  }, [quotes]);
  
  return (
    <div className="text-center animate-fade-in">
      <p className="text-sm italic text-slate-50">"{currentQuote.text}"</p>
      <p className="text-xs font-bold text-slate-50 mt-2">- {currentQuote.author}</p>
    </div>
  );
};


// =================================================================================
// TELA DE AUTENTICAÇÃO PRINCIPAL (TOTALMENTE REESTRUTURADA)
// =================================================================================
export function AuthScreen() {
  const [authView, setAuthView] = useState('login');
  const featuresRef = useRef(null);
  const topRef = useRef(null);

  const handleNavigation = (targetView) => {
    if (targetView === 'login' || targetView === 'signup') {
      topRef.current?.scrollIntoView({ behavior: 'smooth' });
      setAuthView(targetView);
    } else if (targetView === 'features') {
      featuresRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };
  
  const handleGoogleLogin = async () => { try { await signInWithGoogle(); toast.success('Login bem-sucedido!'); } catch (error) { toast.error('Falha no login com Google.'); } };
  const handleGuestLogin = async () => { try { await signInAsGuest(); toast.success('Entrando como convidado!'); } catch (error) { toast.error('Falha ao entrar como convidado.'); } };
  const titles = { login: "Acesse sua conta ou registre-se", signup: "Crie sua Conta", forgotPassword: "Recuperar Senha" };

  return (
    <div>
      {/* SEÇÃO 1: ACIMA DA DOBRA */}
      <section ref={topRef} className="w-full flex items-center justify-center p-4 lg:min-h-screen">
        
        {/* >>> MUDANÇA PRINCIPAL AQUI <<< */}
        {/*
          - Por padrão (mobile), é um flex-col com gap grande.
          - A partir do breakpoint 'lg', vira um flex-row com gap menor.
        */}
        <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-8">
          
          {/* COLUNA 1 (ESQUERDA NO DESKTOP): AUTENTICAÇÃO */}
          {/*
            - order-2: Em mobile, aparece em segundo lugar.
            - lg:order-1: Em desktop, volta para a primeira posição.
            - w-full lg:w-1/3: Ocupa toda a largura no mobile, e 1/3 no desktop.
          */}
          <div className="w-full lg:w-1/3 order-2 lg:order-1">
            <div className="auth-card"> {/* A classe auth-card já define max-width e etc. */}
              <div className="w-full flex flex-col justify-between h-full">
                <div>
                  <h2 className="text-3xl font-bold text-slate-100 mb-6 text-center">{titles[authView]}</h2>
                  {authView === 'login' && <LoginForm setView={setAuthView} />}
                  {authView === 'signup' && <SignUpForm setView={setAuthView} />}
                  {authView === 'forgotPassword' && <ForgotPasswordForm setView={setAuthView} />}
                  <div className="text-center mt-4">
                    {authView === 'login' && <button onClick={() => setAuthView('signup')} className="toggle-auth-view">Não tem uma conta? <strong>Crie uma agora</strong></button>}
                    {(authView === 'signup' || authView === 'forgotPassword') && <button onClick={() => setAuthView('login')} className="toggle-auth-view">Já tem uma conta? <strong>Faça o login</strong></button>}
                  </div>
                  <div className="separator">ou continue com</div>
                  <div className="flex flex-col sm:flex-row gap-4 mt-2">
                    <button onClick={handleGoogleLogin} className="social-button"><img src={googleIconUrl} alt="Google" className="w-5 h-5" /> Google</button>
                    <button onClick={handleGuestLogin} className="social-button"><User size={18}/> Convidado</button>
                  </div>
                </div>
                <div className="mt-8 pt-6 border-t border-slate-100"><InspirationalQuote /></div>
              </div>
            </div>
          </div>

          {/* COLUNA 2 (CENTRAL NO DESKTOP): MARKETING */}
          {/*
            - order-1: Em mobile, aparece primeiro, no topo.
            - lg:order-2: Em desktop, vai para o centro.
          */}
          <div className="w-full lg:w-1/3 order-1 lg:order-2">
            <AuthMarketing onScrollClick={() => handleNavigation('features')} />
          </div>

          {/* COLUNA 3 (DIREITA NO DESKTOP): PLANOS */}
          {/*
            - order-3: Em mobile e desktop, é sempre o último.
          */}
          <div className="w-full lg:w-1/3 order-3">
            <PricingTiers onNavigate={handleNavigation} />
          </div>
          
        </div>
      </section>

      {/* SEÇÃO 2: "ABAIXO DA DOBRA" */}
      <section ref={featuresRef} className="mt-20 lg:mt-0">
        <FeaturesScreen onNavigate={handleNavigation} />
      </section>
    </div>
  );
}
