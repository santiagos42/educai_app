// api/generate.js

// Não precisamos mais do 'dotenv' aqui, a Vercel injeta as variáveis de ambiente
// Não precisamos de 'express' ou 'cors', a Vercel gerencia isso.
const fetch = require('node-fetch');

// A função exportada é o que a Vercel irá executar
export default async function handler(req, res) {
  // Em Funções Sem Servidor, a requisição (req) e a resposta (res) são os parâmetros

  // Garante que o método seja POST
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { prompt, generationConfig } = req.body;

    if (!prompt) {
      return res.status(400).json({ error: 'O prompt é obrigatório.' });
    }

    // A Vercel nos permite acessar as variáveis de ambiente diretamente
    const apiKey = process.env.REACT_APP_GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(500).json({ error: 'Chave de API não configurada no ambiente do servidor.' });
    }

    const googleApiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${apiKey}`;

    const googleResponse = await fetch(googleApiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: generationConfig || {},
      }),
    });

    const responseData = await googleResponse.json();

    if (!googleResponse.ok) {
      console.error('Erro da API do Google:', responseData);
      throw new Error(responseData.error?.message || 'Erro desconhecido da API do Google.');
    }

    // Retorna a resposta com status 200 OK
    return res.status(200).json(responseData);

  } catch (error) {
    console.error('Erro na Função Sem Servidor:', error.message);
    return res.status(500).json({ error: error.message });
  }
}