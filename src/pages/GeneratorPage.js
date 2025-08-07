import { useState, useEffect, useCallback } from "react";
import { PenSquare, X, ClipboardList, CalendarDays, FileQuestion, Palette, BookOpen, Cpu, Loader, Lightbulb, ChevronLeft } from "lucide-react";
import toast from "react-hot-toast";

//WEEKDAY SELECTOR E QUESTION TYPE SELECTOR
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

const GeneratorScreen = ({ setView, setResult, type, initialTopic, initialGrade, onClose, isModal,goBack }) => {
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
        <button onClick={onClose ? onClose : goBack} className="form-button-secondary mt-3">
          {onClose ? <X size={18} className="mr-1"/> : <ChevronLeft size={18} className="mr-1"/>}
          {onClose ? 'Cancelar' : 'Voltar'}
        </button>
      </div>
    </div>
  );
};

export default GeneratorScreen;