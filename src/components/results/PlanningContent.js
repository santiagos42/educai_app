import CopyButton from '../common/CopyButton';
import Editable from '../common/Editable';

import { ClipboardList, BookOpen, PenSquare, FileQuestion, Palette } from 'lucide-react';

const PlanningContent = ({ result, onContentChange, onOpenModal }) => {
  const getTextToCopy = () => { if (!result || !result.schedule) return ""; return (result.schedule || []).map(item => `${item.date}: ${item.activity}`).join('\n'); };
  return (
    <div className="p-8 document-font">
      <div className="content-header-with-copy"><Editable path={['className']} as="h2" className="text-2xl font-bold text-center" onContentChange={onContentChange}>{`Planejamento - ${result.className}`}</Editable><CopyButton textToCopy={getTextToCopy} title="Copiar cronograma" /></div>
      <Editable path={['teacherName']} as="p" className="text-lg text-center" onContentChange={onContentChange}>{`Prof(a): ${result.teacherName || 'A ser preenchido'} | Disciplina: ${result.discipline}`}</Editable>
      <p className="text-sm mt-2 text-center text-gray-600 mb-8"><strong>Assuntos:</strong> {result.subjects}</p>
      <div className="space-y-3">{(result.schedule || []).map((item, index) => (<p key={index} className="break-inside-avoid"><strong><Editable path={['schedule', index, 'date']} as="span" onContentChange={onContentChange}>{item.date}</Editable></strong>{': '}<Editable path={['schedule', index, 'activity']} as="span" onContentChange={onContentChange}>{item.activity}</Editable></p>))}</div>
      <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
        <h3 className="section-title">Atividades Sugeridas</h3>
        <p className="mb-4 text-sm text-gray-600" style={{textAlign: 'left', lineHeight: '1.4'}}>Para cada tópico do seu planejamento, gere materiais de apoio com um único clique. A IA usará o tema da aula como base para criar o conteúdo, que será aberto em uma nova tela para edição e download.</p>
        <div className="space-y-4">
          {(result.schedule || []).map((item, index) => (
            <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200 break-inside-avoid">
              <p className="font-bold text-slate-800 text-base" style={{textAlign: 'left'}}>{item.date}: <span className="font-normal">{item.activity}</span></p>
              <div className="flex items-center gap-2 mt-2 flex-wrap">
                <button onClick={() => onOpenModal({ type: 'lessonPlanGenerator', topic: item.activity })} className="sug-button"><ClipboardList size={14} className="mr-1.5"/> Plano de Aula</button>
                <button onClick={() => onOpenModal({ type: 'summaryGenerator', topic: item.activity })} className="sug-button"><BookOpen size={14} className="mr-1.5"/> Resumo</button>
                <button onClick={() => onOpenModal({ type: 'activityGenerator', topic: item.activity })} className="sug-button"><PenSquare size={14} className="mr-1.5"/> Atividades</button>
                <button onClick={() => onOpenModal({ type: 'caseStudyGenerator', topic: item.activity })} className="sug-button"><FileQuestion size={14} className="mr-1.5"/> Estudo de Caso</button>
                <button onClick={() => onOpenModal({ type: 'presentationGenerator', topic: item.activity })} className="sug-button"><Palette size={14} className="mr-1.5"/> Gerar Slides</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PlanningContent;