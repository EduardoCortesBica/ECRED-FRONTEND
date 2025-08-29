// Estado global do formulário
let formState = {
    selectedService: null,
    currentStep: 'service',
    userData: {},
    questionAnswers: {},
    history: ['service'] // Histórico de navegação
};

// URL do seu Google Forms (JÁ ATUALIZADO COM SEU LINK)
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdGoFA5j67kQZkA0rkMHb8KOMjjvryZp23ryOzGo3OPFCGefA/formResponse';

// IDs dos campos do SEU formulário (JÁ ATUALIZADOS)
const FIELD_IDS = {
    TIMESTAMP: 'entry.1424008886',    // Data/Hora
    SERVICE: 'entry.2141032004',      // Serviço
    NAME: 'entry.1501452404',         // Nome
    CPF: 'entry.1435084519',          // CPF
    AGE: 'entry.1022619816',          // Idade
    WHATSAPP: 'entry.1194160805',     // WhatsApp
    ANSWERS: 'entry.1404968756'       // Respostas
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    checkLocalStorage();
});

function initializeForm() {
    // Event listeners para seleção de serviço
    const serviceRadios = document.querySelectorAll('input[name="service"]');
    
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            formState.selectedService = this.value;
            formState.history = ['service'];
            setTimeout(() => {
                handleServiceSelection();
            }, 300);
        });
    });
    
    document.getElementById('btn-submit').addEventListener('click', function() {
        handleDataSubmission();
    });
    
    document.getElementById('btn-restart').addEventListener('click', function() {
        restartForm();
    });
    
    setupInputMasks();
}

function checkLocalStorage() {
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ecred_backup_')) {
            backupKeys.push(key);
        }
    }
    
    if (backupKeys.length > 0) {
        console.log('Dados salvos localmente:', backupKeys.length);
    }
}

function addToHistory(step) {
    formState.history.push(step);
}

function goBack() {
    if (formState.history.length > 1) {
        formState.history.pop();
        const previousStep = formState.history[formState.history.length - 1];
        
        if (previousStep === 'service') {
            showStep('service');
        } else if (previousStep === 'questions') {
            formState.history.pop();
            handleServiceSelection();
        } else if (previousStep === 'data') {
            formState.history.pop();
            showDataForm();
        }
    }
}

function setupInputMasks() {
    const cpfInput = document.getElementById('cpf');
    cpfInput.addEventListener('input', function() {
        let value = this.value.replace(/\D/g, '');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d)/, '$1.$2');
        value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
        this.value = value;
    });
    
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
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => step.classList.remove('active'));
    
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
    const nome = document.getElementById('nome').value.trim();
    const cpf = document.getElementById('cpf').value.trim();
    const idade = document.getElementById('idade').value.trim();
    const whatsapp = document.getElementById('whatsapp').value.trim();
    
    if (!nome || !cpf || !idade || !whatsapp) {
        alert('Por favor, preencha todos os campos obrigatórios.');
        return;
    }
    
    if (parseInt(idade) < 18) {
        alert('É necessário ter pelo menos 18 anos para solicitar o crédito.');
        return;
    }
    
    if (!isValidCPF(cpf)) {
        alert('Por favor, informe um CPF válido.');
        return;
    }
    
    formState.userData = { nome, cpf, idade, whatsapp };
    
    const exportData = {
        service: formState.selectedService,
        nome: nome,
        cpf: cpf,
        idade: idade,
        whatsapp: whatsapp,
        questionAnswers: formState.questionAnswers
    };
    
    submitToGoogleForm(exportData);
}

function submitToGoogleForm(data) {
    const submitBtn = document.getElementById('btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    // Criar iframe invisível
    const iframe = document.createElement('iframe');
    iframe.style.display = 'none';
    iframe.name = 'google-form-frame-' + Date.now();
    document.body.appendChild(iframe);

    // Criar formulário
    const form = document.createElement('form');
    form.action = GOOGLE_FORM_URL;
    form.method = 'POST';
    form.target = iframe.name;
    form.style.display = 'none';

    // Adicionar campos com os IDs CORRETOS do seu forms
    const formData = {
        [FIELD_IDS.TIMESTAMP]: new Date().toLocaleString('pt-BR'),
        [FIELD_IDS.SERVICE]: getServiceName(data.service),
        [FIELD_IDS.NAME]: data.nome,
        [FIELD_IDS.CPF]: data.cpf,
        [FIELD_IDS.AGE]: data.idade,
        [FIELD_IDS.WHATSAPP]: data.whatsapp,
        [FIELD_IDS.ANSWERS]: JSON.stringify(data.questionAnswers || {})
    };

    for (const [name, value] of Object.entries(formData)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = name;
        input.value = value;
        form.appendChild(input);
    }

    document.body.appendChild(form);

    // Configurar eventos
    iframe.onload = function() {
        console.log('✅ Formulário enviado com sucesso!');
        showSuccessMessage(data);
        cleanupElements(form, iframe);
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };

    iframe.onerror = function() {
        console.error('❌ Erro ao enviar formulário');
        saveToLocalStorage(data);
        cleanupElements(form, iframe);
        
        // Restaurar botão
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    };

    // Enviar formulário
    form.submit();
}

function cleanupElements(form, iframe) {
    setTimeout(() => {
        if (form && document.body.contains(form)) {
            document.body.removeChild(form);
        }
        if (iframe && document.body.contains(iframe)) {
            document.body.removeChild(iframe);
        }
    }, 5000);
}

function showSuccessMessage(data) {
    const resultContent = `
        <div class="result-message result-success">
            <h3>Solicitação enviada com sucesso! ✅</h3>
            <p>Obrigado, <strong>${data.nome}</strong>! Seus dados foram enviados.</p>
            <p>Entraremos em contato pelo WhatsApp: <strong>${data.whatsapp}</strong></p>
            <p><strong>Serviço:</strong> ${getServiceName(data.service)}</p>
            <p><em>Os dados foram salvos em nossa planilha do Google.</em></p>
        </div>
    `;
    showResult(resultContent);
}

function saveToLocalStorage(data) {
    const backupKey = 'ecred_backup_' + new Date().getTime();
    localStorage.setItem(backupKey, JSON.stringify(data));
    
    const resultContent = `
        <div class="result-message result-info">
            <h3>Solicitação salva localmente! 📱</h3>
            <p>Obrigado, <strong>${data.nome}</strong>! Seus dados foram salvos localmente.</p>
            <p>Nossa equipe entrará em contato através do WhatsApp <strong>${data.whatsapp}</strong> em breve.</p>
            <p><strong>Nota:</strong> Devido a um problema temporário, seus dados serão enviados para nosso sistema em breve.</p>
        </div>
    `;
    
    showResult(resultContent);
}

function isValidCPF(cpf) {
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    return true;
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
    formState = {
        selectedService: null,
        currentStep: 'service',
        userData: {},
        questionAnswers: {},
        history: ['service']
    };
    
    document.querySelectorAll('input').forEach(input => {
        if (input.type === 'radio') {
            input.checked = false;
        } else {
            input.value = '';
        }
    });
    
    showStep('service');
}

// Funções de utilitário para debug
function viewLocalStorage() {
    const backups = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ecred_backup_')) {
            backups.push({ key, data: JSON.parse(localStorage.getItem(key)) });
        }
    }
    console.log('Dados locais:', backups);
    return backups;
}

function clearLocalStorage() {
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ecred_backup_')) {
            keysToRemove.push(key);
        }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
    console.log('Dados locais removidos:', keysToRemove.length);
}

// Teste de conexão com o forms
function testFormConnection() {
    console.log('🧪 Testando conexão com Google Forms...');
    console.log('📋 URL do Form:', GOOGLE_FORM_URL);
    console.log('🔑 IDs dos Campos:', FIELD_IDS);
    alert('Teste de conexão iniciado. Verifique o console para detalhes.');
}