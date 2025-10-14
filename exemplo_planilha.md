# Exemplo de Planilha DE x PARA

## Estrutura Esperada

O sistema espera um arquivo Excel com duas abas específicas:

### Aba "DE" (URLs de Origem)
| url | slug | meta_title | meta_description | h1 |
|-----|------|------------|------------------|-----|
| https://exemplo.com/produto-a | produto-a | Produto A - Loja Online | Descrição do produto A com características e benefícios | Produto A |
| https://exemplo.com/categoria-b | categoria-b | Categoria B - Produtos | Explore nossa categoria B com os melhores produtos | Categoria B |

### Aba "RASTREIO" (URLs de Destino)
| url | slug | meta_title | meta_description | h1 |
|-----|------|------------|------------------|-----|
| https://novosite.com/produto-1 | produto-1 | Produto 1 - Nova Loja | Descrição detalhada do produto 1 com especificações | Produto 1 |
| https://novosite.com/categoria-2 | categoria-2 | Categoria 2 - Novos Produtos | Descubra nossa categoria 2 com produtos exclusivos | Categoria 2 |

## Colunas Obrigatórias

### url
- URL completa da página
- Deve ser válida e acessível
- Usado para extrair slug automaticamente se não fornecido

### slug
- Parte da URL após o domínio
- Se não fornecido, será extraído automaticamente da URL
- Usado para comparação de similaridade

### meta_title
- Título da página (tag `<title>`)
- Importante para SEO e similaridade
- Peso: 25% no cálculo final

### meta_description
- Descrição da página (meta description)
- Usado para análise de conteúdo
- Peso: 20% no cálculo final

### h1
- Cabeçalho principal da página
- Indica o assunto principal
- Peso: 15% no cálculo final

## Resultado Esperado

O sistema gerará uma planilha **simples e objetiva** com apenas **3 colunas**:

### Colunas de Saída
- **DE**: URL de origem (100% das URLs processadas)
- **PARA**: Melhor match encontrado (URL de destino)
- **SCORE_GERAL**: Score final combinado (formato: XX.X%)

### Exemplo de Resultado
| DE | PARA | SCORE_GERAL |
|----|------|-------------|
| https://exemplo.com/produto-a | https://novosite.com/produto-1 | 85.2% |
| https://exemplo.com/categoria-b | https://novosite.com/categoria-2 | 92.1% |
| https://exemplo.com/pagina-c | SEM_MATCH_DISPONIVEL | 0.0% |

## Critérios de Match

### Score Mínimo: 80% (Preferencial)
- **Prioridade**: Matches com score ≥ 80% são preferenciais
- **Fallback**: Se não houver match ≥ 80%, usa o melhor disponível
- **Cobertura**: 100% das URLs DE recebem um match PARA
- **Transparência**: Score real é sempre mostrado

### Pesos de Similaridade (configuráveis)
- **Slug**: 40% (maior peso)
- **Title**: 25%
- **Description**: 20%
- **H1**: 15%

### Análise Gemini AI
- Melhora a precisão dos matches
- Fornece justificativas para as escolhas
- Combina score original com análise semântica

## Dicas para Melhores Resultados

1. **URLs Válidas**: Certifique-se de que todas as URLs são válidas
2. **Conteúdo Completo**: Preencha todos os campos (title, description, h1)
3. **Slugs Descritivos**: Use slugs que descrevam o conteúdo
4. **Títulos Claros**: Títulos devem ser descritivos e únicos
5. **Descrições Detalhadas**: Meta descriptions devem ser informativas
6. **H1s Específicos**: Cabeçalhos devem indicar claramente o assunto

## Exemplo de Uso

1. Prepare sua planilha com as abas "DE" e "RASTREIO"
2. Faça upload no sistema
3. Configure os pesos (opcional)
4. Processe a planilha
5. Baixe o resultado com o mapeamento completo
6. Revise os matches e justificativas da IA
