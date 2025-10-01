# IA Corretora de Redações ENEM - Instruções de Deploy

## 🚀 Como fazer o deploy no Vercel

### 1. Preparação
- Certifique-se de ter uma conta no GitHub
- Tenha uma conta no Vercel (vercel.com)
- API Key do Google Gemini configurada no código

### 2. Upload para GitHub
```bash
# No terminal, dentro da pasta ai-corretora-redacao:
git init
git add .
git commit -m "IA Corretora de Redações ENEM v1.0"
git branch -M main
git remote add origin https://github.com/SEU_USUARIO/ai-corretora-redacao.git
git push -u origin main
```

### 3. Deploy no Vercel
1. Acesse vercel.com e faça login
2. Clique em "New Project"
3. Conecte seu repositório GitHub
4. Configure as variáveis de ambiente (se necessário)
5. Clique em "Deploy"

### 4. Configurações importantes
- O arquivo `vercel.json` já está configurado
- A API está em `/api/analyze.js`
- Função serverless com timeout de 30s

### 5. Domínio personalizado (opcional)
- No painel do Vercel, vá em "Domains"
- Adicione seu domínio customizado
- Configure DNS conforme instruções

## 🔧 Estrutura do projeto
```
ai-corretora-redacao/
├── index.html          # Interface principal
├── styles.css          # Estilos (tema dark)
├── script.js           # JavaScript frontend
├── package.json        # Dependências
├── vercel.json         # Configuração Vercel
├── api/
│   └── analyze.js      # API Gemini
└── README.md           # Documentação
```

## 📋 Funcionalidades implementadas
✅ Interface responsiva tema dark
✅ Integração Gemini AI
✅ Análise por 5 competências ENEM
✅ Contador de palavras
✅ Feedback detalhado
✅ Sugestões de melhoria
✅ Sistema de notas colorido
✅ Função imprimir resultado

## 🎯 Próximas melhorias possíveis
- Sistema de histórico de análises
- Comparação entre versões de redação
- Exportação em PDF
- Integração com sistema de login
- API de estatísticas
- Cache de resultados

---
**Desenvolvido para Redação Reta Final** 🚀