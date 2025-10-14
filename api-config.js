// Configuração da API para o frontend
export const API_CONFIG = {
  // URL base do backend
  BASE_URL: 'https://backend-depara.onrender.com',
  
  // Endpoints
  ENDPOINTS: {
    HEALTH: '/api/health',
    GEMINI_TEST: '/api/gemini/test',
    PROCESS: '/api/process',
    GEMINI_ENHANCE: '/api/gemini/enhance',
    PROGRESS: '/api/progress'
  },
  
  // Configurações de requisição
  REQUEST_CONFIG: {
    timeout: 300000, // 5 minutos para processamento
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    }
  },
  
  // Configurações de CORS
  CORS_CONFIG: {
    credentials: true,
    mode: 'cors'
  }
};

// Função para fazer requisições para a API
export async function apiRequest(endpoint, options = {}) {
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const config = {
    ...API_CONFIG.REQUEST_CONFIG,
    ...API_CONFIG.CORS_CONFIG,
    ...options
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    console.error('API Request failed:', error);
    throw error;
  }
}

// Função específica para upload de arquivo
export async function uploadFile(fileData, weights = [0.4, 0.25, 0.2, 0.15], minScore = 0.8) {
  const endpoint = API_CONFIG.ENDPOINTS.PROCESS;
  const url = `${API_CONFIG.BASE_URL}${endpoint}`;
  
  const payload = {
    fileData,
    weights,
    minScore
  };
  
  const config = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    },
    body: JSON.stringify(payload)
  };
  
  try {
    const response = await fetch(url, config);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    // Para download de arquivo Excel
    const blob = await response.blob();
    return blob;
  } catch (error) {
    console.error('File upload failed:', error);
    throw error;
  }
}

// Função para testar conectividade
export async function testConnection() {
  try {
    const health = await apiRequest(API_CONFIG.ENDPOINTS.HEALTH);
    const gemini = await apiRequest(API_CONFIG.ENDPOINTS.GEMINI_TEST);
    
    return {
      health,
      gemini,
      connected: true
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

export default API_CONFIG;
