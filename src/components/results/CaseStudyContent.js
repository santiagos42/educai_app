import CopyButton from '../common/CopyButton';
import Editable from '../common/Editable';

const CaseStudyContent = ({ result, onContentChange }) => {
  const getTextToCopy = () => { if (!result || !result.case) return ""; const { case: caseData, topic, grade } = result; const sections = [`Estudo de Caso: ${caseData.title || topic}`, `Série/Nível: ${grade}`, '', 'Contexto:', caseData.context || '', '', 'Problema Central:', caseData.problem || '', '', 'Questões para Discussão:', (caseData.discussion_points || []).map((p, i) => `${i + 1}. ${p.question}`).join('\n')]; return sections.join('\n\n'); };
  return (
    <div className="p-8 document-font">
      <div className="content-header-with-copy"><Editable path={['case', 'title']} as="h2" className="text-2xl font-bold text-center mb-2" onContentChange={onContentChange}>{result.case.title}</Editable><CopyButton textToCopy={getTextToCopy} title="Copiar estudo de caso" /></div>
      <p className="text-center text-gray-600 mb-6">Estudo de Caso: {result.topic} ({result.grade})</p>
      <div className="space-y-4">
        <div><h3 className="section-title">Contexto</h3><Editable path={['case', 'context']} as="p" onContentChange={onContentChange}>{result.case.context}</Editable></div>
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><h3 className="font-bold text-red-800 mb-1">Problema Central</h3><Editable path={['case', 'problem']} as="p" className="text-red-900" onContentChange={onContentChange}>{result.case.problem}</Editable></div>
        <div>
          <h3 className="section-title">Questões para Discussão</h3>
          <ol className="list-decimal pl-5">{(result.case.discussion_points || []).map((point, i) => (<li key={i}><Editable path={['case', 'discussion_points', i, 'question']} as="span" onContentChange={onContentChange}>{point.question}</Editable></li>))}</ol>
        </div>
      </div>
    </div>
  );
};

export default CaseStudyContent;