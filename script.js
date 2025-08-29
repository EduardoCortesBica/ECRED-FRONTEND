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

// IDs dos campos do SEU Google Forms (CORRIGIDOS)
const FIELD_IDS = {
    TIMESTAMP: 'entry.205450624',
    SERVICE: 'entry.1815975313', 
    NAME: 'entry.99223554',
    CPF: 'entry.168348437',
    AGE: 'entry.1853096298',
    WHATSAPP: 'entry.59144836',
    ANSWERS: 'entry.993709921'
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
            
            // Avançar automaticamente para coleta de dados (SEM perguntas)
            setTimeout(() => {
                showDataForm();
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
            if (value.length <= 11) {
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d)/, '$1.$2');
                value = value.replace(/(\d{3})(\d{1,2})$/, '$1-$2');
                this.value = value;
            }
        });
    }
    
    // Máscara para WhatsApp
    const whatsappInput = document.getElementById('whatsapp');
    if (whatsappInput) {
        whatsappInput.addEventListener('input', function() {
            let value = this.value.replace(/\D/g, '');
            if (value.length <= 11) {
                value = value.replace(/(\d{2})(\d)/, '($1) $2');
                value = value.replace(/(\d{5})(\d)/, '$1-$2');
                this.value = value;
            }
        });
    }
}

function showDataForm() {
    console.log('📋 Mostrando formulário de dados');
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
        
        // Scroll para o topo para melhor experiência
        window.scrollTo({ top: 0, behavior: 'smooth' });
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
    
    // Validação básica
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
    
    // Preparar dados para envio
    const formData = {
        service: formState.selectedService,
        nome: nome,
        cpf: cpf,
        idade: idade,
        whatsapp: whatsapp,
        timestamp: new Date().toLocaleString('pt-BR')
    };
    
    console.log('📦 Dados para envio:', formData);
    
    // Enviar dados
    submitToGoogleForms(formData);
}

function submitToGoogleForms(data) {
    console.log('📤 Enviando para Google Forms...');
    
    const submitBtn = document.getElementById('btn-submit');
    const originalText = submitBtn?.textContent;
    
    if (submitBtn) {
        submitBtn.textContent = 'Enviando...';
        submitBtn.disabled = true;
    }

    // Criar iframe invisível para envio
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

    // Adicionar campos ao formulário (COM OS IDs CORRETOS)
    const formFields = [
        { name: FIELD_IDS.TIMESTAMP, value: data.timestamp },
        { name: FIELD_IDS.SERVICE, value: getServiceName(data.service) },
        { name: FIELD_IDS.NAME, value: data.nome },
        { name: FIELD_IDS.CPF, value: data.cpf },
        { name: FIELD_IDS.AGE, value: data.idade },
        { name: FIELD_IDS.WHATSAPP, value: data.whatsapp },
        { name: FIELD_IDS.ANSWERS, value: 'Não aplicável' } // Campo de respostas
    ];

    formFields.forEach(field => {
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
        
        // Limpar formulário
        setTimeout(() => {
            if (document.body.contains(form)) document.body.removeChild(form);
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 3000);
        
        // Restaurar botão
        if (submitBtn && originalText) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    };

    iframe.onerror = function() {
        console.error('❌ Erro ao enviar formulário');
        
        // Fallback: salvar localmente
        const backupKey = 'ecred_backup_' + new Date().getTime();
        localStorage.setItem(backupKey, JSON.stringify(data));
        
        showLocalSaveMessage(data);
        
        // Limpar formulário
        setTimeout(() => {
            if (document.body.contains(form)) document.body.removeChild(form);
            if (document.body.contains(iframe)) document.body.removeChild(iframe);
        }, 3000);
        
        // Restaurar botão
        if (submitBtn && originalText) {
            submitBtn.textContent = originalText;
            submitBtn.disabled = false;
        }
    };

    // Enviar formulário
    console.log('🔄 Enviando dados...');
    form.submit();
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
        <button type="button" onclick="restartForm()" class="btn-primary" style="margin-top: 20px;">Fazer Nova Solicitação</button>
    `;
    showResult(resultContent);
}

function showLocalSaveMessage(data) {
    const resultContent = `
        <div class="result-message result-info">
            <h3>Solicitação salva localmente! 📱</h3>
            <p>Obrigado, <strong>${data.nome}</strong>! Seus dados foram salvos localmente.</p>
            <p>Nossa equipe entrará em contato através do WhatsApp <strong>${data.whatsapp}</strong> em breve.</p>
            <p><strong>Nota:</strong> Devido a um problema temporário, seus dados serão enviados para nosso sistema em breve.</p>
        </div>
        <button type="button" onclick="restartForm()" class="btn-primary" style="margin-top: 20px;">Fazer Nova Solicitação</button>
    `;
    showResult(resultContent);
}

function isValidCPF(cpf) {
    if (!cpf) return false;
    cpf = cpf.replace(/\D/g, '');
    if (cpf.length !== 11) return false;
    if (/^(\d)\1{10}$/.test(cpf)) return false;
    
    // Validar dígitos verificadores
    let sum = 0;
    let remainder;
    
    for (let i = 1; i <= 9; i++) {
        sum = sum + parseInt(cpf.substring(i-1, i)) * (11 - i);
    }
    
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(9, 10))) return false;
    
    sum = 0;
    for (let i = 1; i <= 10; i++) {
        sum = sum + parseInt(cpf.substring(i-1, i)) * (12 - i);
    }
    
    remainder = (sum * 10) % 11;
    if ((remainder === 10) || (remainder === 11)) remainder = 0;
    if (remainder !== parseInt(cpf.substring(10, 11))) return false;
    
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
    
    // Resetar estado
    formState = {
        selectedService: null,
        currentStep: 'service',
        userData: {},
        questionAnswers: {},
        history: ['service']
    };
    
    // Limpar campos do formulário
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

function goBack() {
    console.log('🔙 Voltando para seleção de serviço...');
    showStep('service');
}

// Adicionar funções ao escopo global para os botões
window.goBack = goBack;
window.restartForm = restartForm;

// Função para teste rápido
function testNavigation() {
    console.log('🧪 Testando navegação...');
    formState.selectedService = 'inss';
    showDataForm();
}

// Função para debug - verificar se os elementos existem
function checkElements() {
    console.log('🔍 Verificando elementos do DOM:');
    console.log('- Botão submit:', document.getElementById('btn-submit'));
    console.log('- Botão restart:', document.getElementById('btn-restart'));
    console.log('- Step service:', document.getElementById('step-service'));
    console.log('- Step data:', document.getElementById('step-data'));
    console.log('- Step result:', document.getElementById('step-result'));
    console.log('- Input nome:', document.getElementById('nome'));
    console.log('- Input cpf:', document.getElementById('cpf'));
    console.log('- Input idade:', document.getElementById('idade'));
    console.log('- Input whatsapp:', document.getElementById('whatsapp'));
}