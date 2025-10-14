// Exemplo de uso da API no frontend
import { apiRequest, uploadFile, testConnection, API_CONFIG } from './api-config.js';

// Exemplo 1: Testar conectividade
async function testBackendConnection() {
  console.log('🧪 Testando conectividade com o backend...');
  
  const result = await testConnection();
  
  if (result.connected) {
    console.log('✅ Backend conectado!');
    console.log('Health:', result.health);
    console.log('Gemini:', result.gemini);
  } else {
    console.error('❌ Erro de conectividade:', result.error);
  }
}

// Exemplo 2: Processar arquivo Excel
async function processExcelFile(file) {
  console.log('📊 Processando arquivo Excel...');
  
  try {
    // Converter arquivo para base64
    const fileData = await fileToBase64(file);
    
    // Configurações de processamento
    const weights = [0.4, 0.25, 0.2, 0.15]; // slug, title, description, h1
    const minScore = 0.8; // Score mínimo de 80%
    
    // Fazer upload e processar
    const resultBlob = await uploadFile(fileData, weights, minScore);
    
    // Download do resultado
    downloadFile(resultBlob, 'dexpara_resultado.xlsx');
    
    console.log('✅ Arquivo processado com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no processamento:', error);
  }
}

// Exemplo 3: Monitorar progresso (Server-Sent Events)
function monitorProgress(sessionId) {
  const eventSource = new EventSource(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.PROGRESS}/${sessionId}`);
  
  eventSource.onmessage = function(event) {
    const progress = JSON.parse(event.data);
    
    console.log(`Progresso: ${progress.percentage}% - ${progress.message}`);
    
    // Atualizar UI com progresso
    updateProgressBar(progress.percentage);
    updateProgressMessage(progress.message);
    
    if (progress.status === 'completed' || progress.status === 'error') {
      eventSource.close();
      
      if (progress.status === 'completed') {
        console.log('✅ Processamento concluído!');
      } else {
        console.error('❌ Erro no processamento:', progress.message);
      }
    }
  };
  
  eventSource.onerror = function(event) {
    console.error('❌ Erro na conexão SSE:', event);
    eventSource.close();
  };
}

// Funções auxiliares
function fileToBase64(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => {
      // Remove o prefixo "data:application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;base64,"
      const base64 = reader.result.split(',')[1];
      resolve(base64);
    };
    reader.onerror = error => reject(error);
  });
}

function downloadFile(blob, filename) {
  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(a);
}

function updateProgressBar(percentage) {
  const progressBar = document.getElementById('progress-bar');
  if (progressBar) {
    progressBar.style.width = `${percentage}%`;
    progressBar.textContent = `${percentage}%`;
  }
}

function updateProgressMessage(message) {
  const progressMessage = document.getElementById('progress-message');
  if (progressMessage) {
    progressMessage.textContent = message;
  }
}

// Exemplo de uso em um formulário HTML
document.addEventListener('DOMContentLoaded', function() {
  // Testar conectividade ao carregar a página
  testBackendConnection();
  
  // Configurar formulário de upload
  const fileInput = document.getElementById('excel-file');
  const processButton = document.getElementById('process-button');
  const progressContainer = document.getElementById('progress-container');
  
  if (processButton && fileInput) {
    processButton.addEventListener('click', async function() {
      const file = fileInput.files[0];
      
      if (!file) {
        alert('Por favor, selecione um arquivo Excel.');
        return;
      }
      
      // Mostrar container de progresso
      if (progressContainer) {
        progressContainer.style.display = 'block';
      }
      
      try {
        await processExcelFile(file);
      } catch (error) {
        console.error('Erro:', error);
        alert('Erro no processamento: ' + error.message);
      }
    });
  }
});

// Exportar funções para uso em outros módulos
export {
  testBackendConnection,
  processExcelFile,
  monitorProgress,
  fileToBase64,
  downloadFile
};
