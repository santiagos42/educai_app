import { useAuth } from '../contexts/AuthContext';
import AuthHeader from '../components/layout/AuthHeader';
import AnimatedBackground from '../components/common/AnimatedBackground';
import DrivePreview from '../components/drive/DrivePreview';
import FeatureNoteCard from '../components/common/FeatureNoteCard';
import { PenSquare, CalendarDays, ClipboardList, BookOpen, FileQuestion, Palette } from 'lucide-react';
import { useMemo } from 'react';
import toast from 'react-hot-toast';

const WhiteboardHomeScreen = ({ setView, onOpenPremiumModal }) => {
  const { currentUser } = useAuth(); // Só precisamos do currentUser aqui por enquanto
  const logoUrl = process.env.PUBLIC_URL + '/logohome.png';

  const features = [
    { id: 'activityGenerator', icon: <PenSquare />, title: "Gerar Atividades Avaliativas", description: "Crie avaliações, exercícios, simulados e mais." },
    { id: 'planningAssistant', icon: <CalendarDays />, title: "Assistente de Planejamento", description: "Organize sua semana, seu bimestre, seu ano letivo.", isHighlighted: true },
    { id: 'lessonPlanGenerator', icon: <ClipboardList />, title: "Criar Planos de Aula", description: "Elabore planos de aula completos e alinhados à BNCC." },
    { id: 'summaryGenerator', icon: <BookOpen />, title: "Gerar Resumos Didáticos", description: "Elabore resumos didáticos de qualidade sobre diversos temas." },
    { id: 'caseStudyGenerator', icon: <FileQuestion />, title: "Criar Estudos de Caso", description: "Gere cenários práticos que abordam de forma brilhante qualquer assunto.", isHighlighted: true },
    { id: 'presentationGenerator', icon: <Palette />, title: "Gerar Roteiro de Slides", description: "Crie roteiros para apresentações." }
  ];

  const noteColors = useMemo(() => {
    return [
      { bg: 'bg-yellow-200/80', border: 'border-yellow-400' },
      { bg: 'bg-sky-200/80', border: 'border-sky-400' },
      { bg: 'bg-green-200/80', border: 'border-green-400' },
      { bg: 'bg-pink-200/80', border: 'border-pink-400' },
      { bg: 'bg-purple-200/80', border: 'border-purple-400' },
      { bg: 'bg-orange-200/80', border: 'border-orange-400' }
    ].sort(() => 0.5 - Math.random());
  }, []);

  const handleFeatureClick = (featureId) => {
    if (currentUser?.isAnonymous) {
      if (featureId === 'summaryGenerator') {
        setView(featureId);
      } else {
        toast.error(
          "Crie uma conta para ter acesso limitado ou torne-se Premium!",
          { duration: 5000, icon: '🔒', style: { background: '#f59e0b', color: 'white', fontWeight: 'bold'} }
        );
      }
    } else {
      setView(featureId);
    }
  };

  return (
    <div className="whiteboard-bg w-full min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 relative">
      {/* Passamos a prop para o AuthHeader */}
      <header className="absolute top-0 right-0 p-4 z-20">
        <AuthHeader onOpenPremiumModal={onOpenPremiumModal} />
      </header>

        <AnimatedBackground />
        <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto">
          
          <div className="text-center mb-10 md:mb-12">
            <img
              src={logoUrl}
              alt="EducAI Logo"
              className="mx-auto w-48 h-48 md:w-60 md:h-60 drop-shadow-lg"
            />

            <h1 className="text-4xl md:text-5xl font-bold text-slate-800 mt-4" style={{ fontFamily: "'Patrick Hand', cursive" }}>
              {currentUser && !currentUser.isAnonymous && currentUser.displayName
                ? `Olá, ${currentUser.displayName.split(' ')[0]}!`
                : 'Seu Assistente Pessoal de IA'
              }
            </h1>
          
            <p className="text-lg md:text-xl text-slate-500 mt-2 font-sans">
              Aproveite as funcionalidades da nossa plataforma para criar, organizar e compartilhar conteúdos educacionais de forma rápida e eficiente.
            </p>
          </div>
        
          <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div className="animate-fade-in-up">
              <DrivePreview setView={setView} />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {features.map((feature, index) => (
                <div key={feature.id} className="animate-fade-in-up" style={{ animationDelay: `${150 * (index + 1)}ms` }}>
                  <FeatureNoteCard 
                    onClick={() => handleFeatureClick(feature.id)} 
                    icon={feature.icon} 
                    title={feature.title} 
                    description={feature.description} 
                    isHighlighted={feature.isHighlighted} 
                    color={noteColors[index % noteColors.length]}
                  />
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
  );
};

export default WhiteboardHomeScreen;