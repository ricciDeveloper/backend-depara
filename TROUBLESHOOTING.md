# 🔧 Troubleshooting - DE x PARA System

## ❌ Erro: "Failed to execute 'json' on 'Response': Unexpected end of JSON input"

### Causa
Este erro ocorre quando o frontend tenta fazer parse de JSON em uma resposta que não é JSON válido.

### Soluções

#### 1. Verificar se o servidor está rodando
```bash
# No terminal, execute:
npm run dev
```

#### 2. Verificar se as dependências estão instaladas
```bash
npm install
```

#### 3. Verificar se o arquivo .env está configurado
```bash
# Copie o arquivo de exemplo
cp env.example .env

# Edite o arquivo .env e configure sua GEMINI_API_KEY
```

#### 4. Testar conexão com o servidor
Abra o console do navegador (F12) e verifique se aparece:
```
✅ Servidor conectado: {status: "OK", timestamp: "...", version: "1.0.0"}
```

#### 5. Verificar logs do servidor
No terminal onde o servidor está rodando, verifique se há erros como:
- "GEMINI_API_KEY not found"
- "Error parsing Excel data"
- "Processing error"

### Passos para Debug

#### 1. Abrir Console do Navegador
- Pressione F12
- Vá para a aba "Console"
- Recarregue a página

#### 2. Verificar Status da Conexão
Procure por mensagens como:
- ✅ "Servidor conectado"
- ❌ "Servidor não disponível"
- ⚠️ "Servidor com problemas"

#### 3. Testar Upload de Arquivo
- Faça upload de uma planilha
- Verifique no console se aparecem logs como:
  - "Arquivo convertido, tamanho base64: XXXX"
  - "Pesos configurados: [0.4, 0.25, 0.2, 0.15]"
  - "Enviando requisição para /api/process"

#### 4. Verificar Resposta do Servidor
Procure por:
- "Resposta recebida: 200 OK"
- "Content-Type: application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"

### Problemas Comuns

#### Servidor não inicia
```bash
# Verificar se a porta 3000 está livre
netstat -an | grep 3000

# Ou usar outra porta
PORT=3001 npm run dev
```

#### Erro de dependências
```bash
# Limpar cache e reinstalar
rm -rf node_modules package-lock.json
npm install
```

#### Erro de permissão
```bash
# No Windows, execute como administrador
# No Linux/Mac, use sudo se necessário
sudo npm install
```

#### Gemini API não configurada
1. Obtenha sua chave em: https://ai.google.dev/
2. Edite o arquivo `.env`
3. Adicione: `GEMINI_API_KEY=sua_chave_aqui`
4. Reinicie o servidor

### Teste Manual

#### 1. Testar Health Check
```bash
curl http://localhost:3000/api/health
```

#### 2. Testar com arquivo pequeno
Use uma planilha com apenas 2-3 linhas para testar.

#### 3. Verificar formato da planilha
Certifique-se de que sua planilha tem:
- Aba "DE" com colunas: url, slug, meta_title, meta_description, h1
- Aba "RASTREIO" com as mesmas colunas

### Logs Úteis

#### Frontend (Console do Navegador)
- ✅ "Servidor conectado"
- "Arquivo convertido, tamanho base64: XXXX"
- "Resposta recebida: 200 OK"

#### Backend (Terminal)
- "🚀 Server running on port 3000"
- "Processing file with weights: [0.4, 0.25, 0.2, 0.15]"
- "Found X results with score >= 0.8"

### Contato
Se o problema persistir:
1. Verifique os logs completos
2. Teste com uma planilha de exemplo
3. Verifique se todas as dependências estão instaladas
4. Confirme se o servidor está rodando na porta correta
