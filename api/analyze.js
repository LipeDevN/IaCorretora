const { GoogleGenerativeAI } = require('@google/generative-ai');

// Inicializar Gemini com a API key do ambiente
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyAn2R9MAHQEoItXZmJ9t_SXxzXCFmfNSVU');

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const { redacao } = req.body;

    if (!redacao || redacao.trim().length < 50) {
      return res.status(400).json({ 
        error: 'Redação muito curta. Mínimo de 50 caracteres.' 
      });
    }

    // Inicializar o modelo Gemini
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

    // Prompt especializado para correção de redação ENEM
    const prompt = `
Você é um especialista em correção de redações do ENEM com 20 anos de experiência. Analise a redação abaixo segundo os 5 critérios oficiais do ENEM e forneça uma resposta EXCLUSIVAMENTE no formato JSON válido, sem comentários adicionais.

REDAÇÃO PARA ANÁLISE:
"${redacao}"

CRITÉRIOS DE AVALIAÇÃO (cada um vale de 0 a 200 pontos):

1. COMPETÊNCIA 1 - Domínio da modalidade escrita formal da língua portuguesa
2. COMPETÊNCIA 2 - Compreender a proposta de redação e aplicar conceitos das várias áreas
3. COMPETÊNCIA 3 - Selecionar, relacionar, organizar e interpretar informações
4. COMPETÊNCIA 4 - Demonstrar conhecimento dos mecanismos linguísticos necessários para a construção da argumentação
5. COMPETÊNCIA 5 - Elaborar proposta de intervenção para o problema abordado

Responda APENAS com um JSON válido neste formato exato:

{
  "notaGeral": 850,
  "competencias": [
    {
      "numero": 1,
      "titulo": "Domínio da Escrita",
      "nota": 160,
      "feedback": "Texto bem estruturado com poucos desvios da norma culta..."
    },
    {
      "numero": 2,
      "titulo": "Compreensão do Tema",
      "nota": 180,
      "feedback": "Demonstra boa compreensão do tema proposto..."
    },
    {
      "numero": 3,
      "titulo": "Argumentação",
      "nota": 170,
      "feedback": "Argumentos bem desenvolvidos com repertório adequado..."
    },
    {
      "numero": 4,
      "titulo": "Coesão e Coerência",
      "nota": 160,
      "feedback": "Boa articulação entre as partes do texto..."
    },
    {
      "numero": 5,
      "titulo": "Proposta de Intervenção",
      "nota": 180,
      "feedback": "Proposta clara e detalhada respeitando direitos humanos..."
    }
  ],
  "sugestoes": [
    "Varie mais os conectivos para melhorar a fluidez",
    "Desenvolva melhor os argumentos com mais exemplos",
    "Detalhe mais a proposta de intervenção"
  ],
  "pontosFortesGerais": "Estrutura clara, boa argumentação, tema bem compreendido",
  "pontosFrageis": "Alguns desvios gramaticais pontuais, proposta pode ser mais detalhada"
}`;

    // Fazer a requisição para o Gemini
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    // Tentar fazer parse do JSON
    let analysisData;
    try {
      // Limpar o texto removendo possíveis caracteres extras
      const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
      analysisData = JSON.parse(cleanText);
    } catch (parseError) {
      console.error('Erro ao fazer parse do JSON:', parseError);
      console.error('Resposta recebida:', text);
      
      // Fallback com estrutura básica
      analysisData = {
        notaGeral: 750,
        competencias: [
          {
            numero: 1,
            titulo: "Domínio da Escrita",
            nota: 150,
            feedback: "Análise em processamento. Tente novamente."
          },
          {
            numero: 2,
            titulo: "Compreensão do Tema",
            nota: 150,
            feedback: "Análise em processamento. Tente novamente."
          },
          {
            numero: 3,
            titulo: "Argumentação",
            nota: 150,
            feedback: "Análise em processamento. Tente novamente."
          },
          {
            numero: 4,
            titulo: "Coesão e Coerência",
            nota: 150,
            feedback: "Análise em processamento. Tente novamente."
          },
          {
            numero: 5,
            titulo: "Proposta de Intervenção",
            nota: 150,
            feedback: "Análise em processamento. Tente novamente."
          }
        ],
        sugestoes: ["Tente analisar novamente para obter feedback detalhado"],
        pontosFortesGerais: "Redação submetida com sucesso",
        pontosFrageis: "Análise detalhada em processamento"
      };
    }

    // Validar estrutura mínima
    if (!analysisData.notaGeral || !analysisData.competencias || !Array.isArray(analysisData.competencias)) {
      throw new Error('Estrutura de resposta inválida');
    }

    return res.status(200).json({
      success: true,
      data: analysisData
    });

  } catch (error) {
    console.error('Erro na análise:', error);
    
    return res.status(500).json({
      error: 'Erro interno do servidor',
      message: error.message
    });
  }
};