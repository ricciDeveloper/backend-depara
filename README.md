# DE x PARA Automation - Backend

Sistema de automação DE x PARA com integração Gemini API para análise semântica de mapeamento de URLs.

## 🚀 Funcionalidades

- Processamento de planilhas Excel com abas "DE" e "RASTREIO"
- Análise de similaridade entre URLs usando múltiplos critérios
- Integração com Gemini AI para melhorar precisão dos matches
- Geração de planilha de resultado com scores de semelhança
- API REST com endpoints para processamento e testes
- Rate limiting e segurança com Helmet e CORS

## 📋 Pré-requisitos

- Node.js >= 16.0.0
- NPM ou Yarn
- Chave da API Gemini (opcional)

## ⚙️ Instalação

1. Clone o repositório:
```bash
git clone <repository-url>
cd dexpara-automation/back
```

2. Instale as dependências:
```bash
npm install
```

3. Configure as variáveis de ambiente:
```bash
cp env.example .env
```

4. Edite o arquivo `.env` e adicione sua chave da API Gemini:
```env
GEMINI_API_KEY=your_gemini_api_key_here
PORT=3000
NODE_ENV=development
```

## 🔧 Configuração

### Variáveis de Ambiente

| Variável | Descrição | Valor Padrão |
|----------|-----------|--------------|
| `GEMINI_API_KEY` | Chave da API Gemini | `your_gemini_api_key_here` |
| `PORT` | Porta do servidor | `3000` |
| `NODE_ENV` | Ambiente de execução | `development` |
| `RATE_LIMIT_WINDOW_MS` | Janela de rate limiting (ms) | `900000` |
| `RATE_LIMIT_MAX_REQUESTS` | Máximo de requisições | `100` |
| `CORS_ORIGIN` | Origem permitida para CORS | `http://localhost:3000,http://localhost:4173` |

## 🏃 Execução

### Desenvolvimento
```bash
npm run dev
```

### Produção
```bash
npm start
```

O servidor estará disponível em `http://localhost:3000`

## 📡 Endpoints da API

**Base URL:** `https://backend-depara.onrender.com`

### Health Check
```
GET /api/health
```
Retorna status do servidor e informações de configuração.

**Exemplo de resposta:**
```json
{
  "status": "OK",
  "timestamp": "2025-10-14T22:37:46.068Z",
  "version": "1.0.0",
  "environment": "production",
  "port": 10000,
  "cors_origins": "default"
}
```

### Teste da API Gemini
```
GET /api/gemini/test
```
Testa a conectividade com a API Gemini.

**Exemplo de resposta:**
```json
{
  "success": true,
  "message": "Gemini API is working with model: gemini-1.5-flash"
}
```

### Processar Planilha
```
POST /api/process
Content-Type: application/json

{
  "fileData": "base64_string",
  "weights": [0.4, 0.25, 0.2, 0.15],
  "minScore": 0.8
}
```
Processa planilha Excel e retorna arquivo `dexpara_resultado.xlsx`.

### Melhorar Match Individual
```
POST /api/gemini/enhance
Content-Type: application/json

{
  "deRow": {...},
  "candidates": [...]
}
```
Usa Gemini AI para melhorar um match específico.

## 📁 Estrutura do Projeto

```
back/
├── services/
│   ├── excelService.js      # Processamento de Excel
│   ├── geminiService.js     # Interface com Gemini AI
│   └── similarityService.js # Cálculo de similaridade
├── server.js                 # Servidor principal
├── package.json             # Dependências
├── .env                     # Variáveis de ambiente
└── README.md               # Documentação
```

## 🔧 Serviços

### GeminiService
- Conexão com Gemini AI
- Melhoria de matches usando IA
- Fallback para processamento sem IA

### ExcelService
- Parsing de planilhas Excel
- Normalização de dados
- Geração de arquivo de resultado

### SimilarityService
- Cálculo de similaridade entre URLs
- Pesos configuráveis para diferentes critérios
- Algoritmo de Levenshtein para strings

## 🚀 Deploy

### Render (Atual)
O backend está deployado no Render em: `https://backend-depara.onrender.com`

**Configuração no Render:**
1. Conecte seu repositório ao Render
2. Configure as variáveis de ambiente:
   - `GEMINI_API_KEY`: Sua chave da API Gemini
   - `NODE_ENV`: `production`
   - `CORS_ORIGIN`: `https://dexpara-automation.vercel.app,https://backend-depara.onrender.com`
3. Deploy automático

### Outros Serviços
Este backend pode ser deployado em qualquer serviço que suporte Node.js:
- Railway
- Heroku
- DigitalOcean App Platform
- AWS Lambda

## 🛠️ Desenvolvimento

### Estrutura da Planilha

A planilha deve conter duas abas:

**Aba "DE"**:
- `url`: URL de origem
- `slug`: Slug da URL
- `meta_title`: Título da página
- `meta_description`: Descrição da página
- `h1`: Conteúdo do H1

**Aba "RASTREIO"**:
- `url`: URL de destino
- `slug`: Slug da URL
- `meta_title`: Título da página
- `meta_description`: Descrição da página
- `h1`: Conteúdo do H1

### Configuração de Pesos

Os pesos são aplicados na seguinte ordem:
1. Slug similarity (padrão: 0.4)
2. Meta title similarity (padrão: 0.25)
3. Meta description similarity (padrão: 0.2)
4. H1 similarity (padrão: 0.15)

## 🐛 Troubleshooting

### Erro: "Gemini API key not configured"
- Verifique se a variável `GEMINI_API_KEY` está definida no `.env`
- Obtenha uma chave da API em: https://ai.google.dev/

### Erro: "Invalid Excel data"
- Verifique se a planilha tem as abas "DE" e "RASTREIO"
- Verifique se todas as colunas obrigatórias estão presentes

### CORS Error
- Configure `CORS_ORIGIN` no `.env` com as origens permitidas
- Para desenvolvimento, use `http://localhost:3000,http://localhost:4173`

## 📝 Licença

MIT License - veja arquivo LICENSE para detalhes.

## 👨‍💻 Autor

João Ricci - [GitHub](https://github.com/joaoricci)