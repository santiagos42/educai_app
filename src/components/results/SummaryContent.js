import CopyButton from '../common/CopyButton';
import SchoolHeader from './SchoolHeader';
import { useCallback, useMemo, useRef } from 'react';

const SummaryContent = ({ result, onContentChange, headerRef }) => {
  const titleRef = useRef(null); const bodyRef = useRef(null);
  const handleContentUpdate = useCallback(() => { const titleHTML = titleRef.current ? titleRef.current.innerHTML : ''; const bodyHTML = bodyRef.current ? bodyRef.current.innerHTML : ''; const newContent = `<h2>${titleHTML}</h2>${bodyHTML}`; onContentChange(['content'], newContent); }, [onContentChange]);
  const [initialTitle, initialBody] = useMemo(() => { const tempDiv = document.createElement('div'); tempDiv.innerHTML = result.content; const h2 = tempDiv.querySelector('h2'); let title = 'Título do Resumo'; if (h2) { title = h2.innerHTML; h2.remove(); } const body = tempDiv.innerHTML; return [title, body]; }, [result.content]);
  const getTextToCopy = () => { const titleText = titleRef.current ? titleRef.current.innerText : ''; const bodyText = bodyRef.current ? bodyRef.current.innerText : ''; return `${titleText}\n\n${bodyText}`; };
  return (
    <div className="p-8 document-font">
      <SchoolHeader headerRef={headerRef} />
      <div className="content-header-with-copy">
        <h2 ref={titleRef} className="editable-content text-2xl font-bold text-center mb-6" contentEditable suppressContentEditableWarning onBlur={handleContentUpdate} dangerouslySetInnerHTML={{ __html: initialTitle }} />
        <CopyButton textToCopy={getTextToCopy} title="Copiar resumo completo" />
      </div>
      <div className="two-column-layout">
        <div ref={bodyRef} className="editable-content" contentEditable suppressContentEditableWarning onBlur={handleContentUpdate} dangerouslySetInnerHTML={{ __html: initialBody }} />
      </div>
    </div>
  );
};

export default SummaryContent;