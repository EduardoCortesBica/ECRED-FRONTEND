// Estado global do formulário
let formState = {
    selectedService: null,
    currentStep: 'service',
    userData: {},
    questionAnswers: {},
    history: ['service']
};

// URL do Google Forms (ATUALIZADO com o URL correto)
const GOOGLE_FORM_URL = 'https://docs.google.com/forms/d/e/1FAIpQLSdGoFA5j67kQZkA0rkMHb8KOMjjvryZp23ryOzGo3OPFCGefA/formResponse';

// IDs dos campos (Vamos testar ambos os formatos)
const FIELD_IDS = {
    // Primeira tentativa: IDs que encontramos
    TIMESTAMP: 'entry.1424008886',
    SERVICE: 'entry.2141032004', 
    NAME: 'entry.1501452404',
    CPF: 'entry.1435084519',
    AGE: 'entry.1022619816',
    WHATSAPP: 'entry.1194160805',
    ANSWERS: 'entry.1404968756',
    
    // Segunda tentativa: IDs alternativos (com _)
    TIMESTAMP_ALT: 'entry.1424008886',
    SERVICE_ALT: 'entry.2141032004',
    NAME_ALT: 'entry.1501452404',
    CPF_ALT: 'entry.1435084519',
    AGE_ALT: 'entry.1022619816',
    WHATSAPP_ALT: 'entry.1194160805',
    ANSWERS_ALT: 'entry.1404968756'
};

// Inicialização quando o DOM estiver carregado
document.addEventListener('DOMContentLoaded', function() {
    initializeForm();
    checkLocalStorage();
});

// ... (as funções initializeForm, checkLocalStorage, addToHistory, goBack, setupInputMasks 
// permanecem EXATAMENTE como estavam no código anterior)

// ... (as funções handleServiceSelection, showFGTSMessage, showINSSQuestions, showINSSAgeQuestion,
// showCLTQuestions, showCLTLoanQuestion, showBolsaFamiliaQuestions, showBolsaFamiliaAppQuestion,
// showBolsaFamiliaLoanQuestion, showQuestionsStep, showDataForm, showStep, showResult 
// permanecem EXATAMENTE como estavam)

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
    
    // TESTE: Mostrar dados no console para debug
    console.log('📤 Dados sendo enviados:', exportData);
    
    submitToGoogleForm(exportData);
}

function submitToGoogleForm(data) {
    const submitBtn = document.getElementById('btn-submit');
    const originalText = submitBtn.textContent;
    submitBtn.textContent = 'Enviando...';
    submitBtn.disabled = true;

    // TESTE: Verificar se os dados estão corretos
    console.log('🔍 Dados para envio:', data);
    
    // Método 1: Envio tradicional com iframe
    sendViaIframe(data);
    
    // Método 2: Envio alternativo (backup)
    setTimeout(() => {
        sendViaAlternativeMethod(data);
    }, 1000);
    
    // Método 3: Log dos dados para debug
    logFormData(data);
}

function sendViaIframe(data) {
    try {
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
        form.acceptCharset = 'UTF-8';

        // Dados para envio - TESTAR DIFERENTES FORMATOS
        const formData = [
            // Formato 1: IDs normais
            { name: FIELD_IDS.TIMESTAMP, value: new Date().toLocaleString('pt-BR') },
            { name: FIELD_IDS.SERVICE, value: getServiceName(data.service) },
            { name: FIELD_IDS.NAME, value: data.nome },
            { name: FIELD_IDS.CPF, value: data.cpf },
            { name: FIELD_IDS.AGE, value: data.idade },
            { name: FIELD_IDS.WHATSAPP, value: data.whatsapp },
            { name: FIELD_IDS.ANSWERS, value: JSON.stringify(data.questionAnswers || {}) },
            
            // Formato 2: IDs alternativos (às vezes o Google Forms usa formato diferente)
            { name: 'entry.1424008886', value: new Date().toLocaleString('pt-BR') },
            { name: 'entry.2141032004', value: getServiceName(data.service) },
            { name: 'entry.1501452404', value: data.nome },
            { name: 'entry.1435084519', value: data.cpf },
            { name: 'entry.1022619816', value: data.idade },
            { name: 'entry.1194160805', value: data.whatsapp },
            { name: 'entry.1404968756', value: JSON.stringify(data.questionAnswers || {}) }
        ];

        // Adicionar campos ao formulário
        formData.forEach(field => {
            // Só adicionar se o valor não for vazio
            if (field.value && field.value !== '""' && field.value !== '{}') {
                const input = document.createElement('input');
                input.type = 'hidden';
                input.name = field.name;
                input.value = field.value;
                input.setAttribute('data-field', field.name.replace('entry.', ''));
                form.appendChild(input);
                
                console.log(`📝 Campo ${field.name}: ${field.value}`);
            }
        });

        document.body.appendChild(form);

        // Configurar eventos
        iframe.onload = function() {
            console.log('✅ Formulário enviado via iframe!');
            showSuccessMessage(data);
            cleanupElements(form, iframe);
            restoreSubmitButton();
        };

        iframe.onerror = function() {
            console.error('❌ Erro ao enviar formulário via iframe');
            restoreSubmitButton();
        };

        // Enviar formulário
        console.log('🔄 Enviando formulário via iframe...');
        form.submit();

    } catch (error) {
        console.error('❌ Erro no envio iframe:', error);
        restoreSubmitButton();
    }
}

function sendViaAlternativeMethod(data) {
    // Método alternativo usando fetch (para contornar problemas de iframe)
    try {
        const formData = new URLSearchParams();
        
        // Adicionar dados ao formData
        formData.append(FIELD_IDS.TIMESTAMP, new Date().toLocaleString('pt-BR'));
        formData.append(FIELD_IDS.SERVICE, getServiceName(data.service));
        formData.append(FIELD_IDS.NAME, data.nome);
        formData.append(FIELD_IDS.CPF, data.cpf);
        formData.append(FIELD_IDS.AGE, data.idade);
        formData.append(FIELD_IDS.WHATSAPP, data.whatsapp);
        formData.append(FIELD_IDS.ANSWERS, JSON.stringify(data.questionAnswers || {}));
        
        console.log('🔄 Tentando método alternativo de envio...');
        
        // Enviar via fetch (pode não funcionar devido a CORS, mas tentamos)
        fetch(GOOGLE_FORM_URL, {
            method: 'POST',
            body: formData,
            mode: 'no-cors',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        })
        .then(() => {
            console.log('✅ Método alternativo executado (sem verificação de resposta)');
        })
        .catch(error => {
            console.log('⚠️ Método alternativo falhou (esperado devido a CORS):', error);
        });
        
    } catch (error) {
        console.log('⚠️ Erro no método alternativo:', error);
    }
}

function logFormData(data) {
    // Registrar dados para debug
    console.group('📋 Dados do Formulário para Debug');
    console.log('📍 URL do Forms:', GOOGLE_FORM_URL);
    console.log('⏰ Timestamp:', new Date().toLocaleString('pt-BR'));
    console.log('🎯 Serviço:', getServiceName(data.service));
    console.log('👤 Nome:', data.nome);
    console.log('🔢 CPF:', data.cpf);
    console.log('🎂 Idade:', data.idade);
    console.log('📱 WhatsApp:', data.whatsapp);
    console.log('❓ Respostas:', JSON.stringify(data.questionAnswers));
    console.groupEnd();
    
    // Também mostrar em alerta para fácil visualização
    setTimeout(() => {
        alert(`💡 Dados para debug:\n\n- Serviço: ${getServiceName(data.service)}\n- Nome: ${data.nome}\n- CPF: ${data.cpf}\n- Idade: ${data.idade}\n- WhatsApp: ${data.whatsapp}\n\nVerifique o console para mais detalhes.`);
    }, 1000);
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

function restoreSubmitButton() {
    const submitBtn = document.getElementById('btn-submit');
    if (submitBtn) {
        submitBtn.textContent = 'Enviar Solicitação';
        submitBtn.disabled = false;
    }
}

function showSuccessMessage(data) {
    const resultContent = `
        <div class="result-message result-success">
            <h3>Solicitação processada! ✅</h3>
            <p>Obrigado, <strong>${data.nome}</strong>! Seu formulário foi processado.</p>
            <p>Entraremos em contato pelo WhatsApp: <strong>${data.whatsapp}</strong></p>
            <p><strong>Serviço:</strong> ${getServiceName(data.service)}</p>
            <div style="background: #f8f9fa; padding: 15px; border-radius: 10px; margin-top: 15px;">
                <h4>📋 Dados Enviados (Para Verificação):</h4>
                <p><strong>Nome:</strong> ${data.nome}</p>
                <p><strong>CPF:</strong> ${data.cpf}</p>
                <p><strong>Idade:</strong> ${data.idade}</p>
                <p><strong>WhatsApp:</strong> ${data.whatsapp}</p>
                <p><strong>Serviço:</strong> ${getServiceName(data.service)}</p>
            </div>
            <p style="margin-top: 15px; font-size: 14px; color: #666;">
                💡 Se os dados não aparecerem no Google Forms, verifique o console do navegador (F12) para detalhes.
            </p>
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

// Função para verificar os IDs dos campos diretamente
function verifyFieldIds() {
    console.group('🔍 Verificação de IDs do Google Forms');
    console.log('📍 URL do Forms:', GOOGLE_FORM_URL);
    console.log('📋 IDs dos Campos:');
    console.log('- Timestamp:', FIELD_IDS.TIMESTAMP);
    console.log('- Serviço:', FIELD_IDS.SERVICE);
    console.log('- Nome:', FIELD_IDS.NAME);
    console.log('- CPF:', FIELD_IDS.CPF);
    console.log('- Idade:', FIELD_IDS.AGE);
    console.log('- WhatsApp:', FIELD_IDS.WHATSAPP);
    console.log('- Respostas:', FIELD_IDS.ANSWERS);
    console.groupEnd();
    
    alert('Verificação de IDs concluída. Verifique o console (F12) para detalhes.');
}

// Adicione esta função para testar o forms manualmente
function testManualFormSubmission() {
    const testData = {
        service: 'inss',
        nome: 'João Silva Teste',
        cpf: '123.456.789-00',
        idade: '35',
        whatsapp: '(11) 99999-9999',
        questionAnswers: { inssRepresentante: 'nao' }
    };
    
    console.log('🧪 Teste manual de envio...');
    submitToGoogleForm(testData);
}