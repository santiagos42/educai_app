import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { BookOpen, FileText, Cpu, Download, CheckCircle, BrainCircuit, Sparkles, Loader, FilePlus, ChevronLeft, ArrowRight, FlaskConical, Atom, Lightbulb, Check, ClipboardList, CalendarDays, X, FileQuestion, GraduationCap, PenSquare, Palette, Dna } from 'lucide-react';
import toast, { Toaster } from 'react-hot-toast';

// Pacotes para download de arquivos
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import jsPDF from 'jspdf';

// =================================================================================
// Componentes de UI e Layout
// =================================================================================

const useTypingEffect = (text, speed = 50) => {
  const [displayedText, setDisplayedText] = useState('');
  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const typingInterval = setInterval(() => {
      if (i < text.length) {
        setDisplayedText(prev => prev + text.charAt(i));
        i++;
      } else {
        clearInterval(typingInterval);
      }
    }, speed);
    return () => clearInterval(typingInterval);
  }, [text, speed]);
  return displayedText;
};

const FeatureNoteCard = ({ icon, title, description, onClick, isHighlighted, color }) => {
  const rotation = useMemo(() => Math.random() * 4 - 2, []);

  return (
    <div
      onClick={onClick}
      className={`relative p-6 rounded-lg shadow-md transition-all duration-300 cursor-pointer hover:shadow-xl hover:scale-105 hover:-rotate-1 flex flex-col h-full ${color.bg} border-b-4 ${color.border} ${isHighlighted ? 'ring-4 ring-offset-2 ring-yellow-400' : ''}`}
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <div className="flex items-center gap-3 mb-3">
        <div className="flex-shrink-0">{React.cloneElement(icon, { size: 28, className: "text-slate-700" })}</div>
        <h2 className="text-2xl font-bold text-slate-800" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          {title}
        </h2>
      </div>
      <p className="text-slate-700 text-sm mb-4 flex-grow">{description}</p>
      <div className="mt-auto text-right font-bold text-slate-600 hover:text-slate-900">
        Criar agora &rarr;
      </div>
    </div>
  );
};

const AnimatedBackground = () => {
  const createShapes = (count) => Array.from({ length: count }).map((_, i) => ({
    id: i,
    style: {
      top: `${Math.random() * 100}%`,
      left: `${Math.random() * 100}%`,
      width: `${Math.random() * 150 + 50}px`,
      height: `${Math.random() * 150 + 50}px`,
      animationDuration: `${Math.random() * 30 + 25}s`,
      animationDelay: `${Math.random() * 10}s`,
    },
    type: Math.random() > 0.5 ? 'rounded-full' : 'rounded-2xl',
    color: Math.random() > 0.5 ? 'bg-sky-200/40' : 'bg-yellow-200/30'
  }));

  const shapes = useMemo(() => createShapes(15), []);

  return (
    <div className="absolute inset-0 w-full h-full overflow-hidden z-0">
      {shapes.map(shape => (
        <div key={shape.id} className={`absolute animate-slow-drift ${shape.type} ${shape.color}`} style={shape.style}></div>
      ))}
    </div>
  );
};

// =================================================================================
// Telas Principais
// =================================================================================

const WhiteboardHomeScreen = ({ setView }) => {
  const typedSubtitle = ("Sua assistente de IA para revolucionar a educação");
  const features = [
    { id: 'activityGenerator', icon: <PenSquare />, title: "Gerar Atividades Avaliativas", description: "Crie avaliações, exercícios, questões discursivas e mais." },
    { id: 'planningAssistant', icon: <CalendarDays />, title: "Planejamento de Aulas", description: "Organize seu bimestre distribuindo aulas e avaliações.", isHighlighted: true },
    { id: 'lessonPlanGenerator', icon: <ClipboardList />, title: "Criar Planos de Aula", description: "Elabore planos completos e alinhados à BNCC e ao CRMG." },
    { id: 'summaryGenerator', icon: <BookOpen />, title: "Gerar Resumos Didáticos", description: "Transforme tópicos complexos em resumos didáticos e objetivos." },
    { id: 'caseStudyGenerator', icon: <FileQuestion />, title: "Criar Estudos de Caso", description: "Gere cenários para promover o pensamento crítico e a aplicação prática.", isHighlighted: true },
    { id: 'presentationGenerator', icon: <Palette />, title: "Gerar Roteiro de Slides", description: "Crie roteiros de apresentações em slides para suas aulas de forma rápida e didática." },
  ];

  const noteColors = useMemo(() => {
    const colors = [
      { bg: 'bg-yellow-200/80', border: 'border-yellow-400' },
      { bg: 'bg-sky-200/80', border: 'border-sky-400' },
      { bg: 'bg-green-200/80', border: 'border-green-400' },
      { bg: 'bg-pink-200/80', border: 'border-pink-400' },
      { bg: 'bg-purple-200/80', border: 'border-purple-400' },
      { bg: 'bg-orange-200/80', border: 'border-orange-400' },
    ];
    return colors.sort(() => 0.5 - Math.random());
  }, []);

  return (
    <div className="whiteboard-bg w-full min-h-screen flex flex-col items-center justify-center p-4 lg:p-8 overflow-hidden relative">
      <AnimatedBackground />
      
      <div className="relative z-10 text-center flex flex-col items-center w-full max-w-7xl mx-auto">
        <div className="mb-4">
          <h1 className="text-6xl md:text-7xl font-bold text-slate-800" style={{ fontFamily: "'Patrick Hand', cursive" }}>
            EducAI - Assistente do Professor
          </h1>
        </div>
        <p className="text-lg md:text-xl text-slate-600 mb-16 h-7 font-sans">
          {typedSubtitle}
          <span className="animate-pulse text-slate-400">|</span>
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 w-full px-4">
          {features.map((feature, index) => (
            <div key={feature.id} style={{ animationDelay: `${150 * index}ms` }} className="animate-fade-in-up">
              <FeatureNoteCard
                onClick={() => setView(feature.id)}
                icon={feature.icon}
                title={feature.title}
                description={feature.description}
                isHighlighted={feature.isHighlighted}
                color={noteColors[index % noteColors.length]}
              />
            </div>
          ))}
        </div>
      </div>
      <div className="absolute bottom-4 left-0 right-0 z-10 pointer-events-none">
        <p className="text-center text-slate-500 text-sm" style={{ fontFamily: "'Patrick Hand', cursive" }}>
          EducAI - Soluções Inteligentes em Educação (2025). Todos os direitos reservados.
        </p>
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
    activity: { title: "Gerador de Atividades", message: "Crie sua atividade customizada.", button: "Gerar Atividade", icon: <PenSquare size={24} /> },
    lessonPlan: { title: "Gerador de Planos de Aula", message: "Elabore um plano de aula completo.", button: "Gerar Plano de Aula", icon: <ClipboardList size={24} /> },
    planningAssistant: { title: "Assistente de Planejamento", message: "Organize o roteiro de aulas do bimestre.", button: "Criar Planejamento", icon: <CalendarDays size={24} /> },
    caseStudy: { title: "Criador de Estudos de Caso", message: "Descreva o tema para o estudo de caso.", button: "Gerar Estudo de Caso", icon: <FileQuestion size={24} /> },
    presentation: { title: "Gerador de Roteiro de Slides", message: "Defina o tema para criar o roteiro dos slides.", button: "Gerar Roteiro", icon: <Palette size={24} /> },
    summary: { title: "Gerador de Resumos", message: "Digite o tema para criar um resumo.", button: "Gerar Resumo", icon: <BookOpen size={24} /> },
  };

  const { title, message, button, icon } = screenConfig[type] || screenConfig.summary;
  
  const gradeLevels = [
    "1º ao 5º ano - Ensino Fundamental I", "6º ano - Ensino Fundamental II", "7º ano - Ensino Fundamental II", "8º ano - Ensino Fundamental II", "9º ano - Ensino Fundamental II",
    "1º ano - Ensino Médio", "2º ano - Ensino Médio", "3º ano - Ensino Médio", "Ensino Superior"
  ];
  
  const handleGenerate = useCallback(async () => {
    if (isLoading) return;

    if (type === 'planningAssistant') {
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
      const baseUrl = process.env.REACT_APP_API_BASE_URL || '';
      const apiUrl = `${baseUrl}/api/generate`;

      const payload = {
        type,
        topic,
        pages,
        grade,
        startDate,
        endDate,
        subjects,
        className,
        teacherName,
        discipline,
        weekdays,
        questionTypes,
        presentationStyle,
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || `Erro do servidor: ${response.statusText}`);
      }
      
      if (!result.candidates || result.candidates.length === 0) {
        throw new Error("A API não retornou nenhum conteúdo válido.");
      }
      
      toast.success('Conteúdo gerado com sucesso!', {
        id: loadingToastId,
      });

      const generatedText = result.candidates[0].content.parts[0].text;
      
      let generatedResult;
      if (type === 'summary') {
        generatedResult = { type, topic, content: generatedText, pagesRequested: pages, grade };
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

        if (type === 'planningAssistant') {
            if (!parsedJson.schedule) throw new Error("A resposta da IA não contém a chave 'schedule' esperada.");
            generatedResult = { type, ...dataMap[type] };
        } else {
            generatedResult = { type, topic, grade, discipline, ...dataMap[type] };
        }
      }
      
      setResult(generatedResult);
      setView('result');

    } catch (err) {
      console.error(err);
      toast.error(`Ocorreu um erro: ${err.message}`, {
        id: loadingToastId,
      });
    } finally {
      setIsLoading(false);
    }
  }, [
    type, topic, pages, grade, startDate, endDate, subjects, className, 
    teacherName, discipline, weekdays, questionTypes, presentationStyle, 
    setResult, setView, isLoading
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

        {type === 'presentation' && (
          <div className="bg-sky-50 border-l-4 border-sky-400 text-sky-800 p-4 rounded-r-lg mb-8 text-sm" role="alert">
            <div className="flex">
              <div className="py-1"><Lightbulb className="h-5 w-5 mr-3 flex-shrink-0" /></div>
              <div>
                <p>
                  Professor(a), nesta função, você poderá gerar um <strong>roteiro</strong> de uma apresentação em slides sobre o tema escolhido. Este roteiro será um guia para que você possa montar a sua apresentação em um aplicativo de design de sua escolha, como o Canva, Google Slides ou PowerPoint. Basta passar o conteúdo gerado aqui para a sua apresentação!
                </p>
                <p className="mt-2 font-semibold">
                  Desejamos um excelente trabalho! Parabéns pela dedicação!
                </p>
              </div>
            </div>
          </div>
        )}
        
        <div className="space-y-4">
          {type !== 'planningAssistant' && <input type="text" value={topic} onChange={e => setTopic(e.target.value)} placeholder="Ex: Revolução Francesa, Ciclo da Água..." className="form-input" />}
          
          {['activity', 'lessonPlan', 'caseStudy', 'presentation', 'summary'].includes(type) && (
            <select value={grade} onChange={e => setGrade(e.target.value)} className="form-input">
              {gradeLevels.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          )}
          
          {['caseStudy', 'planningAssistant'].includes(type) && <input type="text" value={discipline} onChange={e => setDiscipline(e.target.value)} placeholder="Disciplina (Ex: História)" className="form-input" />}
          
          {type === 'planningAssistant' && (
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

          {type === 'presentation' && (
            <select value={presentationStyle} onChange={e => setPresentationStyle(e.target.value)} className="form-input">
              <option value="didatico">Didático e claro</option>
              <option value="formal">Formal e acadêmico</option>
              <option value="criativo">Criativo e envolvente</option>
            </select>
          )}

          {type === 'activity' && <QuestionTypeSelector selectedTypes={questionTypes} setSelectedTypes={setQuestionTypes} />}
          
          {['activity', 'summary'].includes(type) && (
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

const ResultScreen = ({ setView, setResult, result, previousResult, goBack }) => {
  const [editableResult, setEditableResult] = useState(null);
  const [pdfError, setPdfError] = useState('');
  const [isDownloading, setIsDownloading] = useState(false);
  const headerRef = useRef(null);
  const [modalInfo, setModalInfo] = useState(null);

  useEffect(() => {
    setEditableResult(JSON.parse(JSON.stringify(result)));
  }, [result]);
  
  const openGeneratorModal = (info) => {
    setModalInfo({ ...info, grade: result.className });
  };
  const closeGeneratorModal = () => setModalInfo(null);

  const homeView = useMemo(() => {
    const viewMap = {
        presentation: 'presentationGenerator',
        activity: 'activityGenerator',
        lessonPlan: 'lessonPlanGenerator',
        planningAssistant: 'planningAssistant',
        caseStudy: 'caseStudyGenerator',
        summary: 'summaryGenerator',
    };
    return viewMap[result.type] || 'home';
  }, [result.type]);

  const handleContentChange = (path, value) => {
    setEditableResult(prevResult => {
      const newResult = JSON.parse(JSON.stringify(prevResult));
      let current = newResult;
      for (let i = 0; i < path.length - 1; i++) {
        current = current[path[i]];
      }
      current[path[path.length - 1]] = value;
      return newResult;
    });
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
        <div className="w-full max-w-6xl mx-auto">
          <div className="text-center mb-8 animate-fade-in">
            <CheckCircle className="mx-auto text-green-500 mb-3" size={48} />
            <h1 className="text-3xl font-bold text-slate-900">Conteúdo Gerado com Sucesso!</h1>
            <p className="text-slate-600 mt-2">Revise, edite se necessário, e faça o download abaixo.</p>
          </div>

          <div className="flex flex-col lg:flex-row gap-8">
            <div className="w-full lg:w-1/4 lg:sticky top-8 self-start animate-fade-in-up">
              <div className="bg-white/50 backdrop-blur-md rounded-2xl p-5 feature-card-glow-border">
                <h2 className="text-lg font-bold text-slate-800 border-b border-slate-300 pb-3 mb-4">Ações</h2>
                <div className="space-y-3">
                  {previousResult && (
                    <button onClick={goBack} className="form-button-primary w-full">
                      <ChevronLeft size={18} className="mr-1"/> Voltar ao Planejamento
                    </button>
                  )}
                  <button onClick={handleDownloadPdf} disabled={isDownloading} className={`w-full ${previousResult ? 'form-button-secondary' : 'form-button-primary'}`}>
                    {isDownloading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><Download className="mr-2" size={20}/> Download PDF</>}
                  </button>
                  <button onClick={() => handleDownloadDocx()} disabled={isDownloading} className="form-button-secondary w-full">
                    {isDownloading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><FileText className="mr-2" size={20}/> Download DOCX</>}
                  </button>
                  {editableResult.type === 'activity' && (
                    <>
                    <button onClick={handleDownloadAnswerKeyPdf} disabled={isDownloading} className="form-button-secondary w-full">
                      {isDownloading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><GraduationCap className="mr-2" size={20}/> Gabarito (PDF)</>}
                    </button>
                    <button onClick={() => handleDownloadDocx(true)} disabled={isDownloading} className="form-button-secondary w-full">
                      {isDownloading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><GraduationCap className="mr-2" size={20}/> Gabarito (DOCX)</>}
                    </button>
                    </>
                  )}
                  {editableResult.type === 'caseStudy' && (
                    <>
                    <button onClick={handleDownloadCaseStudyAnswersPdf} disabled={isDownloading} className="form-button-secondary w-full">
                      {isDownloading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><GraduationCap className="mr-2" size={20}/> Respostas (PDF)</>}
                    </button>
                    <button onClick={() => handleDownloadDocx(false, true)} disabled={isDownloading} className="form-button-secondary w-full">
                      {isDownloading ? <><Loader className="animate-spin mr-2" size={20}/> Gerando...</> : <><GraduationCap className="mr-2" size={20}/> Respostas (DOCX)</>}
                    </button>
                    </>
                  )}
                  {!previousResult && (
                    <>
                      <button onClick={() => setView(homeView)} className="form-button-secondary w-full">
                        <FilePlus className="mr-2" size={20}/> Criar Novo
                      </button>
                      <button onClick={() => setView('home')} className="form-button-tertiary w-full">
                        <ChevronLeft size={18} className="mr-1"/> Início
                      </button>
                    </>
                  )}
                </div>
                {pdfError && <p className="text-sm text-red-500 mt-3">{pdfError}</p>}
              </div>
            </div>

            <div className="w-full lg:w-3/4 animate-fade-in-up" style={{animationDelay: '200ms'}}>
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
// Componentes de Conteúdo Editáveis
// =================================================================================
const Editable = ({ path, children, onContentChange, as = 'p', className = '' }) => {
  const handleBlur = (e) => {
    const newContent = as === 'p' || as === 'h2' || as === 'h3' ? e.target.innerHTML : e.target.innerText;
    onContentChange(path, newContent);
  };
  const Tag = as;
  return (
    <Tag
      contentEditable
      suppressContentEditableWarning
      onBlur={handleBlur}
      className={`editable-content ${className}`}
      dangerouslySetInnerHTML={ as !== 'span' ? { __html: children } : undefined }
    >
      {as === 'span' ? children : undefined}
    </Tag>
  );
};

const PresentationContent = ({ result, onContentChange }) => (
  <div className="p-8 document-font">
    <div className="text-center mb-6">
      <Editable path={['topic']} as="h2" className="text-2xl font-bold" onContentChange={onContentChange}>{result.topic}</Editable>
    </div>
    <div className="presentation-grid">
      {(result.slides || []).map((slide, index) => (
        <div key={index} className="slide-preview">
          <div className="slide-header">
            <span className="slide-number">{index + 1}</span>
            <Editable path={['slides', index, 'title']} onContentChange={onContentChange} as="h3" className="slide-title">{slide.title}</Editable>
          </div>
          <ul className="slide-content">
            {(slide.content || []).map((point, i) => 
              <li key={i}>
                <Editable path={['slides', index, 'content', i]} onContentChange={onContentChange} as="span">{point}</Editable>
              </li>
            )}
          </ul>
        </div>
      ))}
    </div>
  </div>
);

const SchoolHeader = ({ headerRef }) => {
  const headerHTML = `
    <table class="header-table">
      <tbody>
        <tr>
          <th colspan="4">NOME DA ESCOLA</th>
        </tr>
        <tr>
          <td style="width: 75%;" colspan="3"><strong>Disciplina:</strong>&nbsp;</td>
          <td style="width: 25%;" colspan="1"><strong>Bimestre:</strong>&nbsp;</td>
        </tr>
        <tr>
          <td style="width: 25%;"><strong>Série:</strong>&nbsp;</td>
          <td style="width: 50%;" colspan="2"><strong>Turma:</strong>&nbsp;</td>
          <td style="width: 25%;"><strong>Ano:</strong>&nbsp;</td>
        </tr>
        <tr>
          <td colspan="4"><strong>Professor (a):</strong>&nbsp;</td>
        </tr>
        <tr>
          <td colspan="4"><strong>Aluno (a):</strong>&nbsp;</td>
        </tr>
      </tbody>
    </table>
    <p class="header-tip">
      <strong>Dica:</strong> O cabeçalho acima é um protótipo editável. Para um resultado perfeito, incluindo a logo da sua escola, recomendamos copiar o conteúdo para um editor como Word ou Google Docs.
    </p>
  `;

  return (
    <div 
      ref={headerRef} 
      contentEditable 
      suppressContentEditableWarning 
      className="editable-header-space"
      dangerouslySetInnerHTML={{ __html: headerHTML }}
    />
  );
};

const SummaryContent = ({ result, onContentChange, headerRef }) => {
  const titleRef = useRef(null);
  const bodyRef = useRef(null);

  const handleContentUpdate = useCallback(() => {
    const titleHTML = titleRef.current ? titleRef.current.innerHTML : '';
    const bodyHTML = bodyRef.current ? bodyRef.current.innerHTML : '';
    
    const newContent = `<h2>${titleHTML}</h2>${bodyHTML}`;
    onContentChange(['content'], newContent);
  }, [onContentChange]);

  const [initialTitle, initialBody] = useMemo(() => {
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = result.content;
    const h2 = tempDiv.querySelector('h2');
    let title = 'Título do Resumo';
    if (h2) {
      title = h2.innerHTML;
      h2.remove(); 
    }
    const body = tempDiv.innerHTML;
    return [title, body];
  }, [result.content]);

  return (
    <div className="p-8 document-font">
      <SchoolHeader headerRef={headerRef} />
      <h2 
        ref={titleRef}
        className="editable-content text-2xl font-bold text-center mb-6"
        contentEditable
        suppressContentEditableWarning
        onBlur={handleContentUpdate}
        dangerouslySetInnerHTML={{ __html: initialTitle }}
      />
      <div className="two-column-layout">
         <div
          ref={bodyRef}
          className="editable-content"
          contentEditable
          suppressContentEditableWarning
          onBlur={handleContentUpdate}
          dangerouslySetInnerHTML={{ __html: initialBody }}
        />
      </div>
    </div>
  );
};


const ActivityContent = ({ result, onContentChange, headerRef }) => (
  <div className="p-8 document-font">
    <SchoolHeader headerRef={headerRef} />
    <div className="two-column-layout">
    {(result.questions || []).map((q, index) => (
      <div key={index} className="mb-6 question-block">
        <Editable path={['questions', index, 'statement']} onContentChange={onContentChange} as="p" className="font-bold">
          {`${index + 1}. ${q.statement}`}
        </Editable>

        {['enem', 'quiz'].includes(q.type) && (
          <ul className="list-none mt-2 pl-4 space-y-1">
            {(q.options || []).map((opt, i) => 
              <li key={i}>
                {`${'abcde'[i]}) `}<Editable path={['questions', index, 'options', i]} onContentChange={onContentChange} as="span">{opt}</Editable>
              </li>
            )}
          </ul>
        )}
        {q.type === 'true-false' && <div className="mt-2 pl-4"><p>( ) Verdadeiro ( ) Falso</p></div>}
        {q.type === 'discursive' && <div className="mt-3 h-24 border-b border-gray-400"></div>}
      </div>
    ))}
    </div>
  </div>
);

const LessonPlanContent = ({ result, onContentChange }) => (
  <div className="p-8 document-font">
    <Editable path={['topic']} as="h2" className="text-2xl font-bold text-center mb-2" onContentChange={onContentChange}>{result.topic}</Editable>
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

const PlanningContent = ({ result, onContentChange, onOpenModal }) => (
  <div className="p-8 document-font">
    <div className="text-center mb-8">
      <Editable path={['className']} as="h2" className="text-2xl font-bold" onContentChange={onContentChange}>{`Planejamento - ${result.className}`}</Editable>
      <Editable path={['teacherName']} as="p" className="text-lg" onContentChange={onContentChange}>{`Prof(a): ${result.teacherName || 'A ser preenchido'} | Disciplina: ${result.discipline}`}</Editable>
      <p className="text-sm mt-2 text-gray-600"><strong>Assuntos:</strong> {result.subjects}</p>
    </div>
    <div className="space-y-3">
      {(result.schedule || []).map((item, index) => (
        <p key={index} className="break-inside-avoid">
          <strong>
            <Editable path={['schedule', index, 'date']} as="span" onContentChange={onContentChange}>
              {item.date}
            </Editable>
          </strong>
          {': '}<Editable path={['schedule', index, 'activity']} as="span" onContentChange={onContentChange}>
            {item.activity}
          </Editable>
        </p>
      ))}
    </div>

    <div className="mt-8 pt-6 border-t-2 border-dashed border-gray-300">
      <h3 className="section-title">Atividades Sugeridas</h3>
      <p className="mb-4 text-sm text-gray-600" style={{textAlign: 'left', lineHeight: '1.4'}}>Para cada tópico do seu planejamento, gere materiais de apoio com um único clique. A IA usará o tema da aula como base para criar o conteúdo, que será aberto em uma nova tela para edição e download.</p>
      <div className="space-y-4">
        {(result.schedule || []).map((item, index) => (
          <div key={index} className="p-3 bg-slate-50 rounded-lg border border-slate-200 break-inside-avoid">
            <p className="font-bold text-slate-800 text-base" style={{textAlign: 'left'}}>{item.date}: <span className="font-normal">{item.activity}</span></p>
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              <button onClick={() => onOpenModal({ type: 'lessonPlan', topic: item.activity })} className="sug-button">
                <ClipboardList size={14} className="mr-1.5"/> Plano de Aula
              </button>
              <button onClick={() => onOpenModal({ type: 'summary', topic: item.activity })} className="sug-button">
                <BookOpen size={14} className="mr-1.5"/> Resumo
              </button>
              <button onClick={() => onOpenModal({ type: 'activity', topic: item.activity })} className="sug-button">
                <PenSquare size={14} className="mr-1.5"/> Atividades
              </button>
              <button onClick={() => onOpenModal({ type: 'caseStudy', topic: item.activity })} className="sug-button">
                <FileQuestion size={14} className="mr-1.5"/> Estudo de Caso
              </button>
              <button onClick={() => onOpenModal({ type: 'presentation', topic: item.activity })} className="sug-button">
                <Palette size={14} className="mr-1.5"/> Gerar Slides
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
);

const CaseStudyContent = ({ result, onContentChange }) => (
  <div className="p-8 document-font">
    <Editable path={['case', 'title']} as="h2" className="text-2xl font-bold text-center mb-2" onContentChange={onContentChange}>{result.case.title}</Editable>
    <p className="text-center text-gray-600 mb-6">Estudo de Caso: {result.topic} ({result.grade})</p>
    <div className="space-y-4">
      <div><h3 className="section-title">Contexto</h3><Editable path={['case', 'context']} as="p" onContentChange={onContentChange}>{result.case.context}</Editable></div>
      <div className="p-4 bg-red-50 border border-red-200 rounded-lg"><h3 className="font-bold text-red-800 mb-1">Problema Central</h3><Editable path={['case', 'problem']} as="p" className="text-red-900" onContentChange={onContentChange}>{result.case.problem}</Editable></div>
      <div>
        <h3 className="section-title">Questões para Discussão</h3>
        <ol className="list-decimal pl-5">
          {(result.case.discussion_points || []).map((point, i) => (
            <li key={i}>
              <Editable path={['case', 'discussion_points', i, 'question']} as="span" onContentChange={onContentChange}>
                {point.question}
              </Editable>
            </li>
          ))}
        </ol>
      </div>
    </div>
  </div>
);

const QuestionTypeSelector = ({ selectedTypes, setSelectedTypes }) => {
  const questionOptions = {
    enem: { label: 'Modelo ENEM' }, quiz: { label: 'Fixação' },
    discursive: { label: 'Discursiva' }, 'true-false': { label: 'V ou F' },
  };
  const handleTypeChange = (type) => {
    const newTypes = selectedTypes.includes(type) ? selectedTypes.filter((t) => t !== type) : [...selectedTypes, type];
    if (newTypes.length > 0) setSelectedTypes(newTypes); 
  };
  return (
    <div>
      <label className="form-label">Tipos de questão:</label>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
      {Object.entries(questionOptions).map(([key, { label }]) => (
        <button key={key} type="button" onClick={() => handleTypeChange(key)}
          className={`p-3 rounded-lg border-2 text-sm font-semibold transition-all ${selectedTypes.includes(key) ? 'bg-sky-500 border-sky-500 text-white' : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400 hover:bg-slate-200'}`}>
          {label}
        </button>
      ))}
      </div>
    </div>
  );
};

const WeekdaySelector = ({ selectedDays, onDayChange }) => {
    const weekdays = [
      { label: 'Seg', value: 1 }, { label: 'Ter', value: 2 }, { label: 'Qua', value: 3 },
      { label: 'Qui', value: 4 }, { label: 'Sex', value: 5 },
    ];

    const toggleDay = (dayValue) => {
      const newSelectedDays = selectedDays.includes(dayValue)
        ? selectedDays.filter(d => d !== dayValue)
        : [...selectedDays, dayValue].sort((a, b) => a - b);
      onDayChange(newSelectedDays);
    };

    return (
      <div>
        <label className="form-label">Dias de aula na semana:</label>
        <div className="flex items-center gap-2 flex-wrap">
          {weekdays.map((day) => (
            <button
              key={day.value}
              type="button"
              onClick={() => toggleDay(day.value)}
              className={`w-12 h-10 rounded-lg border-2 font-bold transition-all flex items-center justify-center ${
                selectedDays.includes(day.value)
                  ? 'bg-sky-500 border-sky-500 text-white'
                  : 'bg-slate-100 border-slate-300 text-slate-700 hover:border-slate-400'
              }`}
            >
              {day.label}
            </button>
          ))}
        </div>
      </div>
    );
};

export default function App() {
  const [view, setView] = useState('home'); 
  const [result, setResult] = useState(null);
  const [previousResult, setPreviousResult] = useState(null);

  const handleSetResult = (newResult, keepHistory = false) => {
    if (keepHistory && result) {
      setPreviousResult(result);
    } else {
      setPreviousResult(null);
    }
    setResult(newResult);
    setView('result'); 
  };

  const handleGoBackResult = () => {
    if (previousResult) {
      setResult(previousResult);
      setPreviousResult(null);
    }
  };

  const renderView = () => {
    switch (view) {
      case 'activityGenerator': return <GeneratorScreen setView={setView} setResult={handleSetResult} type="activity" />;
      case 'summaryGenerator': return <GeneratorScreen setView={setView} setResult={handleSetResult} type="summary" />;
      case 'lessonPlanGenerator': return <GeneratorScreen setView={setView} setResult={handleSetResult} type="lessonPlan" />;
      case 'planningAssistant': return <GeneratorScreen setView={setView} setResult={handleSetResult} type="planningAssistant" />;
      case 'caseStudyGenerator': return <GeneratorScreen setView={setView} setResult={handleSetResult} type="caseStudy" />;
      case 'presentationGenerator': return <GeneratorScreen setView={setView} setResult={handleSetResult} type="presentation" />;
      case 'result': 
        if (!result) return <WhiteboardHomeScreen setView={setView} />;
        return <ResultScreen 
                  setView={setView} 
                  setResult={handleSetResult} 
                  result={result} 
                  previousResult={previousResult}
                  goBack={handleGoBackResult}
                />;
      case 'home':
      default: return <WhiteboardHomeScreen setView={setView} />;
    }
  };

  return (
    <>
      <Toaster 
        position="top-center"
        reverseOrder={false}
        toastOptions={{
          duration: 5000,
          style: {
            background: '#363636',
            color: '#fff',
          },
        }}
      />

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&family=Patrick+Hand&display=swap');
        
        body { 
          font-family: 'Inter', sans-serif; 
          -webkit-font-smoothing: antialiased; 
          -moz-osx-font-smoothing: grayscale; 
        }
        
        .whiteboard-bg {
          background-color: #f8fafc;
          background-image:
            linear-gradient(rgba(100, 116, 139, 0.1) 1px, transparent 1px),
            linear-gradient(to right, rgba(100, 116, 139, 0.1) 1px, transparent 1px);
          background-size: 2rem 2rem;
        }
        
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out forwards; }
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in-up { opacity: 0; animation: fadeInUp 0.6s ease-out forwards; }

        @keyframes slow-drift {
          0% { transform: translateY(20px) translateX(-20px) rotate(0deg); opacity: 0; }
          25% { opacity: 1; }
          75% { opacity: 1; }
          100% { transform: translateY(-20px) translateX(20px) rotate(15deg); opacity: 0; }
        }
        .animate-slow-drift {
          animation: slow-drift infinite ease-in-out;
        }
        
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

      `}</style>
      <main>{renderView()}</main>
    </>
  );
}