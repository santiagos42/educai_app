require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// Função de Retry que será usada neste arquivo
async function fetchWithRetry(url, options, retries = 3, backoff = 300) {
  for (let i = 0; i < retries; i++) {
    try {
      const response = await fetch(url, options);
      // Se for um erro de servidor (5xx) ou sobrecarga (429), tentamos novamente
      if (!response.ok && (response.status === 429 || response.status >= 500)) {
        throw new Error(`Server error with status ${response.status}`);
      }
      // Se for sucesso ou outro tipo de erro (ex: 400 Bad Request), retornamos imediatamente
      return response;
    } catch (error) {
      if (i === retries - 1) { // Se for a última tentativa, desistimos e lançamos o erro
        console.error(`Final attempt failed: ${error.message}`);
        throw error;
      }
      const delay = backoff * Math.pow(2, i);
      console.log(`Attempt ${i + 1} failed. Retrying in ${delay}ms...`);
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// Endpoint principal da API
app.post('/api/generate', async (req, res) => {
  try {
    const { 
      type, 
      topic, 
      grade, 
      pages, 
      questionTypes, 
      className, 
      subjects, 
      startDate, 
      endDate,
      teacherName,
      discipline,
      weekdays,
      presentationStyle
    } = req.body;

    let prompt;
    let generationConfig = { response_mime_type: "application/json" };
    
    const allInstructions = {
      enem: "Para questões 'enem', elabore um enunciado com um texto-base (contexto). A pergunta deve exigir interpretação, raciocínio crítico ou aplicação de conhecimento interdisciplinar. Crie 4 alternativas (a, b, c, d), sendo uma correta e três distratores verossímeis. A justificativa deve explicar por que a alternativa correta responde ao enunciado.",
      quiz: "Para questões 'quiz', crie uma pergunta direta e objetiva para verificação rápida de conhecimento. Deve ter 4 alternativas de múltipla escolha. A pergunta deve ser clara e sem ambiguidades.",
      discursive: "Para questões 'discursive', formule um problema ou uma pergunta aberta que exija do aluno uma resposta escrita, bem estruturada e fundamentada. A questão deve estimular a análise, comparação, argumentação ou síntese de informações sobre o tema.",
      'true-false': "Para questões 'true-false', crie uma afirmação clara e inequívoca sobre o tópico. O aluno deverá julgá-la como verdadeira ou falsa. A justificativa é crucial e deve explicar detalhadamente por que a afirmação é verdadeira ou falsa, corrigindo a informação se for o caso."
    };

    switch(type) {
      case 'activity':
        const selectedInstructions = (questionTypes || [])
          .map(qType => allInstructions[qType])
          .filter(Boolean)
          .join(' \n\n');
        const questionCount = (pages || 1) * 8;
        prompt = `Como um especialista em elaboração de material didático, crie uma atividade avaliativa sobre "${topic}" para a série "${grade}", contendo exatamente ${questionCount} questões no total. As questões devem ser distribuídas **apenas** entre os seguintes tipos: ${questionTypes.join(', ')}. Siga RIGOROSAMENTE estas instruções detalhadas para cada tipo de questão solicitado: ${selectedInstructions} A resposta DEVE ser um único objeto JSON, contendo apenas uma chave principal "questions". O valor dessa chave deve ser um array de objetos, onde cada objeto representa uma questão e possui as seguintes chaves: "type" (o tipo da questão, ex: 'enem'), "statement", "options" (um array de strings, se aplicável), "answer" (o índice da resposta ou um booleano, se aplicável), e "justification".`;
        break;

      case 'lessonPlan':
        prompt = `Você é um professor brasileiro especialista em criar planos de aula. Crie um plano de aula detalhado sobre "${topic}" para "${grade}", alinhado à Base Nacional Comum Curricular (BNCC) e ao Currículo de Referência do Estado de Minas Gerais de 2025 (CRMG 2025) - com cuidado para não trazer informações incorretas; caso não tenha absoluta certeza da identificação de uma determinada habilidade da BNCC, não a coloque. Considere que cada aula possui 50 minutos, e, se necessário, faça o plano considerando duas aulas, caso o tema seja grande. Não utilize ** no texto. A resposta DEVE ser um único objeto JSON com as chaves: "objectives", "bnccSkills", "development", "resources", "assessment" (todos como arrays de strings).`;
        break;

      case 'planningAssistant':
        const weekdayNames = (weekdays || []).map(d => ['Domingo', 'Segunda-feira', 'Terça-feira', 'Quarta-feira', 'Quinta-feira', 'Sexta-feira', 'Sábado'][d]).join(', ');
        prompt = `Como um especialista em planejamento educacional, crie um cronograma de aulas detalhado para a disciplina de "${discipline}" para a turma "${className}", ministrado por "${teacherName || 'Professor(a)'}". O período do cronograma é de ${startDate} a ${endDate}, com aulas ocorrendo especificamente nos seguintes dias da semana: ${weekdayNames}. Os tópicos a serem cobertos são: "${subjects}". Sua tarefa é distribuir esses tópicos de forma lógica ao longo do período, criando um cronograma que intercale aulas expositivas, aulas de exercícios e avaliações. A resposta DEVE ser um único objeto JSON contendo uma chave principal "schedule". O valor dessa chave deve ser um array de objetos, onde cada objeto representa um dia de aula e possui as seguintes chaves: "date" (uma string com a data no formato "DD/MM/YYYY") e "activity" (uma string descrevendo o plano para aquele dia, incluindo o tópico principal). Não inclua dias sem aula no cronograma.`;
        break;

      case 'caseStudy':
        prompt = `Você é um professor especialista em criar estudos de casos otimizados para o ensino de estudantes. Crie um estudo de caso sobre "${topic}" para a disciplina de "${discipline}" (${grade}). A resposta DEVE ser um único objeto JSON com chaves: "title", "context", "problem", e "discussion_points". A chave "discussion_points" deve ser um array de objetos, onde cada objeto tem as chaves "question" (string) e "answer" (string com a resposta ou pontos esperados para discussão).`;
        break;

      case 'presentation':
        prompt = `Você é um professor especialista em criar apresentações de slides para alunos. Crie o conteúdo para uma apresentação de slides sobre "${topic}" para "${grade}", com um tom ${presentationStyle}. Certifique-se de que exista uma estética chamativa, rica em cores e em destaques. A resposta DEVE ser um único objeto JSON com a chave "slides", um array de objetos. Cada objeto deve ter chaves "title" (string) e "content" (array de strings para os bullet points). Gere de 5 a 7 slides.`;
        break;

      case 'summary':
        generationConfig = {};
        prompt = `Você é um professor especialista em criar resumos didáticos sobre várias áreas do conhecimento. Crie um resumo didático e bem estruturado sobre o tema '${topic}', com aproximadamente ${(pages || 1) * 500} palavras. O conteúdo deve ser formatado em HTML. Estruture a resposta da seguinte forma: 1. Um título principal para o resumo (criado pela IA, relacionado ao assunto) envolto em uma tag <h2>. 2. O corpo do texto deve ser dividido em parágrafos usando a tag <p>. 3. Destaque termos e conceitos importantes usando as tags <strong> para negrito e <em> para itálico. NÃO inclua nenhuma tag <style>, CSS, ou qualquer código que não seja o HTML do conteúdo em si. Também não inclua símbolos como *** ou ---.`;
        break;

      default:
        return res.status(400).json({ error: 'Tipo de geração inválido.' });
    }

    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chave de API não configurada no servidor.' });
    }

    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;
    
    const fetchOptions = {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig,
      }),
    };

    const googleResponse = await fetchWithRetry(googleApiUrl, fetchOptions);

    const responseData = await googleResponse.json();
    
    if (!googleResponse.ok) {
      throw new Error(responseData.error?.message || 'Erro desconhecido da API do Google.');
    }
    
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Erro no servidor proxy após todas as tentativas:', error.message);
    return res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Servidor proxy LOCAL rodando em http://localhost:${PORT}`);
});