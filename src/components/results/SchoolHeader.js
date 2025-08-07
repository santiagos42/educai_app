import CopyButton from '../common/CopyButton';
import Editable from '../common/Editable';


const SchoolHeader = ({ headerRef }) => {
  const headerHTML = `<table class="header-table"><tbody><tr><th colspan="4">NOME DA ESCOLA</th></tr><tr><td style="width: 75%;" colspan="3"><strong>Disciplina:</strong>&nbsp;</td><td style="width: 25%;" colspan="1"><strong>Bimestre:</strong>&nbsp;</td></tr><tr><td style="width: 25%;"><strong>Série:</strong>&nbsp;</td><td style="width: 50%;" colspan="2"><strong>Turma:</strong>&nbsp;</td><td style="width: 25%;"><strong>Ano:</strong>&nbsp;</td></tr><tr><td colspan="4"><strong>Professor (a):</strong>&nbsp;</td></tr><tr><td colspan="4"><strong>Aluno (a):</strong>&nbsp;</td></tr></tbody></table><p class="header-tip"><strong>Dica:</strong> O cabeçalho acima é um protótipo editável. Para um resultado perfeito, incluindo a logo da sua escola, recomendamos copiar o conteúdo para um editor como Word ou Google Docs.</p>`;
  return (
    <div ref={headerRef} contentEditable suppressContentEditableWarning className="editable-header-space" dangerouslySetInnerHTML={{ __html: headerHTML }} />
  );
};

export default SchoolHeader;