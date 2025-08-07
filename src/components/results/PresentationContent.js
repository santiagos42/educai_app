import CopyButton from '../common/CopyButton';
import Editable from '../common/Editable';


const PresentationContent = ({ result, onContentChange }) => {
  const formatSlideContentForCopy = (slide) => {
    const title = slide.title || ''; const contentPoints = slide.content || [];
    return `${title}\n\n${contentPoints.map(point => `• ${point}`).join('\n')}`;
  };
  return (
    <div className="p-8 document-font">
      <div className="content-header-with-copy">
        <Editable path={['topic']} as="h2" className="text-2xl font-bold text-center mb-6" onContentChange={onContentChange}>{result.topic}</Editable>
        <CopyButton textToCopy={() => (result.slides || []).map(formatSlideContentForCopy).join('\n\n\n')} title="Copiar todos os slides" />
      </div>
      <div className="presentation-grid">
        {(result.slides || []).map((slide, index) => (
          <div key={index} className="slide-preview">
            <div className="slide-header">
              <span className="slide-number">{index + 1}</span>
              <Editable path={['slides', index, 'title']} onContentChange={onContentChange} as="h3" className="slide-title">{slide.title}</Editable>
              <CopyButton textToCopy={formatSlideContentForCopy(slide)} title="Copiar conteúdo do slide" />
            </div>
            <ul className="slide-content">
              {(slide.content || []).map((point, i) => <li key={i}><Editable path={['slides', index, 'content', i]} onContentChange={onContentChange} as="span">{point}</Editable></li>)}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PresentationContent;