import React, { useMemo } from 'react';
const FeatureNoteCard = ({ icon, title, description, onClick, isHighlighted, color }) => {
  const rotation = useMemo(() => Math.random() * 4 - 2, []);
  return (
    <div onClick={onClick} className={`relative p-5 rounded-lg shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 hover:-rotate-1 flex flex-col h-full ${color.bg} border-b-4 ${color.border} ${isHighlighted ? 'ring-4 ring-offset-2 ring-yellow-400' : ''}`} style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="flex items-center gap-3 mb-2">
        <div className="flex-shrink-0">{React.cloneElement(icon, { size: 24, className: "text-slate-700" })}</div>
        <h3 className="text-xl font-bold text-slate-800" style={{ fontFamily: "'Patrick Hand', cursive" }}>{title}</h3>
      </div>
      <p className="text-slate-600 text-sm mb-3 flex-grow">{description}</p>
      <div className="mt-auto text-right text-sm font-bold text-slate-600 hover:text-slate-900">Criar agora →</div>
    </div>
  );
};

export default FeatureNoteCard;