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

// IDs dos campos
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
    checkLocalStorage();
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

function checkLocalStorage() {
    const backupKeys = [];
    for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key.startsWith('ecred_backup_')) {
            backupKeys.push(key);
        }
    }
    
    if (backupKeys.length > 0) {
        console.log('📦 Dados salvos localmente:', backupKeys.length);
    }
}

function addToHistory(step) {
    formState.history.push(step);
    console.log('📋 Histórico atualizado:', formState.history);
}

function goBack() {
    console.log('🔙 Voltando...');
    if (formState.history.length > 1) {
        formState.history.pop();
        const previousStep = formState.history[formState.history.length - 1];
        
        console.log('↩️ Voltando para:', previousStep);
        
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
            console.error('❌ Serviço não reconhecido:', formState.selectedService);
    }
}

function showFGTSMessage() {
    console.log('📝 Mostrando mensagem FGTS');
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
    console.log('📝 Mostrando perguntas INSS');
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
    
    // Configurar eventos para as perguntas do INSS
    setTimeout(() => {
        const inssRadios = document.querySelectorAll('input[name="inss-representante"]');
        const btnNext = document.getElementById('btn-next-inss');
        
        if (inssRadios.length && btnNext) {
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
    }, 100);
}

function showINSSAgeQuestion() {
    console.log('📝 Mostrando pergunta de idade INSS');
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
    
    // Configurar evento para o botão de verificar idade
    setTimeout(() => {
        const btnCheckAge = document.getElementById('btn-check-age');
        if (btnCheckAge) {
            btnCheckAge.addEventListener('click', function() {
                const idadeInput = document.getElementById('titular-idade');
                if (idadeInput) {
                    const idade = parseInt(idadeInput.value);
                    
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
                }
            });
        }
    }, 100);
}

function showCLTQuestions() {
    console.log('📝 Mostrando perguntas CLT');
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
    
    // Configurar evento para o botão de verificar meses
    setTimeout(() => {
        const btnCheckMonths = document.getElementById('btn-check-months');
        if (btnCheckMonths) {
            btnCheckMonths.addEventListener('click', function() {
                const mesesInput = document.getElementById('meses-empresa');
                if (mesesInput) {
                    const meses = parseInt(mesesInput.value);
                    
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
                }
            });
        }
    }, 100);
}

function showCLTLoanQuestion() {
    console.log('📝 Mostrando pergunta de empréstimo CLT');
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
    
    // Configurar eventos para as perguntas do CLT
    setTimeout(() => {
        const cltRadios = document.querySelectorAll('input[name="clt-emprestimo"]');
        const btnNext = document.getElementById('btn-next-clt');
        
        if (cltRadios.length && btnNext) {
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
    }, 100);
}

function showBolsaFamiliaQuestions() {
    console.log('📝 Mostrando perguntas Bolsa Família');
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
    
    // Configurar evento para o botão de verificar valor
    setTimeout(() => {
        const btnCheckValor = document.getElementById('btn-check-valor');
        if (btnCheckValor) {
            btnCheckValor.addEventListener('click', function() {
                const valorInput = document.getElementById('valor-bolsa');
                if (valorInput) {
                    const valor = parseFloat(valorInput.value);
                    
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
                }
            });
        }
    }, 100);
}

function showBolsaFamiliaAppQuestion() {
    console.log('📝 Mostrando pergunta de app Bolsa Família');
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
    
    // Configurar eventos para as perguntas do app
    setTimeout(() => {
        const appRadios = document.querySelectorAll('input[name="bolsa-app"]');
        const btnNext = document.getElementById('btn-next-app');
        
        if (appRadios.length && btnNext) {
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
    }, 100);
}

function showBolsaFamiliaLoanQuestion() {
    console.log('📝 Mostrando pergunta de empréstimo Bolsa Família');
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
    
    // Configurar eventos para as perguntas do empréstimo
    setTimeout(() => {
        const bolsaRadios = document.querySelectorAll('input[name="bolsa-emprestimo"]');
        const btnNext = document.getElementById('btn-next-bolsa');
        
        if (bolsaRadios.length && btnNext) {
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
    }, 100);
}

function showQuestionsStep(html) {
    console.log('📋 Mostrando etapa de perguntas');
    const questionsStep = document.getElementById('step-questions');
    if (questionsStep) {
        questionsStep.innerHTML = html;
        showStep('questions');
    } else {
        console.error('❌ Elemento de perguntas não encontrado');
    }
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

// Função para teste rápido
function testNavigation() {
    console.log('🧪 Testando navegação...');
    formState.selectedService = 'inss';
    handleServiceSelection();
}

// Adicionar goBack ao escopo global para funcionar no onclick
window.goBack = goBack;