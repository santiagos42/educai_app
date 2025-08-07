import { useState, useEffect } from 'react';
import './styles.css';
import toast, { Toaster } from 'react-hot-toast';

// Imports de Autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen } from './Auth'; 

//stripe
import { loadStripe } from '@stripe/stripe-js';

// COMPONENTES DE UI E CONTEÚDO
import { Loader }from 'lucide-react'; // ÍCONES

import PremiumModal from './components/common/PremiumModal';

// PÁGINAS - DASHBOARD E TELAS
import WhiteboardHomeScreen from './pages/HomePage';
import GeneratorScreen from './pages/GeneratorPage';
import HistoryScreen from './pages/DrivePage';
import VerifyEmailScreen from './pages/VerifyEmailPage';
import ResultScreen from './pages/ResultPage';

// =================================================================================
// COMPONENTE PRINCIPAL E LÓGICA DE ROTEAMENTO
// =================================================================================

function AppContent() {
  const { currentUser } = useAuth();
  
  // >>> MUDANÇA 1: O estado agora é um array (pilha de histórico) <<<
  const [history, setHistory] = useState(['home']);
  const [result, setResult] = useState(null);
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Meu Drive' }]);
  const [isPremiumModalOpen, setIsPremiumModalOpen] = useState(false);
  // A view atual é sempre o último item do histórico.
  const currentView = history[history.length - 1];

const handleUpgradeClick = async () => {
  setIsPremiumModalOpen(false); 
  const toastId = toast.loading("Redirecionando para o pagamento...");

  if (!currentUser || !currentUser.uid) {
    toast.error("Erro: Usuário não está logado. Por favor, atualize a página.", { id: toastId });
    return;
  }
  
  try {
    // Chave Publicável de PRODUÇÃO diretamente aqui. É seguro.
    const STRIPE_PUBLISHABLE_KEY = "pk_live_51RsTZO1zTGztNQWqUHfbSWC0croX1IvzdlE98L9GOLFqlUrjylei9uatfNaiX7xHXPxuNnROT7Kb4jo0Mv60wgvc006jsqwiLR";

    const stripePromise = loadStripe(STRIPE_PUBLISHABLE_KEY);
    const stripe = await stripePromise;

    if (!stripe) {
      throw new Error("Stripe.js não carregou. Verifique a conexão com a internet.");
    }
    
    const functionUrl = "https://us-central1-appeducai.cloudfunctions.net/createCheckoutSession";

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId: currentUser.uid }),
    });

    const session = await response.json();

    if (!response.ok) {
      throw new Error(session.error?.message || "Ocorreu um erro desconhecido no servidor.");
    }
    
    if (!session || !session.id) {
        throw new Error("ID da sessão inválido retornado pelo servidor.");
    }

    await stripe.redirectToCheckout({ sessionId: session.id });
    toast.dismiss(toastId);

  } catch (error) {
    console.error('ERRO NO FLUXO DE CHECKOUT:', error); 
    toast.error(`Falha: ${error.message}`, { id: toastId });
  }
};

  useEffect(() => {
    // Se o usuário deslogar, reseta o histórico para a tela inicial.
    if (!currentUser) {
      setHistory(['home']);
      setResult(null);
    }
  }, [currentUser]);

  // >>> MUDANÇA 2: Novas funções de navegação <<<

  // Função para navegar para uma NOVA tela (adiciona ao histórico)
  const navigateTo = (view) => {
    setHistory(prev => [...prev, view]);
  };
  
  // Função para VOLTAR para a tela anterior (remove do histórico)
  const navigateBack = () => {
    // Impede que o usuário volte além da tela inicial
    if (history.length > 1) {
      setHistory(prev => prev.slice(0, -1));
    }
  };
  
  // Função para definir o resultado e ir para a tela de resultado
  const handleSetResult = (newResult) => {
    setResult(newResult);
    navigateTo('result');
  };
  
  // Função para carregar um arquivo do histórico do Drive
  const loadGenerationFromHistory = (content) => {
    setResult(content);
    navigateTo('result');
  };
  
  // >>> MUDANÇA 3: O switch agora usa 'currentView' e passa as novas funções <<<
    return (
        <>
        {/* O Modal Premium agora vive aqui, no nível mais alto, pronto para ser chamado */}
        <PremiumModal 
            isOpen={isPremiumModalOpen}
            onClose={() => setIsPremiumModalOpen(false)}
            onUpgradeClick={handleUpgradeClick}
        />

        {/* 
            A estrutura abaixo executa o seu switch-case original, 
            apenas adicionando a nova prop 'onOpenPremiumModal'.
            NENHUMA FUNCIONALIDADE EXISTENTE FOI REMOVIDA.
        */}
        {(() => {
            switch (currentView) {
            case 'history': 
                return (
                <HistoryScreen 
                    setView={navigateTo} 
                    loadGeneration={loadGenerationFromHistory}
                    currentFolderId={currentFolderId}
                    setCurrentFolderId={setCurrentFolderId}
                    breadcrumbs={breadcrumbs}
                    setBreadcrumbs={setBreadcrumbs}
                    // Prop nova adicionada:
                    onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
                />
                );

            case 'result': 
                if (!result) {
                // Este caso é para segurança, se o usuário chegar em /result sem dados
                return (
                    <HistoryScreen 
                    setView={navigateTo} 
                    loadGeneration={loadGenerationFromHistory}
                    currentFolderId={currentFolderId}
                    setCurrentFolderId={setCurrentFolderId}
                    breadcrumbs={breadcrumbs}
                    setBreadcrumbs={setBreadcrumbs}
                    onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
                    />
                );
                }
                // A tela de resultado principal
                return (
                <ResultScreen 
                    setView={navigateTo} 
                    setResult={handleSetResult} 
                    result={result} 
                    goBack={navigateBack} 
                    // Prop nova adicionada:
                    onOpenPremiumModal={() => setIsPremiumModalOpen(true)}
                />
                );
                
            case 'home': 
                return (
                <WhiteboardHomeScreen 
                    setView={navigateTo}
                />
                );
                
            default: 
                return (
                <GeneratorScreen 
                    setView={navigateTo} 
                    setResult={handleSetResult} 
                    type={currentView} 
                    goBack={navigateBack} 
                />
                );
            }
        })()}
        </>
    );
    } // Fim da função AppContent

function AppGatekeeper() {
  const { currentUser, loading } = useAuth(); // Só precisa destes dois.

  if (loading) {
    return (
      <div className="w-full min-h-screen flex items-center justify-center bg-slate-900">
        <Loader className="animate-spin text-sky-500" size={48} />
      </div>
    );
  }
  
  if (currentUser) {
    if (!currentUser.emailVerified && !currentUser.isAnonymous) {
      return (
        <div className="w-full min-h-screen flex items-center justify-center bg-slate-100">
          <VerifyEmailScreen />
        </div>
      );
    }
    return <AppContent />;
  }

  return (
    <div className="auth-modern-bg">
      <AuthScreen />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000, style: { background: '#363636', color: '#fff' } }} />
      <main>
        <AppGatekeeper />
      </main>
    </AuthProvider>
  );
}