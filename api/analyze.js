const { GoogleGenerativeAI } = require("@google/generative-ai");

// Verificar se API key está configurada
if (!process.env.GEMINI_API_KEY) {
  console.error("GEMINI_API_KEY não configurada");
}

const genAI = new GoogleGenerativeAI(
  process.env.GEMINI_API_KEY || "AIzaSyAn2R9MAHQEoItXZmJ9t_SXxzXCFmfNSVU"
);

module.exports = async function handler(req, res) {
  // Configurar CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    res.status(200).end();
    return;
  }

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Método não permitido" });
  }

  try {
    const { redacao } = req.body;

    console.log("Iniciando análise de redação");

    if (!redacao || redacao.trim().length < 50) {
      return res.status(400).json({
        error: "Redação muito curta. Mínimo de 50 caracteres.",
      });
    }

    // Inicializar modelo Gemini (usa fallback se env var não estiver definida)
    console.log("Inicializando modelo Gemini...");
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `Analise esta redação do ENEM e retorne APENAS um JSON válido:

"${redacao}"

Formato JSON:
{
  "notaGeral": 800,
  "competencias": [
    {"numero": 1, "titulo": "Domínio da Escrita", "nota": 160, "feedback": "Boa estrutura textual"},
    {"numero": 2, "titulo": "Compreensão do Tema", "nota": 180, "feedback": "Tema bem compreendido"},
    {"numero": 3, "titulo": "Argumentação", "nota": 160, "feedback": "Argumentos consistentes"},
    {"numero": 4, "titulo": "Coesão e Coerência", "nota": 140, "feedback": "Boa articulação"},
    {"numero": 5, "titulo": "Proposta de Intervenção", "nota": 160, "feedback": "Proposta detalhada"}
  ],
  "sugestoes": ["Melhorar conectivos", "Ampliar repertório"],
  "pontosFortesGerais": "Estrutura clara e argumentação sólida",
  "pontosFrageis": "Alguns desvios gramaticais pontuais"
}`;

    console.log("Enviando para Gemini...");
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    let analysisData;
    try {
      let cleanText = text.trim();
      cleanText = cleanText.replace(/```json/g, "").replace(/```/g, "").trim();
      
      const start = cleanText.indexOf('{');
      const end = cleanText.lastIndexOf('}');
      
      if (start !== -1 && end !== -1) {
        cleanText = cleanText.substring(start, end + 1);
      }
      
      analysisData = JSON.parse(cleanText);
      
      if (!analysisData.notaGeral || !analysisData.competencias) {
        throw new Error("JSON inválido");
      }
      
    } catch (parseError) {
      console.error("Erro parsing JSON:", parseError);
      
      analysisData = {
        notaGeral: 750,
        competencias: [
          { numero: 1, titulo: "Domínio da Escrita", nota: 150, feedback: "Análise temporariamente indisponível" },
          { numero: 2, titulo: "Compreensão do Tema", nota: 150, feedback: "Análise temporariamente indisponível" },
          { numero: 3, titulo: "Argumentação", nota: 150, feedback: "Análise temporariamente indisponível" },
          { numero: 4, titulo: "Coesão e Coerência", nota: 150, feedback: "Análise temporariamente indisponível" },
          { numero: 5, titulo: "Proposta de Intervenção", nota: 150, feedback: "Análise temporariamente indisponível" }
        ],
        sugestoes: ["Tente novamente para análise detalhada"],
        pontosFortesGerais: "Redação enviada com sucesso",
        pontosFrageis: "Aguardando processamento completo"
      };
    }

    return res.status(200).json({
      success: true,
      data: analysisData,
    });
    
  } catch (error) {
    console.error("Erro na análise:", error);

    if (error.message.includes("API_KEY")) {
      return res.status(500).json({
        error: "Erro de autenticação",
        message: "Problema com a configuração da API"
      });
    }

    if (error.message.includes("quota") || error.message.includes("limit")) {
      return res.status(429).json({
        error: "Limite atingido",
        message: "Tente novamente em alguns minutos"
      });
    }

    return res.status(500).json({
      error: "Erro interno do servidor",
      message: "Tente novamente em alguns instantes"
    });
  }
};