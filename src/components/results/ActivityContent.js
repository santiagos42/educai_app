import SchoolHeader from './SchoolHeader';
import CopyButton from '../common/CopyButton';
import Editable from '../common/Editable';

const ActivityContent = ({ result, onContentChange, headerRef }) => {
  const getTextToCopy = () => { if (!result.questions || result.questions.length === 0) return ""; return result.questions.map((q, index) => { let questionText = `${index + 1}. ${q.statement}`; if (q.options && q.options.length > 0) { const optionsText = q.options.map((opt, i) => `  ${'abcde'[i]}) ${opt}`).join('\n'); questionText += `\n${optionsText}`; } return questionText; }).join('\n\n'); };
  return (
    <div className="p-8 document-font">
      <SchoolHeader headerRef={headerRef} />
      <div className="content-header-with-copy">
        <h2 className="text-2xl font-bold text-center mb-6">Atividade Avaliativa</h2>
        <CopyButton textToCopy={getTextToCopy} title="Copiar todas as questões" />
      </div>
      <div className="two-column-layout">
        {(result.questions || []).map((q, index) => (
          <div key={index} className="mb-6 question-block">
            <Editable path={['questions', index, 'statement']} onContentChange={onContentChange} as="p" className="font-bold">{`${index + 1}. ${q.statement}`}</Editable>
            {['enem', 'quiz'].includes(q.type) && (
              <ul className="list-none mt-2 pl-4 space-y-1">{(q.options || []).map((opt, i) => <li key={i}>{`${'abcde'[i]}) `}<Editable path={['questions', index, 'options', i]} onContentChange={onContentChange} as="span">{opt}</Editable></li>)}</ul>
            )}
            {q.type === 'true-false' && <div className="mt-2 pl-4"><p>( ) Verdadeiro ( ) Falso</p></div>}
            {q.type === 'discursive' && <div className="mt-3 h-24 border-b border-gray-400"></div>}
          </div>
        ))}
      </div>
    </div>
  );
};

export default ActivityContent;