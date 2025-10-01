// Elementos do DOM
const redacaoInput = document.getElementById('redacao-input');
const wordCountElement = document.getElementById('word-count');
const analyzeBtn = document.getElementById('analyze-btn');
const clearBtn = document.getElementById('clear-btn');
const loadingIndicator = document.getElementById('loading');
const resultsContent = document.getElementById('results-content');

// Contador de palavras
function updateWordCount() {
    const text = redacaoInput.value.trim();
    const words = text ? text.split(/\s+/).length : 0;
    wordCountElement.textContent = words;
    
    // Habilitar/desabilitar botão de análise
    analyzeBtn.disabled = words < 20; // Mínimo 20 palavras
    
    // Atualizar cor do contador baseado na quantidade de palavras
    if (words < 150) {
        wordCountElement.style.color = '#ff4757'; // Vermelho - muito pouco
    } else if (words >= 150 && words <= 400) {
        wordCountElement.style.color = '#00ff88'; // Verde - ideal
    } else {
        wordCountElement.style.color = '#f5a623'; // Amarelo - muito
    }
}

// Event listeners
redacaoInput.addEventListener('input', updateWordCount);
redacaoInput.addEventListener('paste', () => {
    setTimeout(updateWordCount, 100);
});

clearBtn.addEventListener('click', () => {
    redacaoInput.value = '';
    updateWordCount();
    showEmptyState();
});

analyzeBtn.addEventListener('click', analyzeRedacao);

// Função principal de análise
async function analyzeRedacao() {
    const redacao = redacaoInput.value.trim();
    
    if (!redacao || redacao.length < 50) {
        alert('Por favor, escreva uma redação com pelo menos 50 caracteres.');
        return;
    }
    
    // Mostrar loading
    showLoading();
    
    try {
        const response = await fetch('/api/analyze', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ redacao })
        });
        
        if (!response.ok) {
            throw new Error(`Erro ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (result.success && result.data) {
            displayResults(result.data);
        } else {
            throw new Error(result.error || 'Erro desconhecido na análise');
        }
        
    } catch (error) {
        console.error('Erro na análise:', error);
        showError(error.message);
    } finally {
        hideLoading();
    }
}

// Exibir estado de loading
function showLoading() {
    loadingIndicator.style.display = 'flex';
    analyzeBtn.disabled = true;
    analyzeBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Analisando...';
}

// Esconder loading
function hideLoading() {
    loadingIndicator.style.display = 'none';
    analyzeBtn.disabled = false;
    analyzeBtn.innerHTML = '<i class="fas fa-search"></i> Analisar Redação';
}

// Exibir erro
function showError(message) {
    resultsContent.innerHTML = `
        <div class="error-state">
            <i class="fas fa-exclamation-triangle"></i>
            <h3>Erro na Análise</h3>
            <p>${message}</p>
            <button onclick="analyzeRedacao()" class="btn-primary" style="margin-top: 20px;">
                <i class="fas fa-redo"></i>
                Tentar Novamente
            </button>
        </div>
    `;
}

// Exibir estado vazio
function showEmptyState() {
    resultsContent.innerHTML = `
        <div class="empty-state">
            <i class="fas fa-clipboard-list"></i>
            <h3>Aguardando redação...</h3>
            <p>Cole o texto da sua redação e clique em "Analisar" para receber feedback detalhado baseado nos critérios do ENEM.</p>
        </div>
    `;
}

// Exibir resultados da análise
function displayResults(data) {
    const { notaGeral, competencias, sugestoes, pontosFortesGerais, pontosFrageis } = data;
    
    // Calcular nível da nota
    let nivelNota = '';
    let corNota = '';
    if (notaGeral >= 900) {
        nivelNota = 'EXCELENTE';
        corNota = '#00ff88';
    } else if (notaGeral >= 800) {
        nivelNota = 'MUITO BOM';
        corNota = '#00a8ff';
    } else if (notaGeral >= 600) {
        nivelNota = 'BOM';
        corNota = '#f5a623';
    } else if (notaGeral >= 400) {
        nivelNota = 'REGULAR';
        corNota = '#ff6b6b';
    } else {
        nivelNota = 'PRECISA MELHORAR';
        corNota = '#ff4757';
    }
    
    resultsContent.innerHTML = `
        <div class="analysis-results">
            <!-- Nota Geral -->
            <div class="overall-score" style="background: linear-gradient(135deg, ${corNota}, ${corNota}dd);">
                <div class="score-number">${notaGeral}</div>
                <div class="score-label">${nivelNota}</div>
            </div>
            
            <!-- Competências -->
            <div class="competencias-section">
                <h3 style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px;">
                    <i class="fas fa-chart-line"></i>
                    Análise por Competências
                </h3>
                <div class="competencias-grid">
                    ${competencias.map(comp => `
                        <div class="competencia-card">
                            <div class="competencia-header">
                                <span class="competencia-title">
                                    <strong>Competência ${comp.numero}:</strong> ${comp.titulo}
                                </span>
                                <span class="competencia-score" style="background-color: ${getScoreColor(comp.nota)};">
                                    ${comp.nota}/200
                                </span>
                            </div>
                            <div class="competencia-feedback">
                                ${comp.feedback}
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
            
            <!-- Pontos Fortes e Fracos -->
            <div class="feedback-section" style="margin-top: 30px;">
                <h3>
                    <i class="fas fa-thumbs-up"></i>
                    Pontos Fortes
                </h3>
                <p style="color: var(--text-secondary); line-height: 1.6;">
                    ${pontosFortesGerais}
                </p>
            </div>
            
            <div class="feedback-section" style="margin-top: 20px;">
                <h3>
                    <i class="fas fa-exclamation-circle"></i>
                    Pontos a Melhorar
                </h3>
                <p style="color: var(--text-secondary); line-height: 1.6;">
                    ${pontosFrageis}
                </p>
            </div>
            
            <!-- Sugestões -->
            <div class="feedback-section" style="margin-top: 20px;">
                <h3>
                    <i class="fas fa-lightbulb"></i>
                    Sugestões de Melhoria
                </h3>
                <ul class="feedback-list">
                    ${sugestoes.map(sugestao => `
                        <li>${sugestao}</li>
                    `).join('')}
                </ul>
            </div>
            
            <!-- Ações -->
            <div class="results-actions" style="margin-top: 30px; text-align: center;">
                <button onclick="window.print()" class="btn-secondary">
                    <i class="fas fa-print"></i>
                    Imprimir Resultado
                </button>
                <button onclick="analyzeRedacao()" class="btn-primary">
                    <i class="fas fa-redo"></i>
                    Nova Análise
                </button>
            </div>
        </div>
    `;
    
    // Scroll suave para os resultados
    resultsContent.scrollIntoView({ behavior: 'smooth', block: 'start' });
}

// Função para determinar cor da nota
function getScoreColor(nota) {
    if (nota >= 180) return '#00ff88';
    if (nota >= 160) return '#00a8ff';
    if (nota >= 120) return '#f5a623';
    if (nota >= 80) return '#ff6b6b';
    return '#ff4757';
}

// Inicialização
document.addEventListener('DOMContentLoaded', () => {
    updateWordCount();
    showEmptyState();
    
    // Auto-resize do textarea
    redacaoInput.addEventListener('input', function() {
        this.style.height = 'auto';
        this.style.height = Math.max(400, this.scrollHeight) + 'px';
    });
});

// Exemplo de redação para demonstração
function loadExample() {
    const exemploRedacao = `A educação inclusiva para surdos no Brasil enfrenta desafios significativos que impedem o pleno desenvolvimento desses indivíduos. Apesar dos avanços legais, como a Lei de Libras, a realidade educacional ainda apresenta barreiras que limitam o acesso e a qualidade do ensino.

O primeiro obstáculo é a falta de profissionais qualificados. Muitas escolas não possuem intérpretes de Libras ou professores capacitados para trabalhar com alunos surdos, resultando em exclusão dentro do próprio ambiente escolar que deveria ser inclusivo.

Além disso, a infraestrutura inadequada das instituições de ensino agrava o problema. Salas sem recursos visuais adequados e metodologias ultrapassadas dificultam a comunicação e o aprendizado, perpetuando desigualdades educacionais.

Portanto, é fundamental que o Ministério da Educação, em parceria com secretarias estaduais, implemente programas de capacitação para educadores, invista em tecnologias assistivas e crie políticas públicas efetivas. Somente assim será possível garantir uma educação verdadeiramente inclusiva e de qualidade para a comunidade surda brasileira.`;
    
    redacaoInput.value = exemploRedacao;
    updateWordCount();
}

// Adicionar botão de exemplo (pode ser chamado via console para testes)
console.log('Para testar com uma redação de exemplo, digite: loadExample()');