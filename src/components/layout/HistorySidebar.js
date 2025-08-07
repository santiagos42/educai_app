import React from 'react';
import { useAuth } from '../../contexts/AuthContext'; // Dependência 1
import toast from 'react-hot-toast'; // Dependência 2
import { 
    PenSquare, CalendarDays, ClipboardList, BookOpen, 
    FileQuestion, Palette, Home, Star 
} from 'lucide-react'; // Dependência 3 (Ícones)
import InspirationalQuoteDashboard from './InspirationalQuoteDashboard'; // Dependência 4

const HistorySidebar = ({ setView, onOpenPremiumModal }) => {
  const { currentUser, userProfile } = useAuth(); // Precisamos do perfil
  const logoUrl = process.env.PUBLIC_URL + '/logo900.png';
  const tools = [
    { id: 'activityGenerator', name: 'Gerar Atividades Avaliativas', icon: <PenSquare /> },
    { id: 'planningAssistant', name: 'Assistente de Planejamento', icon: <CalendarDays /> },
    { id: 'lessonPlanGenerator', name: 'Criar Planos de Aula', icon: <ClipboardList /> },
    { id: 'summaryGenerator', name: 'Gerar Resumos Didáticos', icon: <BookOpen /> },
    { id: 'caseStudyGenerator', name: 'Criar Estudos de Caso', icon: <FileQuestion /> },
    { id: 'presentationGenerator', name: 'Gerar Roteiro de Slides', icon: <Palette /> },
  ];
    // >>> NOVA FUNÇÃO DE HANDLE (idêntica à anterior) <<<
  const handleToolClick = (toolId) => {
    if (currentUser?.isAnonymous) {
      if (toolId === 'summaryGenerator') {
        setView(toolId);
      } else {
        toast.error(
          "Crie uma conta gratuita para ter acesso limitado /nOu torne-se Premium para uma experiência completa!", 
          { duration: 5000, icon: '🔒', style: { background: '#f59e0b', color: 'white', fontWeight: 'bold'} }
        );
      }
    } else {
      setView(toolId);
    }
  };

  return (
    <aside className="w-72 bg-slate-50 p-4 border-r border-slate-200 hidden md:flex flex-col">
      {/* >>> MUDANÇA AQUI: Adiciona a logo e o slogan <<< */}
      <div className="px-2 mb-8">
        <img src={logoUrl} alt="EducAI Logo" className="w-25 h-25 mx-auto mb-2" />
        <h2 className="text-1xl font-bold text-center text-slate-600" style={{ fontFamily: "'Patrick Hand', cursive" }}>A nossa missão é otimizar o seu trabalho.</h2>
      </div>
      
      {userProfile?.plan !== 'premium' && (
        <div className="px-3 mb-6">
          <button 
            onClick={onOpenPremiumModal}
            className="w-full bg-yellow-400 text-slate-900 font-bold py-2.5 px-4 rounded-lg text-sm hover:bg-yellow-300 transition-all transform hover:scale-105 flex items-center justify-center gap-2"
          >
            <Star size={16} /> Seja Premium
          </button>
        </div>
      )}
      
      <div className="mb-6">
        <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Navegação</h3>
        <ul>
          <li>
            <button onClick={() => setView('home')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
              <Home size={20} />
              Painel Principal
            </button>
          </li>
        </ul>
      </div>

      <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ferramentas de IA</h3>
      <nav className="flex-grow overflow-y-auto">
        <ul>
          {tools.map(tool => (
            <li key={tool.id}>
              <button 
                onClick={() => handleToolClick(tool.id)} 
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors"
              >
                {React.cloneElement(tool.icon, { size: 20 })}
                {tool.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* >>> MUDANÇA AQUI: Adiciona o componente de citação <<< */}
      <div className="mt-auto">
        <InspirationalQuoteDashboard/>
      </div>
    </aside>
  );
};

export default HistorySidebar;