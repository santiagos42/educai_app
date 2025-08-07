import { useState, useEffect, useMemo, useRef } from 'react';
import toast from 'react-hot-toast';
import { saveGeneration } from '../firebase';
import { useAuth } from '../contexts/AuthContext';

// ÍCONES
import { ChevronLeft, Download, FileText, FilePlus, HardDrive, Loader, GraduationCap, Save, CheckCircle } from 'lucide-react';

// FUNCIONALIDADES
import ActivityContent from '../components/results/ActivityContent';
import LessonPlanContent from '../components/results/LessonPlanContent';
import SummaryContent from '../components/results/SummaryContent';
import CaseStudyContent from '../components/results/CaseStudyContent';
import PresentationContent from '../components/results/PresentationContent';    
import PlanningContent from '../components/results/PlanningContent';
import SchoolHeader from '../components/results/SchoolHeader';

// COMPONENTES
import SaveToHistoryModal from '../components/common/SaveToHistoryModal';
import GeneratorScreen from './GeneratorPage';
import AuthHeader from '../components/layout/AuthHeader';

// PDF E DOCX
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, Table, TableCell, TableRow, WidthType } from 'docx';
import { saveAs } from 'file-saver';

// FUNÇÃO PRINCIPAL
const ResultScreen = ({ setView, setResult, result, goBack, onOpenPremiumModal }) => {
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
      console.log("PASSO 1: Objeto sendo enviado para o Firebase:", JSON.stringify(editableResult, null, 2)); // linha para diagnóstico
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
        <header className="w-full max-w-6xl mx-auto flex justify-end items-center py-4 px-4 md:px-0">
          <AuthHeader onOpenPremiumModal={onOpenPremiumModal} />
        </header>
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

                    <button onClick={goBack} className="form-button-secondary w-full">
                      <ChevronLeft size={18} className="mr-1" /> Voltar
                    </button>

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
                    <>
                      <button onClick={() => setView(homeView)} className="form-button-secondary w-full">
                        <FilePlus className="mr-2" size={20} /> Criar Novo
                      </button>
                      <button onClick={() => setView('history')} className="form-button-tertiary w-full">
                        <HardDrive size={18} className="mr-2" /> Voltar ao Meu Drive
                      </button>
                    </>
                  
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

export default ResultScreen;