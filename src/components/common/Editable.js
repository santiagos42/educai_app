const Editable = ({ path, children, onContentChange, as = 'p', className = '' }) => {
  const handleBlur = (e) => { const newContent = as === 'p' || as === 'h2' || as === 'h3' ? e.target.innerHTML : e.target.innerText; onContentChange(path, newContent); };
  const Tag = as;
  return (<Tag contentEditable suppressContentEditableWarning onBlur={handleBlur} className={`editable-content ${className}`} dangerouslySetInnerHTML={as !== 'span' ? { __html: children } : undefined}>{as === 'span' ? children : undefined}</Tag>);
};

export default Editable;