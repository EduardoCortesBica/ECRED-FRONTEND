const { Octokit } = require("@octokit/rest");
const { createAppAuth } = require("@octokit/auth-app");
const XLSX = require('xlsx');

// Esta função será executada quando recebermos uma requisição
export default async function handler(request, response) {
  if (request.method !== 'POST') {
    return response.status(405).json({ error: 'Método não permitido' });
  }

  try {
    const data = request.body;
    
    // Processar dados (similar ao que fazíamos em Python)
    const newRow = {
      'Data/Hora': new Date().toLocaleString('pt-BR'),
      'Serviço': data.service,
      'Nome': data.nome,
      'CPF': data.cpf,
      'Idade': data.idade,
      'WhatsApp': data.whatsapp,
      // ... outros campos
    };
    
    // Aqui você salvaria no GitHub ou em outro serviço
    // Esta é uma implementação simplificada
    
    return response.status(200).json({ 
      success: true, 
      message: 'Dados recebidos com sucesso' 
    });
    
  } catch (error) {
    return response.status(500).json({ 
      success: false, 
      error: error.message 
    });
  }
}