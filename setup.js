#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

console.log('🚀 Configurando DE x PARA Automation System...\n');

// Check if .env exists
const envPath = path.join(__dirname, '.env');
const envExamplePath = path.join(__dirname, 'env.example');

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    fs.copyFileSync(envExamplePath, envPath);
    console.log('✅ Arquivo .env criado a partir do env.example');
    console.log('⚠️  IMPORTANTE: Configure sua GEMINI_API_KEY no arquivo .env\n');
  } else {
    console.log('❌ Arquivo env.example não encontrado');
    process.exit(1);
  }
} else {
  console.log('✅ Arquivo .env já existe');
}

// Check if node_modules exists
const nodeModulesPath = path.join(__dirname, 'node_modules');
if (!fs.existsSync(nodeModulesPath)) {
  console.log('📦 Instalando dependências...');
  const { execSync } = require('child_process');
  try {
    execSync('npm install', { stdio: 'inherit' });
    console.log('✅ Dependências instaladas com sucesso\n');
  } catch (error) {
    console.log('❌ Erro ao instalar dependências:', error.message);
    process.exit(1);
  }
} else {
  console.log('✅ Dependências já instaladas\n');
}

// Check for Gemini API key
const envContent = fs.readFileSync(envPath, 'utf8');
if (envContent.includes('your_gemini_api_key_here')) {
  console.log('⚠️  ATENÇÃO: Configure sua GEMINI_API_KEY no arquivo .env');
  console.log('   Obtenha sua chave em: https://ai.google.dev/\n');
}

console.log('🎉 Setup concluído!');
console.log('\n📋 Próximos passos:');
console.log('1. Configure sua GEMINI_API_KEY no arquivo .env');
console.log('2. Execute: npm run dev');
console.log('3. Acesse: http://localhost:3000');
console.log('\n📚 Documentação completa no README.md');
