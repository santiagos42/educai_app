import toast from "react-hot-toast";
import { Copy } from "lucide-react";

const CopyButton = ({ textToCopy, title = "Copiar conteúdo" }) => {
  const handleCopy = () => {
    const finalText = typeof textToCopy === 'function' ? textToCopy() : textToCopy;
    if (!finalText) { toast.error('Não há conteúdo para copiar.'); return; }
    navigator.clipboard.writeText(finalText)
      .then(() => toast.success('Copiado para a área de transferência!'))
      .catch(err => { console.error('Falha ao copiar texto: ', err); toast.error('Não foi possível copiar o texto.'); });
  };
  return <button onClick={(e) => { e.stopPropagation(); handleCopy(); }} className="copy-button" title={title}><Copy size={16} /></button>;
};

export default CopyButton;
