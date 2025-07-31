import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
// Ícones
import { 
    BookOpen, FileText, Cpu, Download, CheckCircle, Loader, FilePlus, ChevronLeft, Lightbulb, 
    ClipboardList, CalendarDays, X, FileQuestion, GraduationCap, PenSquare, Palette, Clipboard, 
    Copy, Folder, FolderPlus, MoreVertical, Edit, Trash2 as TrashIcon, Save, FolderClock, Clock,
    LayoutGrid, List, Star, Home, Move, ArrowRight, ShieldCheck, ShieldCheckUsers, Tv, Library, MessageSquare, Sparkles, Rocket
} from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Imports de Autenticação
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AuthScreen, AuthHeader } from './Auth'; 

// Imports do Firebase
import { 
    createFolder, getFolders, getGenerationsInFolder, saveGeneration, updateDocumentName, 
    deleteFolderAndContents, deleteGeneration, getAllUserFolders, moveItem, moveFolder,
    resendVerificationEmail, logout
} from './firebase';

// Pacotes para download de arquivos
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

// =================================================================================
// SEÇÃO DE COMPONENTES DE UI E CONTEÚDO
// =================================================================================

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

const AnimatedBackground = () => {
  const createShapes = (count) => Array.from({ length: count }).map((_, i) => ({
    id: i,
    style: { top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`, width: `${Math.random() * 150 + 50}px`, height: `${Math.random() * 150 + 50}px`, animationDuration: `${Math.random() * 30 + 25}s`, animationDelay: `${Math.random() * 10}s` },
    type: Math.random() > 0.5 ? 'rounded-full' : 'rounded-2xl',
    color: Math.random() > 0.5 ? 'bg-sky-200/40' : 'bg-yellow-200/30'
  }));
  const shapes = useMemo(() => createShapes(15), []);
  return <div className="absolute inset-0 w-full h-full overflow-hidden z-0">{shapes.map(shape => (<div key={shape.id} className={`absolute animate-slow-drift ${shape.type} ${shape.color}`} style={shape.style}></div>))}</div>;
};

const WeekdaySelector = ({ selectedDays, onDayChange }) => {
  const weekdays = [{ label: 'Seg', value: 1 }, { label: 'Ter', value: 2 }, { label: 'Qua', value: 3 }, { label: 'Qui', value: 4 }, { label: 'Sex', value: 5 }];
  const toggleDay = (dayValue) => { const newSelectedDays = selectedDays.includes(dayValue) ? selectedDays.filter(d => d !== dayValue) : [...selectedDays, dayValue].sort((a, b) => a - b); onDayChange(newSelectedDays); };
  return <div><label className="form-label">Dias de aula na semana:</label><div className="flex items-center gap-2 flex-wrap">{weekdays.map((day) => (<button key={day.value} type="button" onClick={() => toggleDay(day.value)} className={`w-12 h-10 rounded-lg border-2 font-bold transition-all flex items-center justify-center ${selectedDays.includes(day.value) ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400'}`}>{day.label}</button>))}</div></div>;
};

const QuestionTypeSelector = ({ selectedTypes, setSelectedTypes }) => {
  const questionOptions = { enem: { label: 'Modelo ENEM' }, quiz: { label: 'Fixação' }, discursive: { label: 'Discursiva' }, 'true-false': { label: 'V ou F' } };
  const handleTypeChange = (type) => { const newTypes = selectedTypes.includes(type) ? selectedTypes.filter((t) => t !== type) : [...selectedTypes, type]; if (newTypes.length > 0) setSelectedTypes(newTypes); };
  return <div><label className="form-label">Tipos de questão:</label><div className="grid grid-cols-2 md:grid-cols-4 gap-2">{Object.entries(questionOptions).map(([key, { label }]) => (<button key={key} type="button" onClick={() => handleTypeChange(key)} className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${selectedTypes.includes(key) ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-200'}`}>{label}</button>))}</div></div>;
};

const Editable = ({ path, children, onContentChange, as = 'p', className = '' }) => {
  const handleBlur = (e) => { const newContent = as === 'p' || as === 'h2' || as === 'h3' ? e.target.innerHTML : e.target.innerText; onContentChange(path, newContent); };
  const Tag = as;
  return (<Tag contentEditable suppressContentEditableWarning onBlur={handleBlur} className={`editable-content ${className}`} dangerouslySetInnerHTML={as !== 'span' ? { __html: children } : undefined}>{as === 'span' ? children : undefined}</Tag>);
};

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

const SchoolHeader = ({ headerRef }) => {
  const headerHTML = `<table class="header-table"><tbody><tr><th colspan="4">NOME DA ESCOLA</th></tr><tr><td style="width: 75%;" colspan="3"><strong>Disciplina:</strong>&nbsp;</td><td style="width: 25%;" colspan="1"><strong>Bimestre:</strong>&nbsp;</td></tr><tr><td style="width: 25%;"><strong>Série:</strong>&nbsp;</td><td style="width: 50%;" colspan="2"><strong>Turma:</strong>&nbsp;</td><td style="width: 25%;"><strong>Ano:</strong>&nbsp;</td></tr><tr><td colspan="4"><strong>Professor (a):</strong>&nbsp;</td></tr><tr><td colspan="4"><strong>Aluno (a):</strong>&nbsp;</td></tr></tbody></table><p class="header-tip"><strong>Dica:</strong> O cabeçalho acima é um protótipo editável. Para um resultado perfeito, incluindo a logo da sua escola, recomendamos copiar o conteúdo para um editor como Word ou Google Docs.</p>`;
  return (
    <div ref={headerRef} contentEditable suppressContentEditableWarning className="editable-header-space" dangerouslySetInnerHTML={{ __html: headerHTML }} />
  );
};

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

// =================================================================================
// COMPONENTES DO DASHBOARD E TELAS
// =================================================================================

const DropdownMenu = ({ onRename, onDelete, onMove }) => {
  const [isOpen, setIsOpen] = useState(false); const menuRef = useRef(null);
  useEffect(() => { const handleClickOutside = (event) => { if (menuRef.current && !menuRef.current.contains(event.target)) setIsOpen(false); }; document.addEventListener("mousedown", handleClickOutside); return () => document.removeEventListener("mousedown", handleClickOutside); }, []);
  return (<div className="relative" ref={menuRef}><button onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }} className="p-1 rounded-full hover:bg-slate-200"><MoreVertical size={16} /></button>{isOpen && (<div className="absolute right-0 mt-2 w-40 bg-white rounded-md shadow-lg z-20 py-1"><button onClick={() => { onRename(); setIsOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><Edit size={14} className="mr-2"/> Renomear</button><button onClick={() => { onMove(); setIsOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-100"><Move size={14} className="mr-2"/> Mover</button><button onClick={() => { onDelete(); setIsOpen(false); }} className="flex items-center w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50"><TrashIcon size={14} className="mr-2"/> Excluir</button></div>)}</div>);
};

const HistorySidebar = ({ setView }) => {
  const tools = [
    { id: 'activityGenerator', name: 'Gerar Atividades Avaliativas', icon: <PenSquare /> },
    { id: 'planningAssistant', name: 'Assistente de Planejamento', icon: <CalendarDays /> },
    { id: 'lessonPlanGenerator', name: 'Criar Planos de Aula', icon: <ClipboardList /> },
    { id: 'summaryGenerator', name: 'Gerar Resumos Didáticos', icon: <BookOpen /> },
    { id: 'caseStudyGenerator', name: 'Criar Estudos de Caso', icon: <FileQuestion /> },
    { id: 'presentationGenerator', name: 'Gerar Roteiro de Slides', icon: <Palette /> },
  ];
  return (
    <aside className="w-72 bg-slate-50 p-4 border-r border-slate-200 hidden md:flex flex-col">
      <div className="text-2xl font-bold text-slate-800 p-2 mb-4" style={{ fontFamily: "'Patrick Hand', cursive" }}>EducAI</div>
      <div className="mb-6">

      </div>
        <div className="mb-6">
          <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Navegação</h3>
          <ul>
            <li>
              <button onClick={() => setView('home')} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                <Home size={20} />
                Painel Principal
              </button>
            </li>
          </ul>
        </div>

      <h3 className="px-3 text-xs font-semibold text-slate-500 uppercase tracking-wider mb-2">Ferramentas de IA</h3>
      <nav className="flex-grow overflow-y-auto">
        <ul>
          {tools.map(tool => (
            <li key={tool.id}>
              <button onClick={() => setView(tool.id)} className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-semibold text-slate-600 hover:bg-slate-200 transition-colors">
                {React.cloneElement(tool.icon, { size: 20 })}
                {tool.name}
              </button>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
};

const ItemCard = ({ item, type, onClick, onRename, onDelete, onMove }) => {
  const isFolder = type === 'folder'; const icon = isFolder ? <Folder size={48} className="text-yellow-500" fill="rgba(234, 179, 8, 0.2)" /> : <FileText size={48} className="text-sky-500" />;
  return (<div onClick={onClick} className="group relative flex flex-col items-center justify-center p-4 bg-white rounded-lg shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all cursor-pointer aspect-square"><div className="mb-2">{icon}</div><p className="text-center text-sm font-semibold text-slate-700 break-all w-full px-1 truncate" title={item.name}>{item.name}</p><div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}><DropdownMenu onRename={() => onRename(type, item.id, item.name)} onDelete={() => onDelete(type, item.id, item.name)} onMove={() => onMove(type, item.id, item.name)} /></div></div>);
};

const ItemListRow = ({ item, type, onClick, onRename, onDelete, onMove }) => {
    const isFolder = type === 'folder'; const icon = isFolder ? <Folder size={24} className="text-yellow-500" /> : <FileText size={24} className="text-sky-500" />; const modifiedDate = item.createdAt?.toDate ? item.createdAt.toDate().toLocaleDateString() : 'N/A';
    return (<tr onClick={onClick} className="group hover:bg-slate-50 cursor-pointer"><td className="p-4 whitespace-nowrap text-sm font-medium text-slate-900 flex items-center gap-3">{icon}{item.name}</td><td className="p-4 whitespace-nowrap text-sm text-slate-500">{modifiedDate}</td><td className="p-4 whitespace-nowrap text-sm text-slate-500 capitalize">{type === 'folder' ? 'Pasta' : 'Arquivo Gerado'}</td><td className="p-4 whitespace-nowrap text-right text-sm font-medium"><div onClick={(e) => e.stopPropagation()}><DropdownMenu onRename={() => onRename(type, item.id, item.name)} onDelete={() => onDelete(type, item.id, item.name)} onMove={() => onMove(type, item.id, item.name)} /></div></td></tr>);
};

const InfoBox = () => (<div className="bg-sky-50 border-l-4 border-sky-400 text-sky-800 p-4 rounded-r-lg mb-8 text-sm" role="alert"><div className="flex"><div className="py-1"><Lightbulb className="h-5 w-5 mr-3 flex-shrink-0" /></div><div><p className="font-bold mb-1">Bem-vindo(a) ao seu Drive!</p><p>Professor(a), aqui você pode criar pastas e subpastas para organizar os seus arquivos gerados.<br /><strong>Exemplo:</strong> Pasta (Escola 1) → Subpasta (1º ano A) → Subpasta (Biologia) → Arquivo (Atividade sobre Bactérias).</p><p className="mt-2"><i>Obs.: Isso é apenas um exemplo: você possui total autonomia para organizar as suas pastas e arquivos do jeito que desejar!</i></p></div></div></div>);

const MoveItemModal = ({ item, onClose, onConfirmMove }) => {
  const { currentUser } = useAuth(); const [folders, setFolders] = useState([]); const [destinationId, setDestinationId] = useState('');
  useEffect(() => { const fetchFolders = async () => { if (currentUser) { const allFolders = await getAllUserFolders(currentUser.uid); const availableFolders = allFolders.filter(f => f.id !== item.id); setFolders(availableFolders); } }; fetchFolders(); }, [currentUser, item.id]);
  return (<div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in"><div className="bg-white rounded-2xl p-8 shadow-2xl relative w-full max-w-lg"><h2 className="text-2xl font-bold text-slate-900 mb-2">Mover Item</h2><p className="text-slate-600 mb-6">Mover "<strong className="truncate">{item.name}</strong>" para:</p><div className="space-y-4"><select value={destinationId} onChange={e => setDestinationId(e.target.value)} className="form-input"><option value="">Selecione um destino...</option><option value="root">Pasta Principal (Meu Drive)</option>{folders.map(folder => (<option key={folder.id} value={folder.id}>{folder.name}</option>))}</select></div><div className="flex gap-4 mt-8"><button onClick={onClose} className="form-button-secondary w-full">Cancelar</button><button onClick={() => onConfirmMove(destinationId)} disabled={!destinationId} className="form-button-primary w-full"><Move size={18} className="mr-2"/>Mover Para Cá</button></div></div></div>);
};

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

const DrivePreview = ({ setView }) => {
    const { currentUser } = useAuth(); const [recentFolders, setRecentFolders] = useState([]); const [isLoading, setIsLoading] = useState(true);
    useEffect(() => { if (!currentUser) return; const unsub = getFolders(currentUser.uid, 'root', (folders) => { setRecentFolders(folders.slice(0, 6)); setIsLoading(false); }); return () => unsub(); }, [currentUser]);
    const handleCreateFolder = async () => { const folderName = prompt("Digite o nome da nova pasta:"); if (folderName && folderName.trim() && currentUser) { try { await createFolder(currentUser.uid, 'root', folderName.trim()); toast.success(`Pasta "${folderName}" criada.`); } catch (error) { toast.error("Não foi possível criar a pasta."); } } };
    return (
        <div className="bg-slate-100/50 backdrop-blur-sm border border-slate-200 rounded-2xl p-6 h-full flex flex-col">
            <div className="flex justify-between items-center mb-4"><h2 className="text-2xl font-bold text-slate-700 flex items-center gap-2"><FolderClock size={24} />Meu Drive</h2><button onClick={() => setView('history')} className="text-sm font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1">Ver tudo <ArrowRight size={16} /></button></div>
            <p className="text-slate-600 text-sm mb-6">Acesse e organize seus materiais ou crie uma nova pasta para começar.</p>
            <div className="flex-grow grid grid-cols-3 gap-4">
                {isLoading ? (<div className="col-span-3 flex items-center justify-center"><Loader className="animate-spin text-sky-500" /></div>) : recentFolders.length > 0 ? (recentFolders.map(folder => (<div key={folder.id} onClick={() => setView('history')} className="bg-white/70 p-4 rounded-lg flex flex-col items-center justify-center text-center cursor-pointer hover:bg-white hover:shadow-md transition-all"><Folder size={32} className="text-yellow-500 mb-2" /><p className="text-xs font-semibold text-slate-600 truncate w-full">{folder.name}</p></div>))) : (<div className="col-span-3 flex flex-col items-center justify-center text-slate-500 bg-slate-100/50 rounded-lg"><Folder size={40} className="mb-2" /><p className="font-semibold">Nenhuma pasta ainda</p><p className="text-xs">Clique abaixo para criar sua primeira pasta.</p></div>)}
            </div>
            <div className="mt-6"><button onClick={handleCreateFolder} className="form-button-secondary w-full"><FolderPlus size={16} className="mr-2"/> Criar Nova Pasta</button></div>
        </div>
    );
};

const ModernAuthBackground = () => (
    <div className="absolute inset-0 w-full h-full -z-10"><div className="auth-shape auth-shape-1"></div><div className="auth-shape auth-shape-2"></div></div>
);

const ValuePropPanels = () => (
    <div className="hidden lg:block">
        <div className="value-prop-panel panel-top-left"><h3><Cpu size={24} className="text-sky-400" />Geração Inteligente</h3><p>Crie planos de aula, atividades e resumos completos em segundos, alinhados com suas necessidades pedagógicas.</p></div>
        <div className="value-prop-panel panel-bottom-left"><h3><FolderClock size={24} className="text-sky-400" />Organização Total</h3><p>Gerencie todos os seus materiais em um Drive intuitivo, com pastas por turma, matéria ou projeto. Nunca mais perca um arquivo.</p></div>
        <div className="value-prop-panel panel-top-right"><h3><Palette size={24} className="text-sky-400" />Formatos Profissionais</h3><p>Exporte seus conteúdos para PDF e DOCX com um clique. Prontos para imprimir e entregar, com cabeçalhos e formatação.</p></div>
        <div className="value-prop-panel panel-bottom-right"><h3><ShieldCheck size={24} className="text-sky-400" />Seguro e Acessível</h3><p>Seus dados são protegidos e estão disponíveis em qualquer lugar, a qualquer hora. Foque no que importa: ensinar.</p></div>
    </div>
);

const ValuePropGrid = () => {
  // COLUNA DA ESQUERDA - 5 ITENS
  const leftProps = [
    { icon: <Library size={24} className="text-teal-400" />, title: "Biblioteca de Recursos", description: "Acesse e salve um vasto banco de materiais gerados pela comunidade e inspire-se." },
    { icon: <Cpu size={24} className="text-sky-400" />, title: "Geração Inteligente", description: "Crie planos de aula, atividades e resumos completos em segundos." },
    { icon: <FolderClock size={24} className="text-yellow-400" />, title: "Organização Total", description: "Gerencie todos os seus materiais em um Drive intuitivo, com pastas e projetos." },
    { icon: <Palette size={24} className="text-purple-400" />, title: "Formatos Profissionais", description: "Exporte seus conteúdos para PDF e DOCX com um clique, prontos para imprimir." },
    { icon: <MessageSquare size={24} className="text-blue-400" />, title: "Feedback Inteligente", description: "Crie gabaritos comentados e sugestões de respostas para suas atividades com um clique." }
  ];

  // COLUNA DA DIREITA - 5 ITENS
  const rightProps = [
    { icon: <Sparkles size={24} className="text-amber-400" />, title: "Aulas Mais Dinâmicas", description: "Gere estudos de caso e debates que capturam a atenção e promovem o pensamento crítico." },
    { icon: <Clock size={24} className="text-green-400" />, title: "Foco no que Importa", description: "Reduza horas de planejamento em minutos e dedique-se mais aos seus alunos." },
    { icon: <GraduationCap size={24} className="text-orange-400" />, title: "Alinhamento com a BNCC", description: "Gere conteúdo que já considera as habilidades da Base Nacional Comum Curricular." },
    { icon: <ShieldCheck size={24} className="text-red-400" />, title: "Seguro e Acessível", description: "Seus dados são protegidos e estão disponíveis em qualquer lugar, a qualquer hora." },
    { icon: <Rocket size={24} className="text-rose-400" />, title: "Suporte Contínuo", description: "Plataforma em constante evolução, com novas ferramentas baseadas no seu feedback." }
  ];

  const renderColumn = (props) => (
    <div className="value-prop-column">
      {props.map((prop, index) => (
        <div key={prop.title} className="value-prop-panel" style={{ animationDelay: `${100 * (index + 1)}ms` }}>
          <h3>{prop.icon}{prop.title}</h3>
          <p>{prop.description}</p>
        </div>
      ))}
    </div>
  );

  return (
    <div className="hidden lg:block value-prop-wrapper">
      {renderColumn(leftProps)}
      <div className="value-prop-spacer"></div> 
      {renderColumn(rightProps)}
    </div>
  );
};

const VerifyEmailScreen = () => {
    const { currentUser } = useAuth(); const [isSending, setIsSending] = useState(false);
    const handleResend = async () => { if (!currentUser) return; setIsSending(true); try { await resendVerificationEmail(currentUser); toast.success("Novo e-mail de verificação enviado!"); } catch (error) { toast.error("Falha ao reenviar e-mail. Tente novamente mais tarde."); } finally { setIsSending(false); } };
    return (<div className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-slate-700 rounded-xl shadow-lg p-8 text-center animate-fade-in-up"><CheckCircle size={48} className="mx-auto text-green-400 mb-4" /><h1 className="text-2xl font-bold text-white">Verifique seu E-mail</h1><p className="text-slate-300 mt-2 mb-6">Enviamos um link de confirmação para <strong>{currentUser?.email}</strong>. Por favor, clique no link para ativar sua conta e acessar a plataforma.</p><p className="text-xs text-slate-400 mb-6">Após verificar, atualize esta página.</p><button onClick={handleResend} disabled={isSending} className="form-button-secondary w-full">{isSending ? <Loader className="animate-spin mr-2" /> : null}Reenviar E-mail</button><button onClick={() => logout()} className="toggle-auth-view mt-4">Sair e usar outra conta</button></div>);
};

const HistoryScreen = ({ setView, loadGeneration }) => {
  const { currentUser } = useAuth(); const [folders, setFolders] = useState([]); const [generations, setGenerations] = useState([]); const [currentFolderId, setCurrentFolderId] = useState('root'); const [breadcrumbs, setBreadcrumbs] = useState([{ id: 'root', name: 'Meu Drive' }]); const [isLoading, setIsLoading] = useState(true); const [viewType, setViewType] = useState('grid'); const [itemToMove, setItemToMove] = useState(null);
  useEffect(() => { if (!currentUser) return; setIsLoading(true); const unsubFolders = getFolders(currentUser.uid, currentFolderId, (data) => { setFolders(data); setIsLoading(false); }); const unsubGenerations = getGenerationsInFolder(currentUser.uid, currentFolderId, setGenerations); return () => { unsubFolders(); unsubGenerations(); }; }, [currentUser, currentFolderId]);
  const handleCreateFolder = async () => { const folderName = prompt("Digite o nome da nova pasta:"); if (folderName && folderName.trim()) { try { await createFolder(currentUser.uid, currentFolderId, folderName.trim()); toast.success(`Pasta "${folderName}" criada.`); } catch (error) { toast.error("Não foi possível criar a pasta."); console.error(error); } } };
  const handleNavigateToFolder = (folder) => { setBreadcrumbs(prev => [...prev, { id: folder.id, name: folder.name }]); setCurrentFolderId(folder.id); };
  const handleBreadcrumbClick = (index) => { setCurrentFolderId(breadcrumbs[index].id); setBreadcrumbs(breadcrumbs.slice(0, index + 1)); };
  const handleRename = async (type, id, currentName) => { const newName = prompt(`Renomear "${currentName}":`, currentName); if (newName && newName.trim() && newName !== currentName) { try { await updateDocumentName(type === 'folder' ? 'folders' : 'generations', id, newName.trim()); toast.success("Renomeado com sucesso!"); } catch { toast.error("Falha ao renomear."); } } };
  const handleDelete = async (type, id, name) => { if (window.confirm(`Tem certeza que deseja excluir "${name}"? Esta ação não pode ser desfeita.`)) { try { if (type === 'folder') await deleteFolderAndContents(currentUser.uid, id); else await deleteGeneration(id); toast.success(`"${name}" foi excluído(a).`); } catch (err) { toast.error("Falha ao excluir."); console.error(err); } } };
  const handleOpenMoveModal = (type, id, name) => { setItemToMove({ type, id, name }); };
  const handleConfirmMove = async (destinationId) => {
    if (!itemToMove) return; const { type, id } = itemToMove;
    try {
      if (type === 'folder') await moveFolder(id, destinationId); else await moveItem('generations', id, destinationId);
      toast.success("Item movido com sucesso!");
    } catch (error) { toast.error("Falha ao mover o item."); console.error(error); } finally { setItemToMove(null); }
  };
  return (
    <div className="w-full min-h-screen bg-white flex">
      {itemToMove && <MoveItemModal item={itemToMove} onClose={() => setItemToMove(null)} onConfirmMove={handleConfirmMove} />}
      <HistorySidebar setView={setView} />
      <div className="flex-1 flex flex-col h-screen">
        <header className="flex-shrink-0 flex justify-between items-center p-4 border-b border-slate-200 bg-white/80 backdrop-blur-sm sticky top-0 z-10">
          <div className="flex items-center text-sm md:text-base text-slate-600 flex-wrap">
            {breadcrumbs.map((crumb, index) => (<React.Fragment key={crumb.id}><button onClick={() => handleBreadcrumbClick(index)} className={`hover:underline ${index === breadcrumbs.length - 1 ? 'font-bold text-slate-800' : ''}`}>{crumb.name}</button>{index < breadcrumbs.length - 1 && <span className="mx-2">/</span>}</React.Fragment>))}
          </div>
          <AuthHeader />
        </header>
        <main className="flex-1 p-6 bg-slate-100 overflow-y-auto">
          {currentFolderId === 'root' && <InfoBox />}
          <div className="flex justify-end mb-6">
            <div className="flex items-center gap-2">
              <div className="flex items-center bg-slate-200 p-1 rounded-lg"><button onClick={() => setViewType('grid')} className={`p-1.5 rounded ${viewType === 'grid' ? 'bg-white shadow-sm' : 'hover:bg-slate-300'}`}><LayoutGrid size={20} /></button><button onClick={() => setViewType('list')} className={`p-1.5 rounded ${viewType === 'list' ? 'bg-white shadow-sm' : 'hover:bg-slate-300'}`}><List size={20} /></button></div>
              <button onClick={handleCreateFolder} className="form-button-primary" style={{width: 'auto', padding: '0.5rem 1rem'}}><FolderPlus size={18} className="mr-2"/> Criar Pasta</button>
            </div>
          </div>
          {isLoading ? (<div className="flex justify-center items-center h-64"><Loader className="animate-spin text-sky-500" size={40} /></div>) : (
            <>{viewType === 'grid' ? (<div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">{folders.map(folder => (<ItemCard key={folder.id} item={folder} type="folder" onClick={() => handleNavigateToFolder(folder)} onRename={handleRename} onDelete={handleDelete} onMove={handleOpenMoveModal}/>))}{generations.map(gen => (<ItemCard key={gen.id} item={gen} type="file" onClick={() => loadGeneration(gen.content)} onRename={handleRename} onDelete={handleDelete} onMove={handleOpenMoveModal}/>))}</div>) : (<div className="text-center p-8 bg-white rounded-lg">Visualização em lista ainda não implementada.</div>)}
            {!isLoading && folders.length === 0 && generations.length === 0 && (<div className="text-center py-16 text-slate-500 flex flex-col items-center"><Folder size={64} className="mx-auto mb-4 text-slate-400" /><h3 className="text-2xl font-semibold text-slate-600">Pasta Vazia</h3><p className="mb-6">Comece criando uma nova pasta para organizar seus materiais.</p><button onClick={handleCreateFolder} className="form-button-primary" style={{width: 'auto', padding: '0.75rem 1.5rem'}}><FolderPlus size={18} className="mr-2"/> Criar Nova Pasta</button></div>)}</>
          )}
        </main>
      </div>
    </div>
  );
}; 

const GeneratorScreen = ({ setView, setResult, type, initialTopic, initialGrade, onClose, isModal }) => {
  const [topic, setTopic] = useState(initialTopic || '');
  const [pages, setPages] = useState(1);
  const [grade, setGrade] = useState(initialGrade || '6º ano - Ensino Fundamental II');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [subjects, setSubjects] = useState('');
  const [className, setClassName] = useState('');
  const [teacherName, setTeacherName] = useState('');
  const [discipline, setDiscipline] = useState('');
  const [weekdays, setWeekdays] = useState([1, 3, 5]);
  const [isLoading, setIsLoading] = useState(false);
  const [questionTypes, setQuestionTypes] = useState(['enem']);
  const [presentationStyle, setPresentationStyle] = useState('didatico');

  const screenConfig = {
    activityGenerator: { type: 'activity', title: "Gerador de Atividades", message: "Crie sua atividade customizada.", button: "Gerar Atividade", icon: <PenSquare size={24} /> },
    lessonPlanGenerator: { type: 'lessonPlan', title: "Gerador de Planos de Aula", message: "Elabore um plano de aula completo.", button: "Gerar Plano de Aula", icon: <ClipboardList size={24} /> },
    planningAssistant: { type: 'planningAssistant', title: "Assistente de Planejamento", message: "Organize o roteiro de aulas do bimestre.", button: "Criar Planejamento", icon: <CalendarDays size={24} /> },
    caseStudyGenerator: { type: 'caseStudy', title: "Criador de Estudos de Caso", message: "Descreva o tema para o estudo de caso.", button: "Gerar Estudo de Caso", icon: <FileQuestion size={24} /> },
    presentationGenerator: { type: 'presentation', title: "Gerador de Roteiro de Slides", message: "Defina o tema para criar o roteiro dos slides.", button: "Gerar Roteiro", icon: <Palette size={24} /> },
    summaryGenerator: { type: 'summary', title: "Gerador de Resumos", message: "Digite o tema para criar um resumo.", button: "Gerar Resumo", icon: <BookOpen size={24} /> },
  };

  const currentConfig = screenConfig[type];
  const { title, message, button, icon } = currentConfig || screenConfig.summaryGenerator;
  
  const gradeLevels = [
    "1º ao 5º ano - Ensino Fundamental I", "6º ano - Ensino Fundamental II", "7º ano - Ensino Fundamental II", "8º ano - Ensino Fundamental II", "9º ano - Ensino Fundamental II",
    "1º ano - Ensino Médio", "2º ano - Ensino Médio", "3º ano - Ensino Médio", "Ensino Superior"
  ];
  
  const handleGenerate = useCallback(async () => {
    if (isLoading) return;

    if (currentConfig.type === 'planningAssistant') {
      if (!className || !subjects || !discipline || !startDate || !endDate || weekdays.length === 0) { 
        toast.error('Preencha todos os campos obrigatórios.');
        return; 
      }
    } else if (!topic) {
      toast.error('Por favor, preencha o campo de tópico/tema.');
      return;
    }
    
    setIsLoading(true);
    const loadingToastId = toast.loading('Gerando seu conteúdo... Por favor, aguarde.');

    try {
      let apiUrl;
      if (process.env.NODE_ENV === 'production') {
        apiUrl = '/api/generate';
      } else {
        apiUrl = 'http://localhost:3001/api/generate';
      }

      const payload = {
        type: currentConfig.type, topic, pages, grade, startDate, endDate, subjects,
        className, teacherName, discipline, weekdays, questionTypes, presentationStyle,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const resultData = await response.json();

      if (!response.ok) {
        throw new Error(resultData.error || `Erro do servidor: ${response.statusText}`);
      }
      
      if (!resultData.candidates || resultData.candidates.length === 0) {
        throw new Error("A API não retornou nenhum conteúdo válido.");
      }
      
      toast.success('Conteúdo gerado com sucesso!', { id: loadingToastId });

      const generatedText = resultData.candidates[0].content.parts[0].text;
      
      let generatedResult;
      if (currentConfig.type === 'summary') {
        generatedResult = { type: currentConfig.type, topic, content: generatedText, pagesRequested: pages, grade };
      } else {
        let parsedJson;
        try {
          const cleanJsonString = generatedText.replace(/^```json\s*|```$/g, '');
          parsedJson = JSON.parse(cleanJsonString);
        } catch (e) {
          console.error("JSON Parsing Error:", e, "Original Text:", generatedText);
          throw new Error("A resposta da IA não está no formato JSON esperado.");
        }

        const dataMap = {
          activity: { questions: parsedJson.questions, pagesRequested: pages, grade },
          lessonPlan: { plan: parsedJson },
          planningAssistant: { schedule: parsedJson.schedule, className, teacherName, discipline, subjects },
          caseStudy: { case: parsedJson },
          presentation: { slides: parsedJson.slides },
        };

        if (currentConfig.type === 'planningAssistant') {
          if (!parsedJson.schedule) throw new Error("A resposta da IA não contém a chave 'schedule' esperada.");
          generatedResult = { type: currentConfig.type, ...dataMap[currentConfig.type] };
        } else {
          generatedResult = { type: currentConfig.type, topic, grade, discipline, ...dataMap[currentConfig.type] };
        }
      }
      
      setResult(generatedResult);
      setView('result');

    } catch (err) {
      console.error(err);
      toast.error(`Ocorreu um erro: ${err.message}`, { id: loadingToastId });
    } finally {
      setIsLoading(false);
    }
  }, [
    type, topic, pages, grade, startDate, endDate, subjects, className, 
    teacherName, discipline, weekdays, questionTypes, presentationStyle, 
    setResult, setView, isLoading, currentConfig
  ]);

  useEffect(() => {
    const handleKeyPress = (event) => {
      if (event.key === 'Enter' && event.target.tagName.toLowerCase() !== 'textarea') {
        event.preventDefault();
        handleGenerate();
      }
    };
    document.addEventListener('keydown', handleKeyPress);
    return () => document.removeEventListener('keydown', handleKeyPress);
  }, [handleGenerate]);

  return (
    <div className={isModal ? "" : "w-full min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center justify-center p-4"}>
      <div className={isModal ? "bg-white rounded-2xl p-8 shadow-2xl relative animate-fade-in-up w-full max-w-2xl" : "w-full max-w-2xl bg-white/50 backdrop-blur-md rounded-2xl p-8 feature-card-glow-border animate-fade-in-up"}>
        <div className="flex items-center gap-4 mb-2">
          <div className="w-10 h-10 flex items-center justify-center bg-sky-100 text-sky-600 rounded-lg">{icon}</div>
          <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
        </div>
        <p className="text-slate-600 mb-6">{message}</p>

        {currentConfig.type === 'presentation' && (
          <div className="bg-sky-50 border-l-4 border-sky-400 text-sky-800 p-4 rounded-r-lg mb-8 text-sm" role="alert">
            <div className="flex">
              <div className="py-1"><Lightbulb className="h-5 w-5 mr-3 flex-shrink-0" /></div>
              <div>
                <p>Professor(a), nesta função, você poderá gerar um <strong>roteiro</strong> de uma apresentação em slides sobre o tema escolhido. Este roteiro será um guia para que você possa montar a sua apresentação em um aplicativo de design de sua escolha, como o Canva, Google Slides ou PowerPoint. Basta passar o conteúdo gerado aqui para a sua apresentação!</p>
                <p className="mt-2 font-semibold">Desejamos um excelente trabalho! Parabéns pela dedicação!</p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {currentConfig.type !== 'planningAssistant' && <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Revolução Francesa, Ciclo da Água..." className="form-input" />}
          
          {['activity', 'lessonPlan', 'caseStudy', 'presentation', 'summary'].includes(currentConfig.type) && (
            <select value={grade} onChange={e => setGrade(e.target.value)} className="form-input">
              {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
          
          {['caseStudy', 'planningAssistant'].includes(currentConfig.type) && <input type="text" value={discipline} onChange={e => setDiscipline(e.target.value)} placeholder="Disciplina (Ex: História)" className="form-input" />}
          
          {currentConfig.type === 'planningAssistant' && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input type="text" value={className} onChange={e => setClassName(e.target.value)} placeholder="Turma" className="form-input"/>
                <input type="text" value={teacherName} onChange={e => setTeacherName(e.target.value)} placeholder="Nome do Professor(a) (Opcional)" className="form-input"/>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div><label className="form-label">Data de Início</label><input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="form-input"/></div>
                <div><label className="form-label">Data de Fim</label><input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="form-input"/></div>
              </div>
              <WeekdaySelector selectedDays={weekdays} onDayChange={setWeekdays} />
              <textarea value={subjects} onChange={e => setSubjects(e.target.value)} rows="3" placeholder="Assuntos a serem distribuídos (separados por vírgula)" className="form-input"></textarea>
            </>
          )}

          {currentConfig.type === 'presentation' && (
            <select value={presentationStyle} onChange={e => setPresentationStyle(e.target.value)} className="form-input">
              <option value="didatico">Didático e claro</option>
              <option value="formal">Formal e acadêmico</option>
              <option value="criativo">Criativo e envolvente</option>
            </select>
          )}

          {currentConfig.type === 'activity' && <QuestionTypeSelector selectedTypes={questionTypes} setSelectedTypes={setQuestionTypes} />}
          
          {['activity', 'summary'].includes(currentConfig.type) && (
            <div>
              <label className="form-label">Número de folhas (A4):</label>
              <input type="number" value={pages} onChange={e => setPages(Math.max(1, parseInt(e.target.value) || 1))} min="1" className="form-input"/>
            </div>
          )}
        </div>

        <button onClick={handleGenerate} disabled={isLoading} className="form-button-primary mt-8">
          {isLoading ? <><Loader className="animate-spin mr-2" size={20} /> Gerando...</> : <><Cpu className="mr-2" size={20} /> {button}</>}
        </button>
        <button onClick={onClose ? onClose : () => setView('home')} className="form-button-secondary mt-3">
          {onClose ? <X size={18} className="mr-1"/> : <ChevronLeft size={18} className="mr-1"/>}
          {onClose ? 'Cancelar' : 'Voltar ao Início'}
        </button>
      </div>
    </div>
  );
};

const WhiteboardHomeScreen = ({ setView }) => {
  const { currentUser } = useAuth();
  const features = [{ id: 'activityGenerator', icon: <PenSquare />, title: "Gerar Atividades Avaliativas", description: "Crie avaliações, exercícios, simulados e mais." }, { id: 'planningAssistant', icon: <CalendarDays />, title: "Assistente de Planejamento", description: "Organize sua semana, seu bimestre, seu ano letivo.", isHighlighted: true }, { id: 'lessonPlanGenerator', icon: <ClipboardList />, title: "Criar Planos de Aula", description: "Elabore planos de aula completos e alinhados à BNCC." }, { id: 'summaryGenerator', icon: <BookOpen />, title: "Gerar Resumos Didáticos", description: "Elabore resumos didáticos de qualidade sobre diversos temas." }, { id: 'caseStudyGenerator', icon: <FileQuestion />, title: "Criar Estudos de Caso", description: "Gere cenários práticos que abordam de forma brilhante qualquer assunto.", isHighlighted: true }, { id: 'presentationGenerator', icon: <Palette />, title: "Gerar Roteiro de Slides", description: "Crie roteiros para apresentações." }];
  const noteColors = useMemo(() => { return [{ bg: 'bg-yellow-200/80', border: 'border-yellow-400' }, { bg: 'bg-sky-200/80', border: 'border-sky-400' }, { bg: 'bg-green-200/80', border: 'border-green-400' }, { bg: 'bg-pink-200/80', border: 'border-pink-400' }, { bg: 'bg-purple-200/80', border: 'border-purple-400' }, { bg: 'bg-orange-200/80', border: 'border-orange-400' }].sort(() => 0.5 - Math.random()); }, []);

  return (
    <div className="whiteboard-bg w-full min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 relative">
      <div className="absolute top-0 right-0 p-6 z-20"><AuthHeader /></div>
      <AnimatedBackground />
      <div className="relative z-10 flex flex-col items-center w-full max-w-7xl mx-auto">
        <div className="text-center mb-10"><h1 className="text-6xl md:text-7xl font-bold text-slate-800" style={{ fontFamily: "'Patrick Hand', cursive" }}>EducAI{currentUser && !currentUser.isAnonymous && (<span className="text-4xl md:text-5xl block mt-2">Assistente de {currentUser.displayName ? currentUser.displayName.split(' ')[0] : currentUser.email.split('@')[0]}</span>)}{(!currentUser || currentUser.isAnonymous) && (<span className="text-4xl md:text-5xl block mt-2">Assistente do Professor</span>)}</h1><p className="text-lg md:text-xl text-slate-600 mt-2 font-sans">Sua assistente de IA para revolucionar a educação.</p></div>
        
        {/* LAYOUT INVERTIDO CORRIGIDO */}
        <div className="w-full grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Coluna Esquerda (NOVA): Preview do Drive */}
          <div className="animate-fade-in-up">
            <DrivePreview setView={setView} />
          </div>

          {/* Coluna Direita (NOVA): Ferramentas de IA */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {features.map((feature, index) => (
              <div key={feature.id} className="animate-fade-in-up" style={{ animationDelay: `${150 * (index + 1)}ms` }}>
                <FeatureNoteCard onClick={() => setView(feature.id)} icon={feature.icon} title={feature.title} description={feature.description} isHighlighted={feature.isHighlighted} color={noteColors[index % noteColors.length]}/>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

const SaveToHistoryModal = ({ result, onClose, onSave }) => {
  const [fileName, setFileName] = useState(result.topic || result.discipline || 'Novo Documento');
  const [targetFolderId, setTargetFolderId] = useState('root');
  const [folders, setFolders] = useState([]);
  const { currentUser } = useAuth();
  useEffect(() => {
    if (currentUser) {
      const unsubscribe = getFolders(currentUser.uid, 'root', setFolders);
      return () => unsubscribe();
    }
  }, [currentUser]);
  const handleSave = () => {
    if (!fileName.trim()) { toast.error("Por favor, dê um nome ao arquivo."); return; }
    onSave(targetFolderId, fileName);
  };
  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <div className="bg-white rounded-2xl p-8 shadow-2xl relative w-full max-w-lg">
        <h2 className="text-2xl font-bold text-slate-900 mb-4">Salvar no Histórico</h2>
        <div className="space-y-4">
          <div>
            <label className="form-label">Nome do Arquivo</label>
            <input type="text" value={fileName} onChange={e => setFileName(e.target.value)} className="form-input" />
          </div>
          <div>
            <label className="form-label">Salvar na Pasta</label>
            <select value={targetFolderId} onChange={e => setTargetFolderId(e.target.value)} className="form-input">
              <option value="root">Pasta Principal (Meu Drive)</option>
              {folders.map(folder => (<option key={folder.id} value={folder.id}>{folder.name}</option>))}
            </select>
          </div>
        </div>
        <div className="flex gap-4 mt-8">
          <button onClick={onClose} className="form-button-secondary w-full">Cancelar</button>
          <button onClick={handleSave} className="form-button-primary w-full"><Save size={18} className="mr-2" />Salvar</button>
        </div>
      </div>
    </div>
  );
};

const ResultScreen = ({ setView, setResult, result, previousResult, goBack }) => {
  const [editableResult, setEditableResult] = useState(null);
  const [isDownloading, setIsDownloading] = useState(false);
  const [pdfError, setPdfError] = useState('');
  const headerRef = useRef(null);
  const [modalInfo, setModalInfo] = useState(null);
  const [showSaveModal, setShowSaveModal] = useState(false);
  const { currentUser } = useAuth();
  
  useEffect(() => { if (result) { setEditableResult(JSON.parse(JSON.stringify(result))); } }, [result]);
  
  const openGeneratorModal = (info) => setModalInfo({ ...info, grade: result.className || result.grade });
  const closeGeneratorModal = () => setModalInfo(null);
  
  const homeView = useMemo(() => {
    if (!result) return 'home';
    const viewMap = {
      presentation: 'presentationGenerator', activity: 'activityGenerator', lessonPlan: 'lessonPlanGenerator',
      planningAssistant: 'planningAssistant', caseStudy: 'caseStudyGenerator', summary: 'summaryGenerator'
    };
    return viewMap[result.type] || 'home';
  }, [result]);

  const handleContentChange = (path, value) => {
    setEditableResult(prevResult => {
      const newResult = { ...prevResult };
      let current = newResult;
      for (let i = 0; i < path.length - 1; i++) { current = current[path[i]]; }
      current[path[path.length - 1]] = value;
      return newResult;
    });
  };

  const handleSaveToHistory = async (folderId, fileName) => {
    if (!currentUser || currentUser.isAnonymous) {
      toast.error("Você precisa estar logado com uma conta para salvar.");
      return;
    }
    try {
      await saveGeneration(currentUser.uid, folderId, fileName, editableResult);
      toast.success("Salvo no seu histórico com sucesso!");
      setShowSaveModal(false);
    } catch (error) {
      toast.error("Falha ao salvar no histórico.");
      console.error(error);
    }
  };

    const handleDownloadPdf = async () => {
    setIsDownloading(true);
    setPdfError('');
  
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const filename = `${(editableResult.topic || editableResult.discipline || 'documento').replace(/\s+/g, '_')}_${editableResult.type}.pdf`;
      
      const page = { width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight(), margin: 15 };
      const contentWidth = page.width - (page.margin * 2);
      let y = page.margin;
  
      const addWrappedText = (text, options = {}) => {
        if (!text) return;
        const { x = page.margin, fontSize = 11, fontStyle = 'normal', spacingAfter = 4, align = 'justify' } = options;
        doc.setFontSize(fontSize);
        doc.setFont('times', fontStyle);
        
        const availableWidth = align === 'center' ? contentWidth : contentWidth - (x - page.margin);
        
        const lines = doc.splitTextToSize(text, availableWidth);
        const textHeight = doc.getTextDimensions(lines).h;
  
        if (y + textHeight > page.height - page.margin) {
          doc.addPage();
          y = page.margin;
        }
        
        doc.text(text, x, y, { align, maxWidth: availableWidth });
        y += textHeight + spacingAfter;
      };
  
      const addSectionTitle = (text) => {
        if (y + 15 > page.height - page.margin) { doc.addPage(); y = page.margin; }
        y += 5;
        doc.setFontSize(14);
        doc.setFont('times', 'bold');
        doc.text(text, page.margin, y, { align: 'left' });
        y += 5;
        doc.setLineWidth(0.3);
        doc.line(page.margin, y, page.width - page.margin, y);
        y += 7;
      };
      
      const addSchoolHeaderToPdf = (doc, startY) => {
        if (!headerRef.current) return startY;
        const tableNode = headerRef.current.querySelector('table');
        if (!tableNode) return startY;
      
        let currentY = startY;
        const rows = Array.from(tableNode.rows);
        
        doc.setFont('times', 'normal');
        doc.setFontSize(11);
        doc.setDrawColor(0);
        doc.setLineWidth(0.3);
      
        rows.forEach(row => {
          const cells = Array.from(row.cells);
          let maxHeight = 0;
          cells.forEach(cell => {
            const textHeight = doc.getTextDimensions(cell.innerText).h;
            if (textHeight > maxHeight) maxHeight = textHeight;
          });
          const rowHeight = maxHeight + 8;
      
          if (currentY + rowHeight > page.height - page.margin) {
            doc.addPage();
            currentY = page.margin;
          }
      
          let x = page.margin;
          cells.forEach(cell => {
            const isHeader = cell.tagName === 'TH';
            const cellWidth = contentWidth * (cell.colSpan / 4);
            
            doc.rect(x, currentY, cellWidth, rowHeight);
            
            const textY = currentY + rowHeight / 2;
            const paddingX = 3;

            if (isHeader) {
              doc.setFont('times', 'bold');
              doc.text(cell.innerText, x + cellWidth / 2, textY, {
                align: 'center',
                baseline: 'middle',
                maxWidth: cellWidth - (paddingX * 2)
              });
            } else {
              const strongElement = cell.querySelector('strong');
              const labelText = strongElement ? strongElement.innerText : '';
              const userText = cell.innerText.replace(labelText, '').trim();

              let currentX = x + paddingX;

              doc.setFont('times', 'bold');
              doc.text(labelText, currentX, textY, { baseline: 'middle' });
              
              const labelWidth = doc.getTextDimensions(labelText).w;
              currentX += labelWidth;
              
              if (userText) {
                doc.setFont('times', 'italic');
                const space = ' ';
                const spaceWidth = doc.getTextDimensions(space).w;
                doc.text(space, currentX, textY, { baseline: 'middle' });
                currentX += spaceWidth;
                doc.text(userText, currentX, textY, { baseline: 'middle', maxWidth: cellWidth - (currentX - x) - paddingX });
              }
            }
            
            x += cellWidth;
          });
          currentY += rowHeight;
        });
        
        return currentY + 10;
      };
      
      const columnManager = {
        y: y,
        col: 0,
        gap: 8,
        colWidth: (contentWidth - 8) / 2,
        pageStartY: y,
        init(startY) {
          this.y = startY;
          this.col = 0;
          this.pageStartY = startY;
        },
        getColX() {
          return page.margin + (this.col * (this.colWidth + this.gap));
        },
        add(text, options = {}) {
          const { fontSize = 11, fontStyle = 'normal', align = 'justify', spacingAfter = 4 } = options;
          doc.setFontSize(fontSize);
          doc.setFont('times', fontStyle);
  
          const lines = doc.splitTextToSize(text, this.colWidth);
          const textHeight = doc.getTextDimensions(lines).h;
  
          if (this.y + textHeight > page.height - page.margin) {
            this.col++;
            if (this.col > 1) {
              doc.addPage();
              y = page.margin; 
              this.init(y);
            }
            this.y = this.pageStartY;
          }
  
          doc.text(text, this.getColX(), this.y, { align, maxWidth: this.colWidth });
          this.y += textHeight + spacingAfter;
        }
      };
  
      if (['summary', 'activity'].includes(editableResult.type)) {
        y = addSchoolHeaderToPdf(doc, y);
      }
  
      switch (editableResult.type) {
        case 'activity':
          columnManager.init(y);
          (editableResult.questions || []).forEach((q, index) => {
            columnManager.add(`${index + 1}. ${q.statement}`, { fontStyle: 'bold', align: 'justify' });
            if (['enem', 'quiz'].includes(q.type)) {
              (q.options || []).forEach((opt, i) => columnManager.add(`  ${'abcde'[i]}) ${opt}`, { align: 'left', spacingAfter: 2 }));
            }
            if (q.type === 'true-false') {
              columnManager.add('  ( ) Verdadeiro  ( ) Falso', { align: 'left', spacingAfter: 2 });
            }
            if (q.type === 'discursive') {
              columnManager.y += 20; 
            }
            columnManager.y += 5; 
          });
          break;
        case 'summary':
          const tempDiv = document.createElement('div');
          tempDiv.innerHTML = editableResult.content;
          const titleNode = tempDiv.querySelector('h2');
          const titleText = titleNode ? titleNode.textContent : editableResult.topic;
          
          if (titleNode) titleNode.remove();
  
          addWrappedText(titleText, { x: page.width / 2, fontSize: 16, fontStyle: 'bold', align: 'center', spacingAfter: 10 });
          
          columnManager.init(y);
          const paragraphs = tempDiv.querySelectorAll('p');
          paragraphs.forEach(p => {
            let text = p.textContent || '';
            if (text.trim()) {
              columnManager.add(text);
            }
          });
          break;
        case 'lessonPlan':
          const { plan } = editableResult;
          addWrappedText(editableResult.topic, { x: page.width / 2, fontSize: 18, fontStyle: 'bold', align: 'center' });
          addWrappedText(editableResult.grade, { x: page.width / 2, fontSize: 12, fontStyle: 'italic', align: 'center', spacingAfter: 10 });
          
          if (plan.objectives?.length) { addSectionTitle('Objetivos'); plan.objectives.forEach(item => addWrappedText(`• ${item}`, { x: page.margin + 2, align: 'justify' })); }
          if (plan.bnccSkills?.length) { addSectionTitle('Habilidades (BNCC)'); plan.bnccSkills.forEach(item => addWrappedText(`• ${item}`, { x: page.margin + 2, align: 'justify' })); }
          if (plan.development?.length) { addSectionTitle('Desenvolvimento'); plan.development.forEach((item, i) => addWrappedText(`${i+1}. ${item}`, { align: 'justify' })); }
          if (plan.resources?.length) { addSectionTitle('Recursos'); plan.resources.forEach(item => addWrappedText(`• ${item}`, { x: page.margin + 2, align: 'justify' })); }
          if (plan.assessment?.length) { addSectionTitle('Avaliação'); plan.assessment.forEach(item => addWrappedText(`• ${item}`, { x: page.margin + 2, align: 'justify' })); }
          break;
        case 'planningAssistant':
          addWrappedText(`Planejamento - ${editableResult.className}`, { x: page.width / 2, fontSize: 18, fontStyle: 'bold', align: 'center' });
          addWrappedText(`Prof(a): ${editableResult.teacherName || 'A ser preenchido'} | Disciplina: ${editableResult.discipline}`, { x: page.width / 2, fontSize: 12, fontStyle: 'italic', align: 'center', spacingAfter: 8 });
          addWrappedText(`Assuntos: ${editableResult.subjects}`, { fontSize: 10, align: 'left', spacingAfter: 10 });
          
          addSectionTitle('Cronograma de Aulas');
  
          (editableResult.schedule || []).forEach(item => {
            const dateText = item.date || '';
            const activityText = item.activity || '';
            const activityLines = doc.splitTextToSize(activityText, contentWidth - 35);
            const entryHeight = Math.max(doc.getTextDimensions(dateText).h, doc.getTextDimensions(activityLines).h);
  
            if (y + entryHeight > page.height - page.margin) {
              doc.addPage();
              y = page.margin;
              addSectionTitle('Cronograma de Aulas (continuação)');
            }
  
            doc.setFont('times', 'bold');
            doc.text(dateText, page.margin, y);
            doc.setFont('times', 'normal');
            doc.text(activityLines, page.margin + 35, y);
            y += entryHeight + 6;
          });
          break;
        case 'presentation':
          addWrappedText(`Apresentação: ${editableResult.topic}`, { x: page.width / 2, fontSize: 18, fontStyle: 'bold', align: 'center', spacingAfter: 10 });
          (editableResult.slides || []).forEach((slide, index) => {
            if (y > page.height - 50) { doc.addPage(); y = page.margin; }
            addSectionTitle(`Slide ${index + 1}: ${slide.title}`);
            (slide.content || []).forEach(point => {
              addWrappedText(`• ${point}`, { x: page.margin + 4, align: 'justify', spacingAfter: 2 });
            });
            y += 5;
          });
          break;
        case 'caseStudy':
          const { case: caseData } = editableResult;
          addWrappedText(caseData.title, { x: page.width / 2, fontSize: 18, fontStyle: 'bold', align: 'center' });
          addWrappedText(`Estudo de Caso sobre ${editableResult.topic}`, { x: page.width / 2, fontSize: 12, fontStyle: 'italic', align: 'center', spacingAfter: 10 });
          
          if (caseData.context) { addSectionTitle('Contexto'); addWrappedText(caseData.context); }
          if (caseData.problem) { addSectionTitle('Problema Central'); addWrappedText(caseData.problem); }
          if (caseData.discussion_points?.length) { addSectionTitle('Questões para Discussão'); caseData.discussion_points.forEach((item, i) => addWrappedText(`${i+1}. ${item.question}`)); }
          break;
        default:
          addWrappedText("Visualização em PDF para esta funcionalidade ainda não implementada.", { align: 'center' });
      }
  
      doc.save(filename);
  
    } catch (err) {
      console.error("Erro ao gerar PDF:", err);
      setPdfError(`Ocorreu um erro ao construir o PDF. Detalhes: ${err.message}.`);
    } finally {
      setIsDownloading(false);
    }
  };
  const handleDownloadAnswerKeyPdf = async () => {
    setIsDownloading(true);
    setPdfError('');
  
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const filename = `${(editableResult.topic || 'gabarito').replace(/\s+/g, '_')}_gabarito_comentado.pdf`;
      
      const page = { width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight(), margin: 15 };
      const contentWidth = page.width - (page.margin * 2);
      let y = page.margin;
  
      const addWrappedText = (text, options = {}) => {
        const { x = page.margin, fontSize = 11, fontStyle = 'normal', spacingAfter = 4, align = 'justify' } = options;
        doc.setFontSize(fontSize);
        doc.setFont('times', fontStyle);
        const availableWidth = contentWidth - (x - page.margin);
        const lines = doc.splitTextToSize(text, availableWidth);
        const textHeight = doc.getTextDimensions(lines).h;
  
        if (y + textHeight > page.height - page.margin) {
          doc.addPage();
          y = page.margin;
        }
        
        doc.text(text, x, y, { align, maxWidth: availableWidth });
        y += textHeight + spacingAfter;
      };
  
      addWrappedText('Gabarito Comentado', { x: page.width / 2, fontSize: 18, fontStyle: 'bold', align: 'center' });
      addWrappedText(`Tema: ${editableResult.topic}`, { x: page.width / 2, fontSize: 12, fontStyle: 'italic', align: 'center', spacingAfter: 10 });
  
      (editableResult.questions || []).forEach((q, index) => {
        if (y > page.height - 40) {
          doc.addPage();
          y = page.margin;
        }
  
        addWrappedText(`${index + 1}. ${q.statement}`, { fontStyle: 'bold' });
  
        let answerText = 'Resposta: ';
        if (['enem', 'quiz'].includes(q.type)) {
          const correctOptionIndex = q.answer;
          const correctOptionLetter = 'abcde'[correctOptionIndex];
          const correctOptionText = q.options[correctOptionIndex];
          answerText += `Alternativa ${correctOptionLetter.toUpperCase()}) ${correctOptionText}`;
        } else if (q.type === 'true-false') {
          answerText += q.answer ? 'Verdadeiro' : 'Falso';
        } else {
          answerText = 'Justificativa / Resposta Esperada:';
        }
        addWrappedText(answerText, { fontStyle: 'bold', fontSize: 10, spacingAfter: 2 });
  
        if (q.type !== 'discursive') {
            addWrappedText(`Justificativa: ${q.justification}`, { fontSize: 10, align: 'justify' });
        } else {
            addWrappedText(q.justification, { fontSize: 10, align: 'justify' });
        }
        
        y += 6;
      });
  
      doc.save(filename);
  
    } catch (err) {
      console.error("Erro ao gerar PDF do gabarito:", err);
      setPdfError(`Ocorreu um erro ao construir o gabarito. Detalhes: ${err.message}.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadCaseStudyAnswersPdf = async () => {
    setIsDownloading(true);
    setPdfError('');
  
    try {
      const doc = new jsPDF({ orientation: 'p', unit: 'mm', format: 'a4' });
      const filename = `${(editableResult.topic || 'estudo_de_caso').replace(/\s+/g, '_')}_respostas.pdf`;
      
      const page = { width: doc.internal.pageSize.getWidth(), height: doc.internal.pageSize.getHeight(), margin: 15 };
      const contentWidth = page.width - (page.margin * 2);
      let y = page.margin;
  
      const addWrappedText = (text, options = {}) => {
        if (!text) return;
        const { x = page.margin, fontSize = 11, fontStyle = 'normal', spacingAfter = 4, align = 'justify' } = options;
        doc.setFontSize(fontSize);
        doc.setFont('times', fontStyle);
        const availableWidth = contentWidth - (x - page.margin);
        const lines = doc.splitTextToSize(text, availableWidth);
        const textHeight = doc.getTextDimensions(lines).h;
  
        if (y + textHeight > page.height - page.margin) {
          doc.addPage();
          y = page.margin;
        }
        
        doc.text(text, x, y, { align, maxWidth: availableWidth });
        y += textHeight + spacingAfter;
      };
  
      addWrappedText('Respostas / Pontos de Discussão', { x: page.width / 2, fontSize: 18, fontStyle: 'bold', align: 'center' });
      addWrappedText(`Estudo de Caso: ${editableResult.case.title}`, { x: page.width / 2, fontSize: 12, fontStyle: 'italic', align: 'center', spacingAfter: 10 });
  
      (editableResult.case.discussion_points || []).forEach((point, index) => {
        if (y > page.height - 50) {
          doc.addPage();
          y = page.margin;
        }
  
        addWrappedText(`${index + 1}. ${point.question}`, { fontStyle: 'bold' });
        addWrappedText(`Resposta Sugerida: ${point.answer}`, { fontSize: 10, align: 'justify' });
        y += 6;
      });
  
      doc.save(filename);
  
    } catch (err) {
      console.error("Erro ao gerar PDF das respostas do estudo de caso:", err);
      setPdfError(`Ocorreu um erro ao construir o PDF de respostas. Detalhes: ${err.message}.`);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleDownloadDocx = async (isAnswerKey = false, isCaseStudyAnswers = false) => {
    setIsDownloading(true);
    setPdfError('');
  
    try {
      const FONT = "Times New Roman";
      let filename;
      if (isAnswerKey) filename = `${(editableResult.topic || 'gabarito').replace(/\s+/g, '_')}_gabarito_comentado.docx`;
      else if (isCaseStudyAnswers) filename = `${(editableResult.topic || 'estudo_de_caso').replace(/\s+/g, '_')}_respostas.docx`;
      else filename = `${(editableResult.topic || editableResult.discipline || 'documento').replace(/\s+/g, '_')}_${editableResult.type}.docx`;

      const createSchoolHeader = () => {
        if (!headerRef.current) return [];
        const tableNode = headerRef.current?.querySelector('table');
        if (!tableNode) return [];
        
        const rows = Array.from(tableNode.rows).map(row => {
          const cells = Array.from(row.cells).map(cell => {
            return new TableCell({
              children: [new Paragraph({
                children: [new TextRun({ text: cell.innerText, bold: cell.tagName === 'TH' })],
                alignment: cell.tagName === 'TH' ? AlignmentType.CENTER : AlignmentType.LEFT,
              })],
              columnSpan: cell.colSpan,
            });
          });
          return new TableRow({ children: cells });
        });

        const table = new Table({
          rows,
          width: { size: 100, type: WidthType.PERCENTAGE },
        });

        const tip = new Paragraph({ text: "Dica: O cabeçalho acima é um protótipo editável. Para um resultado perfeito, incluindo a logo da sua escola, recomendamos copiar o conteúdo para um editor como Word ou Google Docs.", style: "tip" });

        return [table, tip, new Paragraph("")];
      };

      const parseHtmlToDocx = (htmlString) => {
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = htmlString;
        const docxElements = [];
        Array.from(tempDiv.childNodes).forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE && node.tagName === 'P') {
            const runs = [];
            Array.from(node.childNodes).forEach(childNode => {
              if (childNode.nodeType === Node.TEXT_NODE) {
                runs.push(new TextRun(childNode.textContent));
              } else if (childNode.nodeType === Node.ELEMENT_NODE) {
                const style = {};
                if (childNode.tagName === 'STRONG') style.bold = true;
                if (childNode.tagName === 'EM') style.italics = true;
                runs.push(new TextRun({ text: childNode.textContent, ...style }));
              }
            });
            docxElements.push(new Paragraph({ children: runs, style: "justify" }));
          }
        });
        return docxElements;
      };

      let sections = [];
      let headerChildren = [];
      let contentChildren = [];
      let useColumns = false;

      if (!isAnswerKey && !isCaseStudyAnswers && ['summary', 'activity'].includes(editableResult.type)) {
        headerChildren.push(...createSchoolHeader());
        useColumns = true;
      }

      if (isAnswerKey) {
        contentChildren.push(new Paragraph({ text: 'Gabarito Comentado', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
        contentChildren.push(new Paragraph({ text: `Tema: ${editableResult.topic}`, alignment: AlignmentType.CENTER, style: "italic" }));
        contentChildren.push(new Paragraph(""));
        (editableResult.questions || []).forEach((q, index) => {
          contentChildren.push(new Paragraph({ children: [new TextRun({ text: `${index + 1}. ${q.statement}`, bold: true })] }));
          let answerText = 'Resposta: ';
          if (['enem', 'quiz'].includes(q.type)) {
            const correctOptionLetter = 'abcde'[q.answer];
            answerText += `Alternativa ${correctOptionLetter.toUpperCase()}) ${q.options[q.answer]}`;
          } else if (q.type === 'true-false') {
            answerText += q.answer ? 'Verdadeiro' : 'Falso';
          } else {
            answerText = 'Justificativa / Resposta Esperada:';
          }
          contentChildren.push(new Paragraph({ children: [new TextRun({ text: answerText, bold: true })] }));
          contentChildren.push(new Paragraph({ children: [new TextRun({ text: `Justificativa: ${q.justification}` })], style: "justify" }));
          contentChildren.push(new Paragraph(""));
        });
      } else if (isCaseStudyAnswers) {
        contentChildren.push(new Paragraph({ text: 'Respostas / Pontos de Discussão', heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
        contentChildren.push(new Paragraph({ text: `Estudo de Caso: ${editableResult.case.title}`, alignment: AlignmentType.CENTER, style: "italic" }));
        contentChildren.push(new Paragraph(""));
        (editableResult.case.discussion_points || []).forEach((point, index) => {
          contentChildren.push(new Paragraph({ children: [new TextRun({ text: `${index + 1}. ${point.question}`, bold: true })] }));
          contentChildren.push(new Paragraph({ children: [new TextRun({ text: `Resposta Sugerida: ${point.answer}` })], style: "justify" }));
          contentChildren.push(new Paragraph(""));
        });
      } else {
        switch (editableResult.type) {
          case 'activity':
            (editableResult.questions || []).forEach((q, index) => {
              contentChildren.push(new Paragraph({ children: [new TextRun({ text: `${index + 1}. ${q.statement}`, bold: true })], style: "justify" }));
              if (['enem', 'quiz'].includes(q.type)) {
                (q.options || []).forEach((opt, i) => contentChildren.push(new Paragraph({ text: `  ${'abcde'[i]}) ${opt}` })));
              }
              if (q.type === 'true-false') contentChildren.push(new Paragraph('  ( ) Verdadeiro  ( ) Falso'));
              if (q.type === 'discursive') contentChildren.push(new Paragraph("_________________________________________________________________"));
              contentChildren.push(new Paragraph(""));
            });
            break;
          case 'summary':
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = editableResult.content;
            const titleText = tempDiv.querySelector('h2')?.textContent || editableResult.topic;
            tempDiv.querySelector('h2')?.remove();
            contentChildren.push(new Paragraph({ text: titleText, heading: HeadingLevel.HEADING_2, alignment: AlignmentType.CENTER }));
            contentChildren.push(new Paragraph(""));
            contentChildren.push(...parseHtmlToDocx(tempDiv.innerHTML));
            break;
          case 'lessonPlan':
            const { plan } = editableResult;
            contentChildren.push(new Paragraph({ text: editableResult.topic, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
            contentChildren.push(new Paragraph({ text: editableResult.grade, alignment: AlignmentType.CENTER, style: "italic" }));
            const addListSection = (title, items) => {
              if (items?.length) {
                contentChildren.push(new Paragraph({ text: title, heading: HeadingLevel.HEADING_3 }));
                items.forEach(item => contentChildren.push(new Paragraph({ text: item, bullet: { level: 0 } })));
              }
            };
            addListSection('Objetivos', plan.objectives);
            addListSection('Habilidades (BNCC)', plan.bnccSkills);
            addListSection('Desenvolvimento', plan.development);
            addListSection('Recursos', plan.resources);
            addListSection('Avaliação', plan.assessment);
            break;
          case 'planningAssistant':
            contentChildren.push(new Paragraph({ text: `Planejamento - ${editableResult.className}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
            contentChildren.push(new Paragraph({ text: `Prof(a): ${editableResult.teacherName || 'A ser preenchido'} | Disciplina: ${editableResult.discipline}`, alignment: AlignmentType.CENTER, style: "italic" }));
            contentChildren.push(new Paragraph({ children: [new TextRun({ text: `Assuntos: ${editableResult.subjects}`, bold: true })] }));
            contentChildren.push(new Paragraph({ text: 'Cronograma de Aulas', heading: HeadingLevel.HEADING_3 }));
            (editableResult.schedule || []).forEach(item => contentChildren.push(new Paragraph({ children: [new TextRun({ text: `${item.date}: `, bold: true }), new TextRun(item.activity)] })));
            break;
          case 'presentation':
              contentChildren.push(new Paragraph({ text: `Apresentação: ${editableResult.topic}`, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
              (editableResult.slides || []).forEach((slide, index) => {
                contentChildren.push(new Paragraph({ text: `Slide ${index + 1}: ${slide.title}`, heading: HeadingLevel.HEADING_3 }));
                (slide.content || []).forEach(point => contentChildren.push(new Paragraph({ text: point, bullet: { level: 0 } })));
                contentChildren.push(new Paragraph(""));
              });
            break;
          case 'caseStudy':
            const { case: caseData } = editableResult;
            contentChildren.push(new Paragraph({ text: caseData.title, heading: HeadingLevel.HEADING_1, alignment: AlignmentType.CENTER }));
            contentChildren.push(new Paragraph({ text: `Estudo de Caso sobre ${editableResult.topic}`, alignment: AlignmentType.CENTER, style: "italic" }));
            if (caseData.context) { contentChildren.push(new Paragraph({ text: 'Contexto', heading: HeadingLevel.HEADING_3 })); contentChildren.push(new Paragraph({ text: caseData.context, style: "justify" })); }
            if (caseData.problem) { contentChildren.push(new Paragraph({ text: 'Problema Central', heading: HeadingLevel.HEADING_3 })); contentChildren.push(new Paragraph({ text: caseData.problem, style: "justify" })); }
            if (caseData.discussion_points?.length) {
              contentChildren.push(new Paragraph({ text: 'Questões para Discussão', heading: HeadingLevel.HEADING_3 }));
              caseData.discussion_points.forEach(item => contentChildren.push(new Paragraph({ text: item.question, bullet: { level: 0 } })));
            }
            break;
        }
      }

      if (headerChildren.length > 0) sections.push({ properties: {}, children: headerChildren });
      sections.push({
        properties: useColumns ? { column: { count: 2, space: 720 } } : {},
        children: contentChildren,
      });
  
      const doc = new Document({
        styles: {
          paragraphStyles: [
            { id: "justify", name: "Justify", basedOn: "Normal", next: "Normal", run: { font: FONT, size: 22 }, paragraph: { alignment: AlignmentType.JUSTIFIED, spacing: { after: 120 } } },
            { id: "italic", name: "Italic", basedOn: "Normal", run: { italics: true } },
            { id: "tip", name: "Tip", basedOn: "Normal", run: { font: "Inter", size: 18, color: "475569" }, paragraph: { alignment: AlignmentType.CENTER, spacing: { before: 200, after: 200 } } },
          ],
          default: {
            heading1: { run: { font: FONT, size: 32, bold: true }, paragraph: { spacing: { after: 240 } } },
            heading2: { run: { font: FONT, size: 28, bold: true }, paragraph: { spacing: { after: 240 } } },
            heading3: { run: { font: FONT, size: 24, bold: true }, paragraph: { spacing: { after: 240 } } },
          }
        },
        sections: sections,
      });
  
      Packer.toBlob(doc).then(blob => {
        saveAs(blob, filename);
      });
  
    } catch (err) {
      console.error("Erro ao gerar DOCX:", err);
      setPdfError(`Ocorreu um erro ao construir o DOCX. Detalhes: ${err.message}.`);
    } finally {
      setIsDownloading(false);
    }
  };

  if (!editableResult) {
    return <div className="w-full min-h-screen flex items-center justify-center"><Loader className="animate-spin" size={48} /></div>;
  }

  return (
    <>
      {showSaveModal && <SaveToHistoryModal result={editableResult} onClose={() => setShowSaveModal(false)} onSave={handleSaveToHistory} />}
      {modalInfo && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
          <GeneratorScreen
            setView={setView}
            setResult={(newResult) => setResult(newResult, true)}
            type={modalInfo.type}
            initialTopic={modalInfo.topic}
            initialGrade={modalInfo.grade}
            onClose={closeGeneratorModal}
            isModal={true}
          />
        </div>
      )}
      <div className="w-full min-h-screen bg-slate-100 text-slate-800 flex flex-col items-center p-4 md:p-8">
        <AuthHeader setView={setView} />
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
            <h1 className="text-3xl font-bold text-slate-900">Conteúdo Gerado com Sucesso!</h1>
            <p className="text-slate-600 mt-2">Revise, edite se necessário, e salve ou faça o download abaixo.</p>
          </div>
          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/4 lg:sticky top-8 self-start animate-fade-in-up">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-5 feature-card-glow-border">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-3 mb-4">Ações</h2>
                <div className="space-y-3">
                  <button onClick={() => setShowSaveModal(true)} className="form-button-primary w-full">
                    <Save size={18} className="mr-2" /> Salvar no Histórico
                  </button>
                  {previousResult && (
                    <button onClick={goBack} className="form-button-secondary w-full">
                      <ChevronLeft size={18} className="mr-1" /> Voltar ao Planejamento
                    </button>
                  )}
                  <button onClick={handleDownloadPdf} disabled={isDownloading} className="form-button-secondary w-full">
                    {isDownloading ? <><Loader className="animate-spin mr-2" size={20} /> Gerando...</> : <><Download className="mr-2" size={20} /> Download PDF</>}
                  </button>
                  <button onClick={() => handleDownloadDocx()} disabled={isDownloading} className="form-button-secondary w-full">
                    {isDownloading ? <><Loader className="animate-spin mr-2" size={20} /> Gerando...</> : <><FileText className="mr-2" size={20} /> Download DOCX</>}
                  </button>
                  {editableResult.type === 'activity' && (
                    <>
                      <button onClick={handleDownloadAnswerKeyPdf} disabled={isDownloading} className="form-button-secondary w-full">
                        {isDownloading ? <Loader className="animate-spin" /> : <><GraduationCap size={18} /> Gabarito (PDF)</>}
                      </button>
                      <button onClick={() => handleDownloadDocx(true)} disabled={isDownloading} className="form-button-secondary w-full">
                        {isDownloading ? <Loader className="animate-spin" /> : <><GraduationCap size={18} /> Gabarito (DOCX)</>}
                      </button>
                    </>
                  )}
                  {editableResult.type === 'caseStudy' && (
                    <>
                      <button onClick={handleDownloadCaseStudyAnswersPdf} disabled={isDownloading} className="form-button-secondary w-full">
                        {isDownloading ? <Loader className="animate-spin" /> : <><GraduationCap size={18} /> Respostas (PDF)</>}
                      </button>
                      <button onClick={() => handleDownloadDocx(false, true)} disabled={isDownloading} className="form-button-secondary w-full">
                        {isDownloading ? <Loader className="animate-spin" /> : <><GraduationCap size={18} /> Respostas (DOCX)</>}
                      </button>
                    </>
                  )}
                  {!previousResult && (
                    <>
                      <button onClick={() => setView(homeView)} className="form-button-secondary w-full">
                        <FilePlus className="mr-2" size={20} /> Criar Novo
                      </button>
                      <button onClick={() => setView('home')} className="form-button-tertiary w-full">
                        <ChevronLeft size={18} className="mr-1" /> Início
                      </button>
                    </>
                  )}
                </div>
                {pdfError && <p className="text-sm text-red-500 mt-3">{pdfError}</p>}
              </div>
            </div>
            <div className="w-full lg:w-3/4 animate-fade-in-up" style={{ animationDelay: '200ms' }}>
              <div className="bg-slate-200 p-4 rounded-t-lg">
                <p className="text-sm text-slate-600">Pré-visualização (Clique no texto para editar)</p>
              </div>
              <div className="a4-preview-container bg-slate-200 p-4 sm:p-8 rounded-b-lg">
                <div className="a4-preview bg-white text-black shadow-2xl">
                  {editableResult.type === 'presentation' && <PresentationContent result={editableResult} onContentChange={handleContentChange} />}
                  {editableResult.type === 'summary' && <SummaryContent result={editableResult} onContentChange={handleContentChange} headerRef={headerRef} />}
                  {editableResult.type === 'activity' && <ActivityContent result={editableResult} onContentChange={handleContentChange} headerRef={headerRef} />}
                  {editableResult.type === 'lessonPlan' && <LessonPlanContent result={editableResult} onContentChange={handleContentChange} />}
                  {editableResult.type === 'planningAssistant' && <PlanningContent result={editableResult} onContentChange={handleContentChange} onOpenModal={openGeneratorModal} />}
                  {editableResult.type === 'caseStudy' && <CaseStudyContent result={editableResult} onContentChange={handleContentChange} />}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};



// =================================================================================
// COMPONENTE PRINCIPAL E LÓGICA DE ROTEAMENTO
// =================================================================================

function AppContent() {
  const { currentUser } = useAuth(); const [view, setView] = useState('home'); const [result, setResult] = useState(null); const [previousResult, setPreviousResult] = useState(null);
  useEffect(() => { if (!currentUser) { setView('home'); setResult(null); setPreviousResult(null); } }, [currentUser]);
  const handleSetResult = (newResult, keepHistory = false) => { if (keepHistory && result) { setPreviousResult(result); } else { setPreviousResult(null); } setResult(newResult); setView('result'); };
  const handleGoBackResult = () => { if (previousResult) { setResult(previousResult); setPreviousResult(null); } };
  const loadGenerationFromHistory = (content) => { setResult(content); setView('result'); };
  
  switch (view) {
    case 'dashboard': return <WhiteboardHomeScreen setView={setView} />;
    case 'history': return <HistoryScreen setView={setView} loadGeneration={loadGenerationFromHistory} />;
    case 'result': if (!result) return <HistoryScreen setView={setView} loadGeneration={loadGenerationFromHistory} />; return <ResultScreen setView={setView} setResult={handleSetResult} result={result} previousResult={previousResult} goBack={handleGoBackResult}/>;
    case 'home': return <WhiteboardHomeScreen setView={setView} loadGeneration={loadGenerationFromHistory} />;
    default: return <GeneratorScreen setView={setView} setResult={handleSetResult} type={view} />;
  }
}

function AppGatekeeper() {
  const { currentUser, loading } = useAuth();
  if (loading) return <div className="w-full min-h-screen flex items-center justify-center bg-slate-900"><Loader className="animate-spin text-sky-500" size={48} /></div>;

  const renderAuthLayout = (authComponent) => (
    <div className="w-full min-h-screen auth-modern-bg relative">
      <ModernAuthBackground />
      {/* Camada de Marketing no fundo */}
      <ValuePropGrid />
      
      {/* Contêiner DEPOIS, para ficar por cima, focado em centralizar o conteúdo */}
      <div className="auth-card-container">
        {authComponent}
      </div>
    </div>
  );

  if (currentUser) {
    const isEmailUser = currentUser.providerData.some(p => p.providerId === 'password');
    if (isEmailUser && !currentUser.emailVerified) {
      return renderAuthLayout(<VerifyEmailScreen />);
    }
    return <AppContent />;
  } 
  
  return renderAuthLayout(<AuthScreen />);
}

export default function App() {
  return (
    <AuthProvider>
      <Toaster position="top-center" reverseOrder={false} toastOptions={{ duration: 3000, style: { background: '#363636', color: '#fff' } }} />
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Patrick+Hand&display=swap');
        body { font-family: 'Inter', sans-serif; -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
        .whiteboard-bg { background-color: #f8fafc; background-image: linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px), linear-gradient(to right, rgba(100, 116, 139, 0.1) 1px, transparent 1px); background-size: 2rem 2rem; }
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { opacity: 0; animation: fadeInUp 0.6s ease-out forwards; }
        @keyframes slow-drift { 0% { transform: translateY(20px) translateX(-20px) rotate(0deg); opacity: 0; } 25% { opacity: 1; } 75% { opacity: 1; } 100% { transform: translateY(-20px) translateX(20px) rotate(15deg); opacity: 0; } }
        .animate-slow-drift { animation: slow-drift infinite ease-in-out; }
        .form-input { width: 100%; background-color: rgba(241, 245, 249, 0.5); border: 1px solid #cbd5e1; color: #1e293b; padding: 0.75rem 1rem; border-radius: 0.5rem; transition: border-color 0.2s, box-shadow 0.2s; font-size: 1rem; }
        .form-input:focus { outline: none; border-color: #38bdf8; box-shadow: 0 0 0 2px rgba(56, 189, 248, 0.4); }
        .form-input::placeholder { color: #64748b; }
        .form-input[type="date"]::-webkit-calendar-picker-indicator { cursor: pointer; filter: invert(0.5); }
        select.form-input { cursor: pointer; background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%2364748b' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e"); background-position: right 0.5rem center; background-repeat: no-repeat; background-size: 1.5em 1.5em; -webkit-appearance: none; -moz-appearance: none; appearance: none; }
        .form-label { display: block; font-size: 0.875rem; color: #475569; margin-bottom: 0.5rem; font-weight: 600; }
        .form-button-primary { display: flex; align-items: center; justify-content: center; width: 100%; background: linear-gradient(to right, #38bdf8, #3b82f6); color: white; font-weight: bold; padding: 0.75rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: all 0.3s; transform: perspective(1px) translateZ(0); }
        .form-button-primary:hover:not(:disabled) { opacity: 0.9; box-shadow: 0 10px 20px -10px rgba(59, 130, 246, 0.4); }
        .form-button-primary:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-button-secondary { display: flex; align-items: center; justify-content: center; width: 100%; background-color: #e2e8f0; color: #334155; font-weight: 600; padding: 0.75rem; border-radius: 0.5rem; border: 1px solid #cbd5e1; cursor: pointer; transition: background-color 0.2s; }
        .form-button-secondary:hover:not(:disabled) { background-color: #cbd5e1; }
        .form-button-secondary:disabled { opacity: 0.6; cursor: not-allowed; }
        .form-button-tertiary { display: flex; align-items: center; justify-content: center; width: 100%; background-color: transparent; color: #475569; font-weight: 600; padding: 0.75rem; border-radius: 0.5rem; border: none; cursor: pointer; transition: background-color 0.2s, color 0.2s; }
        .form-button-tertiary:hover { background-color: rgba(203, 213, 225, 0.5); color: #1e293b; }
        .feature-card-glow-border { border: 1px solid #e2e8f0; }
        .feature-card-glow-border:hover { border-color: #94a3b8; }
        .a4-preview-container { box-shadow: inset 0 2px 8px rgba(0,0,0,0.1); }
        .a4-preview { width: 210mm; min-height: 297mm; height: auto; margin: 0 auto; transform-origin: top center; transition: transform 0.3s; }
        @media (max-width: 860px) { .a4-preview { transform: scale(0.8); } }
        @media (max-width: 640px) { .a4-preview-container { padding: 0.5rem; } .a4-preview { transform: scale(0.5); min-height: auto; } }
        .document-font { font-family: 'Times New Roman', Times, serif; font-size: 11pt; line-height: 1.5; text-align: justify; }
        .section-title { font-weight: bold; border-bottom: 1px solid #ccc; padding-bottom: 4px; margin-bottom: 8px; font-size: 14pt; }
        .question-block, .break-inside-avoid { break-inside: avoid; }
        .editable-content:focus { outline: 1px solid #38bdf8; background-color: rgba(56, 189, 248, 0.1); }
        .header-table { width: 100%; border-collapse: collapse; border: 1.5px solid black; font-family: 'Times New Roman', Times, serif; font-size: 11pt; margin-bottom: 20px; }
        .header-table th, .header-table td { border: 1px solid black; padding: 4px 8px; vertical-align: middle; }
        .header-table th { text-align: center; font-weight: bold; padding: 8px; }
        .header-table td { text-align: left; }
        .header-tip { font-size: 9pt; color: #475569; text-align: center; margin-top: 15px; padding: 0 10px; font-family: 'Inter', sans-serif; line-height: 1.4; }
        .editable-header-space { margin-bottom: 20px; border: 1px dashed transparent; transition: border-color 0.2s, background-color 0.2s; }
        .editable-header-space:focus-within { border-color: #cbd5e1; background-color: rgba(248, 250, 252, 0.5); }
        .two-column-layout { column-count: 2; column-gap: 2rem; }
        @media (max-width: 640px) { .two-column-layout { column-count: 1; } }
        .presentation-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(300px, 1fr)); gap: 1rem; }
        .slide-preview { background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 1rem; display: flex; flex-direction: column; break-inside: avoid; }
        .slide-header { display: flex; align-items: center; gap: 0.75rem; border-bottom: 1px solid #cbd5e1; padding-bottom: 0.5rem; margin-bottom: 0.75rem; }
        .slide-number { font-weight: bold; background-color: #3b82f6; color: white; border-radius: 9999px; width: 1.75rem; height: 1.75rem; display: inline-flex; align-items: center; justify-content: center; flex-shrink: 0; }
        .slide-title { font-weight: bold; font-size: 1.1rem; flex-grow: 1; }
        .slide-content { list-style-position: inside; list-style-type: disc; padding-left: 0.25rem; font-size: 0.9rem; color: #334155; }
        .sug-button { display: inline-flex; align-items: center; background-color: #e2e8f0; color: #334155; font-size: 0.8rem; font-weight: 600; padding: 0.3rem 0.6rem; border-radius: 0.375rem; border: 1px solid #cbd5e1; cursor: pointer; transition: all 0.2s; font-family: 'Inter', sans-serif; }
        .sug-button:hover { background-color: #cbd5e1; border-color: #94a3b8; transform: translateY(-1px); box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .copy-button { margin-left: 0.5rem; padding: 0.3rem; border-radius: 9999px; color: #64748b; background-color: transparent; border: none; cursor: pointer; transition: all 0.2s ease-in-out; display: inline-flex; align-items: center; justify-content: center; }
        .copy-button:hover { color: #1e293b; background-color: #e2e8f0; transform: scale(1.1); }
        .slide-header .copy-button { margin-left: auto; }
        .content-header-with-copy { position: relative; display: flex; justify-content: center; align-items: center; padding: 0 2rem; }
        .content-header-with-copy h2 { flex-grow: 1; }
        .content-header-with-copy .copy-button { position: absolute; right: 0; top: 50%; transform: translateY(-50%); }
        .auth-container { position: absolute; top: 1.5rem; right: 1.5rem; z-index: 20; }
        .user-info { display: flex; align-items: center; gap: 0.75rem; background-color: rgba(255, 255, 255, 0.8); padding: 0.5rem; border-radius: 9999px; backdrop-filter: blur(4px); border: 1px solid #e2e8f0; }
        .user-name { font-weight: 600; font-size: 0.875rem; color: #334155; }
        .user-avatar { width: 2.5rem; height: 2.5rem; border-radius: 9999px; border: 2px solid white; }
        .user-avatar-guest { display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; background-color: #e2e8f0; color: #64748b; border-radius: 9999px; }
        .logout-button { display: flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; border-radius: 9999px; color: #64748b; background-color: #f1f5f9; border: none; cursor: pointer; transition: all 0.2s; }
        .logout-button:hover { background-color: #e2e8f0; color: #1e293b; }
        .auth-form-container {
            /* Efeito de Vidro Fosco */
            background-color: rgba(255, 255, 255, 0.1); /* Branco com alta transparência */
            backdrop-filter: blur(24px); /* O desfoque do que está atrás */
            -webkit-backdrop-filter: blur(24px); /* Suporte para Safari */
            border: 1px solid rgba(255, 255, 255, 0.15); /* Uma borda sutil para definir o limite */
            
            /* Estilos que já existiam */
            padding: 2.5rem; 
            border-radius: 1.25rem; /* Um pouco mais arredondado */
            box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.2); /* Sombra um pouco mais forte para dar profundidade */
            width: 100%; 
            max-width: 400px; 
            text-align: center; 
        }
        .auth-title { font-size: 1.5rem; font-weight: 700; color: #1e293b; margin-bottom: 1.5rem; }
        .input-group { position: relative; margin-bottom: 1rem; }
        .input-group input { width: 100%; padding: 0.75rem 0.75rem 0.75rem 2.5rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; font-size: 1rem; }
        .input-icon { position: absolute; left: 0.75rem; top: 50%; transform: translateY(-50%); color: #94a3b8; }
        .full-width { width: 100%; }
        .toggle-auth-view { background: none; border: none; color: #3b82f6; font-size: 0.875rem; cursor: pointer; margin-top: 1rem; }
        .separator { margin: 1.5rem 0; font-size: 0.875rem; color: #64748b; display: flex; align-items: center; }
        .separator::before, .separator::after { content: ''; flex-grow: 1; height: 1px; background-color: #e2e8f0; }
        .separator::before { margin-right: 1rem; }
        .separator::after { margin-left: 1rem; }
        .google-button { display: flex; align-items: center; justify-content: center; width: 100%; padding: 0.75rem; border: 1px solid #cbd5e1; border-radius: 0.5rem; background-color: white; font-weight: 600; cursor: pointer; margin-bottom: 0.75rem; transition: background-color 0.2s; }
        .google-button:hover { background-color: #f8fafc; }
        .google-icon { width: 1.25rem; height: 1.25rem; margin-right: 0.75rem; }
        .guest-button { width: 100%; padding: 0.75rem; border: none; border-radius: 0.5rem; background-color: #f1f5f9; font-weight: 600; cursor: pointer; transition: background-color 0.2s; }
        .guest-button:hover { background-color: #e2e8f0; }
        .guest-icon { width: 1.25rem; height: 1.25rem; margin-right: 0.75rem; }
        .auth-modern-bg {
          background-color: #0c0a1a; /* Um roxo/azul bem escuro */
          background-image: radial-gradient(circle at 10% 20%, rgba(30, 58, 138, 0.4) 0%, transparent 40%),
                            radial-gradient(circle at 90% 80%, rgba(107, 33, 168, 0.3) 0%, transparent 40%);
          overflow: hidden;
          position: relative;
        }

        @keyframes auth-drift {
          0% { transform: translateY(0px) translateX(0px); }
          50% { transform: translateY(-20px) translateX(10px); }
          100% { transform: translateY(0px) translateX(0px); }
        }

        .auth-shape {
          position: absolute;
          filter: blur(80px); /* O efeito "blob" vem daqui */
          animation: auth-drift 20s infinite ease-in-out alternate;
        }

        .auth-shape-1 {
          width: 400px;
          height: 400px;
          border-radius: 9999px;
          background: rgba(59, 130, 246, 0.3); /* Azul */
          top: -100px;
          left: -100px;
        }

        .auth-shape-2 {
          width: 300px;
          height: 300px;
          border-radius: 9999px;
          background: rgba(168, 85, 247, 0.3); /* Roxo */
          bottom: -50px;
          right: -50px;
          animation-delay: -10s;
        }

        /* Contêiner de centralização para a caixa de login (permanece o mesmo) */
        .auth-card-container {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 10;
        }

        /* Wrapper principal dos painéis de marketing */
        .value-prop-wrapper {
          position: absolute;
          inset: 0;
          display: flex;
          align-items: center; /* Centraliza as colunas verticalmente */
          justify-content: space-between; /* A chave para colocar um na esquerda e outro na direita */
          padding: 0 5rem; /* Apenas espaçamento lateral, o align-items cuida do vertical */
          pointer-events: none;
        }

        /* Cada coluna de painéis (Esquerda e Direita) */
        .value-prop-column {
          width: 320px; /* Largura fixa para os painéis */
          flex-shrink: 0;
          display: flex;
          flex-direction: column;
          justify-content: center; /* Centraliza os painéis dentro da coluna */
          gap: 2rem;
          pointer-events: auto; /* Permite interações com os painéis */
        }

        /* Oculta o espaçador, pois a nova lógica o torna desnecessário */
        .value-prop-spacer {
          display: none;
        }

        /* O painel individual (sem mudanças) */
        .value-prop-panel {
          background-color: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 1rem;
          padding: 1.5rem;
          backdrop-filter: blur(5px);
          -webkit-backdrop-filter: blur(5px);
          opacity: 0;
          animation: fadeInUp 0.8s ease-out forwards;
        }

        .value-prop-panel h3 {
          font-family: 'Patrick Hand', cursive;
          font-size: 1.5rem;
          color: white;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          gap: 0.75rem;
        }

        .value-prop-panel p {
          font-size: 0.9rem;
          color: #d1d5db; /* text-slate-300 */
          line-height: 1.5;
        }

        /* Ajustes para telas maiores */
        @media (min-width: 1536px) { /* 2xl */
          .value-prop-wrapper {
            padding: 0 8rem; /* Aumenta o espaçamento lateral */
          }
          .value-prop-column {
            width: 350px;
          }
        }



      `}</style>
      <main>
        <AppGatekeeper />
      </main>
    </AuthProvider>
  );
}