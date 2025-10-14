# 📊 Formato de Resultado - DE x PARA

## 🎯 Objetivo
Gerar uma planilha **simples e objetiva** com mapeamento DE x PARA, processando **100% das URLs DE**.

## 📋 Formato da Planilha de Saída

### Estrutura Simples (3 Colunas)
| DE | PARA | SCORE_GERAL |
|----|------|-------------|
| URL de origem | URL de destino | Score em % |

### Exemplo Real
| DE | PARA | SCORE_GERAL |
|----|------|-------------|
| https://loja.com/produto-camiseta | https://novaloja.com/camiseta-basica | 87.3% |
| https://loja.com/categoria-sapatos | https://novaloja.com/sapatos-masculinos | 92.1% |
| https://loja.com/pagina-contato | SEM_MATCH_DISPONIVEL | 0.0% |

## 🔍 Lógica de Processamento

### 1. Cobertura Total
- ✅ **100% das URLs DE** são processadas
- ✅ **Todas recebem um match PARA** (mesmo que abaixo de 80%)
- ✅ **Nenhuma URL DE fica sem resposta**

### 2. Critérios de Match
1. **Prioridade**: Busca matches com score ≥ 80%
2. **Fallback**: Se não encontrar ≥ 80%, usa o melhor disponível
3. **Transparência**: Score real é sempre mostrado

### 3. Score Mínimo (80%)
- **Preferencial**: Matches ≥ 80% são priorizados
- **Não obrigatório**: URLs podem ter matches < 80% se necessário
- **Visível**: Score real aparece na coluna SCORE_GERAL

## 📈 Abas da Planilha

### 1. "DE_x_PARA_Resultado" (Principal)
- **3 colunas**: DE | PARA | SCORE_GERAL
- **100% cobertura**: Todas as URLs DE processadas
- **Formato limpo**: Fácil de usar e analisar

### 2. "Resumo" (Estatísticas)
- Total de URLs DE
- Matches com score ≥ 80%
- Matches encontrados (total)
- Taxa de match ≥ 80%
- Taxa de match total
- Score médio geral
- Data de processamento

## 🎯 Vantagens do Novo Formato

### ✅ Simplicidade
- Apenas 3 colunas essenciais
- Fácil de entender e usar
- Formato padrão para mapeamentos

### ✅ Cobertura Total
- 100% das URLs DE processadas
- Nenhuma URL perdida
- Resultado completo sempre

### ✅ Transparência
- Score real sempre visível
- Critério de 80% é preferencial, não obrigatório
- Fallback claro quando necessário

### ✅ Praticidade
- Formato direto para uso
- Fácil importação em outros sistemas
- Análise rápida dos resultados

## 🔧 Configuração

### Pesos de Similaridade (Padrão)
- **Slug**: 40% (maior peso)
- **Title**: 25%
- **Description**: 20%
- **H1**: 15%

### Score Mínimo
- **Configurado**: 80%
- **Aplicação**: Preferencial (não obrigatório)
- **Fallback**: Melhor match disponível

## 📊 Interpretação dos Resultados

### Scores Altos (≥ 80%)
- ✅ **Excelente match**: Alta similaridade
- ✅ **Recomendado**: Use este mapeamento
- ✅ **Confiável**: Boa correspondência

### Scores Médios (60-79%)
- ⚠️ **Match moderado**: Similaridade média
- ⚠️ **Revisar**: Verificar se faz sentido
- ⚠️ **Considerar**: Pode ser útil

### Scores Baixos (< 60%)
- ❌ **Match fraco**: Baixa similaridade
- ❌ **Revisar**: Provavelmente não é adequado
- ❌ **Substituir**: Buscar match manual

### SEM_MATCH_DISPONIVEL
- 🔍 **Sem correspondência**: Nenhum match encontrado
- 🔍 **Ação necessária**: Mapeamento manual
- 🔍 **Investigar**: Verificar se há URLs similares

## 🚀 Como Usar

1. **Upload**: Faça upload da planilha com abas "DE" e "RASTREIO"
2. **Processamento**: Sistema processa 100% das URLs DE
3. **Download**: Baixe a planilha com 3 colunas
4. **Análise**: Revise os scores e matches
5. **Ajustes**: Faça correções manuais se necessário

## 📝 Exemplo de Uso

### Entrada (Planilha Excel)
- **Aba DE**: 100 URLs de origem
- **Aba RASTREIO**: 200 URLs de destino

### Saída (Planilha Excel)
- **100 linhas**: Uma para cada URL DE
- **3 colunas**: DE | PARA | SCORE_GERAL
- **Cobertura**: 100% das URLs processadas
- **Scores**: Reais e transparentes

Este formato garante que você sempre tenha um resultado completo e utilizável! 🎉
