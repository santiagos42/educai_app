import CopyButton from '../common/CopyButton';
import Editable from '../common/Editable';


const LessonPlanContent = ({ result, onContentChange }) => {
  const getTextToCopy = () => { if (!result || !result.plan) return ""; const { plan, topic, grade } = result; const sections = [`Plano de Aula: ${topic}`, `Série/Nível: ${grade}`, '', 'Objetivos:', ...(plan.objectives || []).map(o => `• ${o}`), '', 'Habilidades (BNCC):', ...(plan.bnccSkills || []).map(s => `• ${s}`), '', 'Desenvolvimento:', ...(plan.development || []).map((d, i) => `${i + 1}. ${d}`), '', 'Recursos:', ...(plan.resources || []).map(r => `• ${r}`), '', 'Avaliação:', ...(plan.assessment || []).map(a => `• ${a}`)]; return sections.join('\n'); };
  return (
    <div className="p-8 document-font">
      <div className="content-header-with-copy">
        <Editable path={['topic']} as="h2" className="text-2xl font-bold text-center mb-2" onContentChange={onContentChange}>{result.topic}</Editable>
        <CopyButton textToCopy={getTextToCopy} title="Copiar plano de aula" />
      </div>
      <Editable path={['grade']} as="p" className="text-center mb-6" onContentChange={onContentChange}>{result.grade}</Editable>
      <div className="space-y-4">
        <div><h3 className="section-title">Objetivos</h3><ul className="list-disc pl-5">{(result.plan.objectives || []).map((o, i) => <li key={i}><Editable path={['plan', 'objectives', i]} onContentChange={onContentChange} as="span">{o}</Editable></li>)}</ul></div>
        <div><h3 className="section-title">Habilidades (BNCC)</h3><ul className="list-disc pl-5">{(result.plan.bnccSkills || []).map((s, i) => <li key={i}><Editable path={['plan', 'bnccSkills', i]} onContentChange={onContentChange} as="span">{s}</Editable></li>)}</ul></div>
        <div><h3 className="section-title">Desenvolvimento</h3><ol className="list-decimal pl-5">{(result.plan.development || []).map((d, i) => <li key={i}><Editable path={['plan', 'development', i]} onContentChange={onContentChange} as="span">{d}</Editable></li>)}</ol></div>
        <div><h3 className="section-title">Recursos</h3><ul className="list-disc pl-5">{(result.plan.resources || []).map((r, i) => <li key={i}><Editable path={['plan', 'resources', i]} onContentChange={onContentChange} as="span">{r}</Editable></li>)}</ul></div>
        <div><h3 className="section-title">Avaliação</h3><ul className="list-disc pl-5">{(result.plan.assessment || []).map((a, i) => <li key={i}><Editable path={['plan', 'assessment', i]} onContentChange={onContentChange} as="span">{a}</Editable></li>)}</ul></div>
      </div>
    </div>
  );
};

export default LessonPlanContent;