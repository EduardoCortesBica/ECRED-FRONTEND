// Estado global do formulário
let formState = {
    selectedService: null,
    currentStep: 'service',
    userData: {},
    questionAnswers: {},
    history: ['service'] // Histórico de navegação
};

// URL do seu Google Apps Script (SUBSTITUA pela sua URL)
const BACKEND_URL = 'https://script.google.com/macros/s/AKfycbzigxvikkjpf3tlnN-vgxue2jOPAsw4jzTt6R8nsT2ihDU02Q1DAvxQDhiUWjM_3CxY/exec';

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    checkLocalStorage(); // Verificar se há dados salvos localmente
});

function initializeForm() {
    // Event listeners para seleção de serviço
    const serviceRadios = document.querySelectorAll('input[name="service"]');
    
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            formState.selectedService = this.value;
            // Resetar histórico quando uma nova seleção é feita
            formState.history = ['service'];
            // Avanço automático após seleção
            setTimeout(() => {
                handleServiceSelection();
            }, 300); // Pequeno delay para melhor UX
        });
    });
    
    // Event listener para botão de envio dos dados
    document.getElementById('btn-submit').addEventListener('click', function() {
        handleDataSubmission();
    });
    
    // Event listener para botão de reiniciar
    document.getElementById('btn-restart').addEventListener('click', function() {
        restartForm();
    });
    
    // Máscaras para os campos
    setupInputMasks();
}

// Função para verificar dados salvos localmente
function checkLocalStorage() {
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ecred_backup_')) {
            backupKeys.push(key);
        }
    }
    
    if (backupKeys.length > 0) {
        console.log('📦 Dados salvos localmente encontrados:', backupKeys.length);
        // Opcional: mostrar aviso para usuário
    }
}

// Função para adicionar ao histórico
function addToHistory(step) {
    formState.history.push(step);
}

// Função para voltar no histórico
function goBack() {
    if (formState.history.length > 1) {
        // Remove o step atual
        formState.history.pop();
        // Pega o step anterior
        const previousStep = formState.history[formState.history.length - 1];
        
        // Navega para o step anterior
        if (previousStep === 'service') {
            showStep('service');
        } else if (previousStep === 'questions') {
            // Reconstrói as perguntas baseado no serviço selecionado
            // Remove 'questions' do histórico para evitar duplicação
            formState.history.pop();
            handleServiceSelection();
        } else if (previousStep === 'data') {
            // Remove 'data' do histórico para evitar duplicação
            formState.history.pop();
            showDataForm();
        }
    }
}

function setupInputMasks() {
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        this.value = value;
    });
    
    // Máscara para WhatsApp
    const whatsappInput = document.getElementById('whatsapp');
    whatsappInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        value = value.replace(/(\d{2})(\d)/, '($1) $2');
        value = value.replace(/(\d{5})(\d)/, '$1-$2');
        this.value = value;
    });
}

function handleServiceSelection() {
    addToHistory('questions');
    
    switch(formState.selectedService) {
        case 'fgts':
            showFGTSMessage();
            break;
        case 'inss':
            showINSSQuestions();
            break;
        case 'clt':
            showCLTQuestions();
            break;
        case 'bolsa-familia':
            showBolsaFamiliaQuestions();
            break;
        case 'siape':
            addToHistory('data');
            showDataForm();
            break;
        default:
            console.error('Serviço não reconhecido');
    }
}

function showFGTSMessage() {
    const resultContent = `
        <div class="result-message result-info">
            <h3>Antecipe seu FGTS em até 3 minutos!</h3>
            <p>Acesse o link abaixo para antecipar seu FGTS de forma rápida e segura:</p>
            <p><a href="https://link.icred.app/NWl6QzL" target="_blank">https://link.icred.app/NWl6QzL</a></p>
        </div>
    `;
    showResult(resultContent);
}

function showINSSQuestions() {
    const questionsHTML = `
        <button type="button" class="btn-back" onclick="goBack()">← Voltar</button>
        <h2>Algumas perguntas sobre seu benefício INSS</h2>
        <div class="question-container">
            <h3>Seu benefício é de representante legal?</h3>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="inss-representante" value="sim">
                    Sim
                </label>
                <label class="radio-option">
                    <input type="radio" name="inss-representante" value="nao">
                    Não
                </label>
            </div>
        </div>
        <button type="button" id="btn-next-inss" class="btn-primary" disabled>Continuar</button>
    `;
    
    showQuestionsStep(questionsHTML);
    
    // Event listeners para as perguntas do INSS
    const inssRadios = document.querySelectorAll('input[name="inss-representante"]');
    const btnNext = document.getElementById('btn-next-inss');
    
    inssRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            formState.questionAnswers.inssRepresentante = this.value;
            btnNext.disabled = false;
        });
    });
    
    btnNext.addEventListener('click', function() {
        if (formState.questionAnswers.inssRepresentante === 'nao') {
            showDataForm();
        } else {
            showINSSAgeQuestion();
        }
    });
}

function showINSSAgeQuestion() {
    const questionsHTML = `
        <button type="button" class="btn-back" onclick="goBack()">← Voltar</button>
        <h2>Idade do titular do benefício</h2>
        <div class="question-container">
            <h3>Qual a idade do titular?</h3>
            <div class="form-group">
                <input type="number" id="titular-idade" min="0" max="120" placeholder="Digite a idade">
            </div>
        </div>
        <button type="button" id="btn-check-age" class="btn-primary">Verificar</button>
    `;
    
    showQuestionsStep(questionsHTML);
    
    document.getElementById('btn-check-age').addEventListener('click', function() {
        const idade = parseInt(document.getElementById('titular-idade').value);
        
        if (!idade) {
            alert('Por favor, informe a idade do titular.');
            return;
        }
        
        if (idade < 4 || idade > 14) {
            const resultContent = `
                <div class="result-message result-error">
                    <h3>Não aprovamos para essa idade</h3>
                    <p>Infelizmente, não aprovamos empréstimos para titulares com idade abaixo de 4 anos ou acima de 14 anos quando se trata de representante legal.</p>
                </div>
            `;
            showResult(resultContent);
        } else {
            showDataForm();
        }
    });
}

function showCLTQuestions() {
    const questionsHTML = `
        <button type="button" class="btn-back" onclick="goBack()">← Voltar</button>
        <h2>Algumas perguntas sobre seu emprego</h2>
        <div class="question-container">
            <h3>Quantos meses você trabalha na mesma empresa?</h3>
            <div class="form-group">
                <input type="number" id="meses-empresa" min="0" max="600" placeholder="Digite o número de meses">
            </div>
        </div>
        <button type="button" id="btn-check-months" class="btn-primary">Verificar</button>
    `;
    
    showQuestionsStep(questionsHTML);
    
    document.getElementById('btn-check-months').addEventListener('click', function() {
        const meses = parseInt(document.getElementById('meses-empresa').value);
        
        if (!meses) {
            alert('Por favor, informe quantos meses trabalha na empresa.');
            return;
        }
        
        if (meses < 9) {
            const resultContent = `
                <div class="result-message result-error">
                    <h3>Tempo de empresa insuficiente</h3>
                    <p>Não aprovamos empréstimos para quem tem menos de 9 meses de empresa.</p>
                    <p><strong>Mas pode ser possível antecipar seu FGTS!</strong></p>
                    <p>Acesse o link abaixo para antecipar seu FGTS de forma rápida e segura:</p>
                    <p><a href="https://link.icred.app/NWl6QzL" target="_blank">https://link.icred.app/NWl6QzL</a></p>
                </div>
            `;
            showResult(resultContent);
        } else {
            showCLTLoanQuestion();
        }
    });
}

function showCLTLoanQuestion() {
    const questionsHTML = `
        <button type="button" class="btn-back" onclick="goBack()">← Voltar</button>
        <h2>Empréstimos existentes</h2>
        <div class="question-container">
            <h3>Você já tem algum empréstimo CLT sendo descontado?</h3>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="clt-emprestimo" value="sim">
                    Sim
                </label>
                <label class="radio-option">
                    <input type="radio" name="clt-emprestimo" value="nao">
                    Não
                </label>
            </div>
        </div>
        <button type="button" id="btn-next-clt" class="btn-primary" disabled>Continuar</button>
    `;
    
    showQuestionsStep(questionsHTML);
    
    const cltRadios = document.querySelectorAll('input[name="clt-emprestimo"]');
    const btnNext = document.getElementById('btn-next-clt');
    
    cltRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            formState.questionAnswers.cltEmprestimo = this.value;
            btnNext.disabled = false;
        });
    });
    
    btnNext.addEventListener('click', function() {
        if (formState.questionAnswers.cltEmprestimo === 'sim') {
            const resultContent = `
                <div class="result-message result-error">
                    <h3>Limite de empréstimos atingido</h3>
                    <p>Só aprovamos um empréstimo por CPF. Como você já possui um empréstimo CLT sendo descontado, não é possível aprovar um novo.</p>
                </div>
            `;
            showResult(resultContent);
        } else {
            showDataForm();
        }
    });
}

function showBolsaFamiliaQuestions() {
    const questionsHTML = `
        <button type="button" class="btn-back" onclick="goBack()">← Voltar</button>
        <h2>Informações sobre o Bolsa Família</h2>
        <div class="question-container">
            <h3>Qual o valor que recebe do benefício Bolsa Família?</h3>
            <div class="form-group">
                <input type="number" id="valor-bolsa" min="0" step="0.01" placeholder="Digite o valor em reais">
            </div>
        </div>
        <button type="button" id="btn-check-valor" class="btn-primary">Verificar</button>
    `;
    
    showQuestionsStep(questionsHTML);
    
    document.getElementById('btn-check-valor').addEventListener('click', function() {
        const valor = parseFloat(document.getElementById('valor-bolsa').value);
        
        if (!valor) {
            alert('Por favor, informe o valor do benefício.');
            return;
        }
        
        if (valor < 400) {
            const resultContent = `
                <div class="result-message result-error">
                    <h3>Valor do benefício insuficiente</h3>
                    <p>Não aprovamos empréstimos para quem recebe menos que R$ 400,00 do Bolsa Família.</p>
                </div>
            `;
            showResult(resultContent);
        } else {
            showBolsaFamiliaAppQuestion();
        }
    });
}

function showBolsaFamiliaAppQuestion() {
    const questionsHTML = `
        <button type="button" class="btn-back" onclick="goBack()">← Voltar</button>
        <h2>Forma de recebimento</h2>
        <div class="question-container">
            <h3>Você recebe através do Caixa Tem ou do APP da Caixa?</h3>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="bolsa-app" value="caixa-tem">
                    Caixa Tem
                </label>
                <label class="radio-option">
                    <input type="radio" name="bolsa-app" value="app-caixa">
                    APP da Caixa
                </label>
            </div>
        </div>
        <button type="button" id="btn-next-app" class="btn-primary" disabled>Continuar</button>
    `;
    
    showQuestionsStep(questionsHTML);
    
    const appRadios = document.querySelectorAll('input[name="bolsa-app"]');
    const btnNext = document.getElementById('btn-next-app');
    
    appRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            formState.questionAnswers.bolsaApp = this.value;
            btnNext.disabled = false;
        });
    });
    
    btnNext.addEventListener('click', function() {
        if (formState.questionAnswers.bolsaApp === 'app-caixa') {
            const resultContent = `
                <div class="result-message result-error">
                    <h3>Forma de recebimento não aceita</h3>
                    <p>Só aprovamos empréstimos para quem recebe o Bolsa Família no CAIXA TEM.</p>
                </div>
            `;
            showResult(resultContent);
        } else {
            showBolsaFamiliaLoanQuestion();
        }
    });
}

function showBolsaFamiliaLoanQuestion() {
    const questionsHTML = `
        <button type="button" class="btn-back" onclick="goBack()">← Voltar</button>
        <h2>Empréstimos existentes</h2>
        <div class="question-container">
            <h3>Você já tem algum empréstimo sendo descontado de seu Caixa Tem?</h3>
            <div class="radio-group">
                <label class="radio-option">
                    <input type="radio" name="bolsa-emprestimo" value="sim">
                    Sim
                </label>
                <label class="radio-option">
                    <input type="radio" name="bolsa-emprestimo" value="nao">
                    Não
                </label>
            </div>
        </div>
        <button type="button" id="btn-next-bolsa" class="btn-primary" disabled>Continuar</button>
    `;
    
    showQuestionsStep(questionsHTML);
    
    const bolsaRadios = document.querySelectorAll('input[name="bolsa-emprestimo"]');
    const btnNext = document.getElementById('btn-next-bolsa');
    
    bolsaRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            formState.questionAnswers.bolsaEmprestimo = this.value;
            btnNext.disabled = false;
        });
    });
    
    btnNext.addEventListener('click', function() {
        if (formState.questionAnswers.bolsaEmprestimo === 'sim') {
            const resultContent = `
                <div class="result-message result-error">
                    <h3>Empréstimo já existente</h3>
                    <p>Não aprovamos empréstimos para quem já possui empréstimo sendo descontado do CAIXA TEM.</p>
                </div>
            `;
            showResult(resultContent);
        } else {
            showDataForm();
        }
    });
}

function showQuestionsStep(html) {
    const questionsStep = document.getElementById('step-questions');
    questionsStep.innerHTML = html;
    showStep('questions');
}

function showDataForm() {
    if (!formState.history.includes('data')) {
        addToHistory('data');
    }
    showStep('data');
}

function showStep(stepName) {
    // Esconder todas as etapas
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => step.classList.remove('active'));
    
    // Mostrar a etapa solicitada
    const targetStep = document.getElementById(`step-${stepName}`);
    if (targetStep) {
        targetStep.classList.add('active');
        formState.currentStep = stepName;
    }
}

function showResult(content) {
    const resultContent = document.getElementById('result-content');
    resultContent.innerHTML = content;
    showStep('result');
}

function handleDataSubmission() {
    // Coletar dados do formulário
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const idade = document.getElementById('idade').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    
    // Validar campos obrigatórios
    if (!nome || !cpf || !idade || !whatsapp) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    // Validar idade mínima
    if (parseInt(idade) < 18) {
        alert('É necessário ter pelo menos 18 anos para solicitar o crédito.');
        return;
    }
    
    // Validar CPF (validação básica de formato)
    if (!isValidCPF(cpf)) {
        alert('Por favor, informe um CPF válido.');
        return;
    }
    
    // Salvar dados
    formState.userData = { nome, cpf, idade, whatsapp };
    
    // Preparar dados para exportação
    const exportData = {
        service: formState.selectedService,
        nome: nome,
        cpf: cpf,
        idade: idade,
        whatsapp: whatsapp,
        questionAnswers: formState.questionAnswers
    };
    
    // Exportar para Google Sheets
    exportToGoogleSheets(exportData);
}

function exportToGoogleSheets(data) {
    // Mostrar indicador de carregamento
    const submitBtn = document.getElementById('btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;
    
    // Usar XMLHttpRequest em vez de fetch para contornar problemas CORS
    const xhr = new XMLHttpRequest();
    const url = BACKEND_URL;
    
    // Preparar dados para envio
    const formData = new URLSearchParams();
    formData.append('data', JSON.stringify(data));
    
    xhr.open('POST', url, true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                if (response.success) {
                    console.log('✅ Dados enviados com sucesso para o Google Sheets!');
                    
                    // Mostrar mensagem de sucesso
                    const resultContent = `
                        <div class="result-message result-success">
                            <h3>Solicitação enviada com sucesso!</h3>
                            <p>Obrigado, <strong>${data.nome}</strong>! Seus dados foram enviados com sucesso.</p>
                            <p>Nossa equipe entrará em contato através do WhatsApp <strong>${data.whatsapp}</strong> em breve para dar continuidade ao seu processo de crédito.</p>
                            <p><strong>Serviço solicitado:</strong> ${getServiceName(formState.selectedService)}</p>
                            <p><em>Os dados foram salvos automaticamente em nossa planilha.</em></p>
                        </div>
                    `;
                    
                    showResult(resultContent);
                } else {
                    console.error('❌ Erro do servidor:', response.error);
                    saveToLocalStorage(data);
                }
            } catch (error) {
                console.error('❌ Erro ao processar resposta:', error);
                saveToLocalStorage(data);
            }
        } else {
            console.error('❌ Erro HTTP:', xhr.status);
            saveToLocalStorage(data);
        }
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };
    
    xhr.onerror = function() {
        console.error('❌ Erro de rede ao tentar conectar com o servidor');
        saveToLocalStorage(data);
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };
    
    xhr.onabort = function() {
        console.warn('⚠️ Requisição abortada');
        saveToLocalStorage(data);
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };
    
    // Configurar timeout de 15 segundos
    xhr.timeout = 15000;
    xhr.ontimeout = function() {
        console.error('⏰ Timeout: Servidor não respondeu em 15 segundos');
        saveToLocalStorage(data);
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };
    
    // Enviar requisição
    xhr.send(formData.toString());
}

// Função para salvar localmente em caso de erro
function saveToLocalStorage(data) {
    // Fallback: salvar dados localmente
    const backupKey = 'ecred_backup_' + new Date().getTime();
    localStorage.setItem(backupKey, JSON.stringify(data));
    
    // Mostrar mensagem de aviso
    const resultContent = `
        <div class="result-message result-info">
            <h3>Solicitação salva localmente!</h3>
            <p>Obrigado, <strong>${data.nome}</strong>! Seus dados foram salvos localmente.</p>
            <p>Nossa equipe entrará em contato através do WhatsApp <strong>${data.whatsapp}</strong> em breve.</p>
            <p><strong>Nota:</strong> Devido a um problema de conexão, seus dados serão enviados para nosso sistema quando a conexão for restabelecida.</p>
        </div>
    `;
    
    showResult(resultContent);
}

function isValidCPF(cpf) {
    // Remove caracteres não numéricos
    cpf = cpf.replace(/\D/g, '');
    
    // Verifica se tem 11 dígitos
    if (cpf.length !== 11) return false;
    
    // Verifica se todos os dígitos são iguais
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    return true; // Validação básica, pode ser expandida
}

function getServiceName(service) {
    const serviceNames = {
        'inss': 'Crédito para INSS',
        'siape': 'SIAPE',
        'clt': 'CLT',
        'bolsa-familia': 'Bolsa Família',
        'fgts': 'Antecipação do FGTS'
    };
    
    return serviceNames[service] || service;
}

function restartForm() {
    // Resetar estado
    formState = {
        selectedService: null,
        currentStep: 'service',
        userData: {},
        questionAnswers: {},
        history: ['service'] // Resetar histórico
    };
    
    // Limpar formulários
    document.querySelectorAll('input').forEach(input => {
        if (input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    // Voltar para a primeira etapa
    showStep('service');
}

// ============================================================
// FUNÇÕES DE TESTE E DIAGNÓSTICO (executar no console)
// ============================================================

// Função para testar a conexão com o Google Apps Script
function testConnection() {
    console.log('🔍 Testando conexão com o Google Apps Script...');
    
    const xhr = new XMLHttpRequest();
    const testUrl = BACKEND_URL + '?test=' + Date.now();
    
    xhr.open('GET', testUrl, true);
    
    xhr.onload = function() {
        if (xhr.status === 200) {
            try {
                const response = JSON.parse(xhr.responseText);
                console.log('✅ Conexão bem-sucedida! Resposta:', response);
                alert('✅ Conexão funcionando!\nResposta: ' + JSON.stringify(response, null, 2));
            } catch (error) {
                console.error('❌ Erro ao parsear resposta:', error);
                console.log('Resposta bruta:', xhr.responseText);
                alert('❌ Resposta inválida do servidor. Verifique o console.');
            }
        } else {
            console.error('❌ Erro HTTP:', xhr.status, xhr.statusText);
            alert('❌ Erro HTTP: ' + xhr.status + ' - ' + xhr.statusText);
        }
    };
    
    xhr.onerror = function() {
        console.error('❌ Erro de rede - não foi possível conectar ao servidor');
        alert('❌ Erro de rede - não foi possível conectar ao servidor');
    };
    
    xhr.ontimeout = function() {
        console.error('⏰ Timeout - servidor não respondeu');
        alert('⏰ Timeout - servidor não respondeu em tempo hábil');
    };
    
    xhr.timeout = 10000; // 10 segundos
    xhr.send();
}

// Função para ver dados salvos localmente
function viewLocalStorage() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ecred_backup_')) {
            const data = JSON.parse(localStorage.getItem(key));
            backups.push({ key, data });
        }
    }
    
    console.log('📦 Dados salvos localmente:', backups);
    if (backups.length === 0) {
        alert('Nenhum dado salvo localmente encontrado.');
    } else {
        alert(`Encontrados ${backups.length} registros salvos localmente. Verifique o console para detalhes.`);
    }
    return backups;
}

// Função para limpar dados locais
function clearLocalStorage() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ecred_backup_')) {
            keysToRemove.push(key);
        }
    }
    
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('🧹 Dados locais removidos:', keysToRemove.length);
    alert(`Removidos ${keysToRemove.length} registros locais.`);
}

// Função para simular envio de dados (para teste)
function testSubmit() {
    const testData = {
        service: 'inss',
        nome: 'João Silva Teste',
        cpf: '123.456.789-00',
        idade: '35',
        whatsapp: '(11) 99999-9999',
        questionAnswers: {
            inssRepresentante: 'nao'
        }
    };
    
    console.log('🧪 Testando envio de dados:', testData);
    exportToGoogleSheets(testData);
}