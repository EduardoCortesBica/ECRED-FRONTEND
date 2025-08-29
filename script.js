// Estado global do formulário
let formState = {
    selectedService: null,
    currentStep: 'service',
    userData: {},
    questionAnswers: {},
    history: ['service']
};

// URL do Google Forms
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdGoFA5j67kQZkA0rkMHb8KOMjjvryZp23ryOzGo3OPFCGefA/formResponse';

// IDs dos campos (SUBSTITUA com os IDs do SEU forms)
const FIELD_IDS = {
    TIMESTAMP: 'entry.1424008886',
    SERVICE: 'entry.2141032004', 
    NAME: 'entry.1501452404',
    CPF: 'entry.1435084519',
    AGE: 'entry.1022619816',
    WHATSAPP: 'entry.1194160805',
    ANSWERS: 'entry.1404968756'
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 Inicializando formulário...');
    initializeForm();
});

function initializeForm() {
    console.log('🔧 Configurando eventos do formulário...');
    
    // Event listeners para seleção de serviço
    const serviceRadios = document.querySelectorAll('input[name="service"]');
    
    serviceRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            console.log('✅ Serviço selecionado:', this.value);
            formState.selectedService = this.value;
            formState.history = ['service'];
            
            // Avanço automático após seleção
            setTimeout(() => {
                handleServiceSelection();
            }, 300);
        });
    });
    
    // Event listener para botão de envio dos dados
    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        submitBtn.addEventListener('click', function() {
            console.log('📤 Botão de enviar clicado');
            handleDataSubmission();
        });
    } else {
        console.error('❌ Botão de submit não encontrado');
    }
    
    // Event listener para botão de reiniciar
    const restartBtn = document.getElementById('btn-restart');
    if (restartBtn) {
        restartBtn.addEventListener('click', function() {
            console.log('🔄 Reiniciando formulário');
            restartForm();
        });
    }
    
    // Configurar máscaras dos campos
    setupInputMasks();
    
    console.log('✅ Formulário inicializado com sucesso');
}

function setupInputMasks() {
    // Máscara para CPF
    const cpfInput = document.getElementById('cpf');
    if (cpfInput) {
        cpfInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d)/, '$1.$2');
            value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
            this.value = value;
        });
    }
    
    // Máscara para WhatsApp
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            value = value.replace(/(\d{2})(\d)/, '($1) $2');
            value = value.replace(/(\d{5})(\d)/, '$1-$2');
            this.value = value;
        });
    }
}

function handleServiceSelection() {
    console.log('🎯 Lidando com seleção de serviço:', formState.selectedService);
    
    // Pular etapas de perguntas e ir direto para dados
    showDataForm();
}

function showDataForm() {
    console.log('📋 Mostrando formulário de dados');
    if (!formState.history.includes('data')) {
        addToHistory('data');
    }
    showStep('data');
}

function showStep(stepName) {
    console.log('🔄 Mostrando etapa:', stepName);
    
    // Esconder todas as etapas
    const steps = document.querySelectorAll('.form-step');
    steps.forEach(step => {
        step.classList.remove('active');
    });
    
    // Mostrar a etapa solicitada
    const targetStep = document.getElementById(`step-${stepName}`);
    if (targetStep) {
        targetStep.classList.add('active');
        formState.currentStep = stepName;
        console.log('✅ Etapa ativa:', stepName);
    } else {
        console.error('❌ Etapa não encontrada:', stepName);
    }
}

function showResult(content) {
    console.log('📋 Mostrando resultado');
    const resultContent = document.getElementById('result-content');
    if (resultContent) {
        resultContent.innerHTML = content;
        showStep('result');
    } else {
        console.error('❌ Elemento de resultado não encontrado');
    }
}

function handleDataSubmission() {
    console.log('📤 Iniciando envio de dados...');
    
    const nome = document.getElementById('nome')?.value.trim();
    const cpf = document.getElementById('cpf')?.value.trim();
    const idade = document.getElementById('idade')?.value.trim();
    const whatsapp = document.getElementById('whatsapp')?.value.trim();
    
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
    
    console.log('📦 Dados para exportação:', exportData);
    submitToGoogleForm(exportData);
}

function submitToGoogleForm(data) {
    console.log('📤 Enviando para Google Forms...');
    
    const submitBtn = document.getElementById('btn-submit');
    const originalText = submitBtn?.textContent;
    
    if (submitBtn) {
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
    }

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

    // Adicionar campos
    const formData = [
        { name: FIELD_IDS.TIMESTAMP, value: new Date().toLocaleString('pt-BR') },
        { name: FIELD_IDS.SERVICE, value: getServiceName(data.service) },
        { name: FIELD_IDS.NAME, value: data.nome },
        { name: FIELD_IDS.CPF, value: data.cpf },
        { name: FIELD_IDS.AGE, value: data.idade },
        { name: FIELD_IDS.WHATSAPP, value: data.whatsapp },
        { name: FIELD_IDS.ANSWERS, value: JSON.stringify(data.questionAnswers || {}) }
    ];

    formData.forEach(field => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = field.name;
        input.value = field.value;
        form.appendChild(input);
        console.log(`📝 Campo ${field.name}: ${field.value}`);
    });

    document.body.appendChild(form);

    // Configurar eventos
    iframe.onload = function() {
        console.log('✅ Formulário enviado com sucesso!');
        showSuccessMessage(data);
        cleanupElements(form, iframe);
        restoreSubmitButton(submitBtn, originalText);
    };

    iframe.onerror = function() {
        console.error('❌ Erro ao enviar formulário');
        saveToLocalStorage(data);
        cleanupElements(form, iframe);
        restoreSubmitButton(submitBtn, originalText);
    };

    // Enviar formulário
    form.submit();
}

function cleanupElements(form, iframe) {
    setTimeout(() => {
        try {
            if (form && document.body.contains(form)) {
                document.body.removeChild(form);
            }
            if (iframe && document.body.contains(iframe)) {
                document.body.removeChild(iframe);
            }
        } catch (error) {
            console.log('⚠️ Erro ao limpar elementos:', error);
        }
    }, 5000);
}

function restoreSubmitButton(submitBtn, originalText) {
    if (submitBtn && originalText) {
        submitBtn.textContent = originalText;
        submitBtn.disabled = false;
    }
}

function showSuccessMessage(data) {
    const resultContent = `
        <div class="result-message result-success">
            <h3>Solicitação enviada com sucesso! ✅</h3>
            <p>Obrigado, <strong>${data.nome}</strong>! Seus dados foram enviados.</p>
            <p>Entraremos em contato pelo WhatsApp: <strong>${data.whatsapp}</strong></p>
            <p><strong>Serviço:</strong> ${getServiceName(data.service)}</p>
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
        </div>
    `;
    
    showResult(resultContent);
}

function isValidCPF(cpf) {
    if (!cpf) return false;
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
    console.log('🔄 Reiniciando formulário...');
    
    formState = {
        selectedService: null,
        currentStep: 'service',
        userData: {},
        questionAnswers: {},
        history: ['service']
    };
    
    // Limpar formulários
    document.querySelectorAll('input').forEach(input => {
        if (input.type === 'radio') {
            input.checked = false;
        } else if (input.type !== 'button') {
            input.value = '';
        }
    });
    
    // Voltar para a primeira etapa
    showStep('service');
}

// Adicionar goBack ao escopo global para funcionar no onclick
window.goBack = goBack;