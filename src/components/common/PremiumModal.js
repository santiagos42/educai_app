import { X, Star, CheckCircle, Rocket } from "lucide-react";
const PremiumModal = ({ isOpen, onClose, onUpgradeClick }) => {
  if (!isOpen) return null;

  const features = [
    "Gerações de conteúdo com IA ilimitadas",
    "Drive com armazenamento ilimitado para seus arquivos",
    "Acesso a todas as ferramentas atuais e futuras",
    "Exportação para PDF e DOCX sem restrições",
    "Suporte prioritário"
  ];

  return (
    <div 
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4 animate-fade-in"
      onClick={onClose} // Fecha o modal se clicar fora
    >
      <div 
        className="bg-slate-800 text-white rounded-2xl p-8 shadow-2xl relative w-full max-w-lg border-2 border-yellow-400 animate-fade-in-up"
        onClick={(e) => e.stopPropagation()} // Impede que o clique dentro do modal o feche
      >
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:bg-slate-700 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>
        
        <div className="text-center">
          <div className="inline-block p-3 bg-yellow-400/20 rounded-full mb-4">
            <Star size={32} className="text-yellow-400" fill="currentColor" />
          </div>
          <h2 className="text-3xl font-bold mb-2">Desbloqueie o Poder Total do EducAI!</h2>
          <p className="text-slate-300 mb-6">Eleve seu planejamento de aulas e produtividade ao próximo nível com o plano Premium.</p>
        </div>

        <ul className="space-y-3 mb-8">
          {features.map((feature, index) => (
            <li key={index} className="flex items-start gap-3">
              <CheckCircle size={20} className="text-green-400 flex-shrink-0 mt-0.5" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>

        <button 
          onClick={onUpgradeClick} 
          className="w-full bg-yellow-400 text-slate-900 font-bold py-3 px-6 rounded-lg text-lg hover:bg-yellow-300 transition-all transform hover:scale-105"
        >
          <Rocket size={20} className="inline-block mr-2" />
          Tornar-se Premium Agora (R$ 29,90/mês)
        </button>
      </div>
    </div>
  );
};

export default PremiumModal;