const { GoogleGenerativeAI } = require('@google/generative-ai');
const cors = require('cors');

class GeminiService {
  constructor() {
    this.apiKey = process.env.GEMINI_API_KEY;
    if (!this.apiKey) {
      console.warn('⚠️  GEMINI_API_KEY not found in environment variables');
      this.gemini = null;
    } else {
      this.gemini = new GoogleGenerativeAI(this.apiKey);
      // Use the latest model: gemini-1.5-flash
      this.model = this.gemini.getGenerativeModel({ model: 'gemini-1.5-flash' });
    }
  }

  /**
   * Enhance matches using Gemini AI for better accuracy
   * @param {Array} results - Array of DE rows with candidates
   * @param {number} minScore - Minimum score threshold
   * @returns {Array} Enhanced results
   */
  async enhanceMatches(results, minScore = 0.8) {
    return this.enhanceMatchesWithProgress(results, minScore);
  }

  /**
   * Enhance matches using Gemini AI with progress callback
   * @param {Array} results - Array of DE rows with candidates
   * @param {number} minScore - Minimum score threshold
   * @param {Function} progressCallback - Callback function for progress updates
   * @returns {Array} Enhanced results
   */
  async enhanceMatchesWithProgress(results, minScore = 0.8, progressCallback = null) {
    if (!this.gemini) {
      console.log('Gemini API not available, returning original results');
      return results;
    }

    console.log(`🤖 Enhancing ${results.length} results with Gemini AI...`);
    const enhancedResults = [];
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < results.length; i++) {
      const result = results[i];
      
      try {
        // Get top candidates that meet minimum score
        const topCandidates = result.candidates
          .filter(c => c.score >= minScore)
          .slice(0, 3); // Limit to top 3 for faster processing

        if (topCandidates.length === 0) {
          enhancedResults.push(result);
          continue;
        }

        // Enhance with Gemini
        const enhanced = await this.enhanceSingleMatch(result.de, topCandidates);
        
        // Merge enhanced results with original
        const mergedCandidates = result.candidates.map(candidate => {
          const enhancedCandidate = enhanced.find(ec => ec.url === candidate.url);
          if (enhancedCandidate) {
            return {
              ...candidate,
              geminiScore: enhancedCandidate.geminiScore,
              geminiReason: enhancedCandidate.reason,
              finalScore: (candidate.score + enhancedCandidate.geminiScore) / 2
            };
          }
          return candidate;
        });

        enhancedResults.push({
          ...result,
          candidates: mergedCandidates.sort((a, b) => (b.finalScore || b.score) - (a.finalScore || a.score))
        });

        successCount++;

        // Update progress
        if (progressCallback) {
          const progress = ((i + 1) / results.length) * 100;
          progressCallback(progress);
        }

        // Add delay to respect API rate limits
        await this.delay(500);

      } catch (error) {
        console.error('Error enhancing match:', error.message);
        enhancedResults.push(result);
        errorCount++;
        
        // Update progress even on error
        if (progressCallback) {
          const progress = ((i + 1) / results.length) * 100;
          progressCallback(progress);
        }
        
        // If too many errors, stop trying Gemini
        if (errorCount > 3) {
          console.warn('⚠️ Too many Gemini API errors, continuing without AI enhancement');
          break;
        }
      }
    }

    console.log(`✅ Gemini enhancement complete: ${successCount} successful, ${errorCount} errors`);
    return enhancedResults;
  }

  /**
   * Enhance a single DE row with its candidates using Gemini
   * @param {Object} deRow - DE row data
   * @param {Array} candidates - Array of candidate matches
   * @returns {Array} Enhanced candidates with Gemini scores
   */
  async enhanceSingleMatch(deRow, candidates) {
    if (!this.gemini) {
      return candidates.map(c => ({ ...c, geminiScore: c.score, reason: 'Gemini API not available' }));
    }

    try {
      const prompt = this.buildEnhancementPrompt(deRow, candidates);
      const result = await this.model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();
      
      return this.parseGeminiResponse(text, candidates);

    } catch (error) {
      console.error('Gemini API error:', error.message);
      
      // Handle specific error types
      if (error.message.includes('404 Not Found')) {
        console.warn('⚠️ Gemini model not found, trying alternative approach');
        return candidates.map(c => ({ ...c, geminiScore: c.score, reason: 'Model not available' }));
      }
      
      if (error.message.includes('API key')) {
        console.warn('⚠️ Gemini API key issue');
        return candidates.map(c => ({ ...c, geminiScore: c.score, reason: 'API key issue' }));
      }
      
      return candidates.map(c => ({ ...c, geminiScore: c.score, reason: 'Gemini API error' }));
    }
  }

  /**
   * Build prompt for Gemini enhancement
   */
  buildEnhancementPrompt(deRow, candidates) {
    return `
Você é um especialista em e-commerce e análise semântica de produtos. Sua tarefa é encontrar o MELHOR match semântico entre produtos, considerando categoria, tipo e características.

ANÁLISE CRÍTICA: Evite matches inadequados como "blusa" → "bermuda" ou "sapato" → "óculos". Foque na SEMELHANÇA REAL do produto.

URL DE (origem):
- URL: ${deRow.url}
- Slug: ${deRow.slug}
- Meta Title: ${deRow.meta_title}
- Meta Description: ${deRow.meta_description}
- H1: ${deRow.h1}

URLs Candidatas RASTREIO:
${candidates.map((c, i) => `
${i + 1}. URL: ${c.url}
   - Slug: ${c.slug}
   - Meta Title: ${c.meta_title}
   - Meta Description: ${c.meta_description}
   - H1: ${c.h1}
   - Score atual: ${(c.score * 100).toFixed(1)}%
`).join('')}

CRITÉRIOS DE ANÁLISE:
1. **CATEGORIA DO PRODUTO**: Mesmo tipo de produto (roupa, calçado, acessório)
2. **FUNÇÃO**: Mesmo propósito ou uso
3. **CARACTERÍSTICAS**: Materiais, estilo, cor similares
4. **CONTEXTO**: Público-alvo e ocasião de uso

REGRAS IMPORTANTES:
- ❌ NUNCA match "blusa" com "bermuda" (tipos diferentes)
- ❌ NUNCA match "sapato" com "óculos" (categorias diferentes)
- ❌ NUNCA match "calça" com "tênis" (tipos diferentes)
- ✅ SIM match "blusa" com "camiseta" (mesmo tipo)
- ✅ SIM match "sapato esportivo" com "tênis" (mesmo propósito)
- ✅ SIM match "óculos" com "óculos" (mesmo produto)

PENALIZE matches inadequados com score baixo (0.0-0.3).
PREMIE matches semânticos corretos com score alto (0.7-1.0).

Responda APENAS no formato JSON abaixo, sem texto adicional:
[
  {
    "url": "url_da_candidata",
    "geminiScore": 0.95,
    "reason": "Explicação detalhada do match semântico"
  }
]

Score deve ser entre 0.0 e 1.0, sendo:
- 0.9-1.0: Match perfeito (mesmo produto/categoria)
- 0.7-0.8: Match bom (produtos similares)
- 0.5-0.6: Match moderado (categoria relacionada)
- 0.3-0.4: Match fraco (pouca semelhança)
- 0.0-0.2: Match inadequado (categorias diferentes)
`;
  }

  /**
   * Parse Gemini response and merge with candidates
   */
  parseGeminiResponse(text, candidates) {
    try {
      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const geminiResults = JSON.parse(jsonMatch[0]);
      
      return candidates.map(candidate => {
        const geminiResult = geminiResults.find(gr => gr.url === candidate.url);
        if (geminiResult) {
          return {
            ...candidate,
            geminiScore: Math.max(0, Math.min(1, geminiResult.geminiScore)),
            reason: geminiResult.reason || 'No reason provided'
          };
        }
        return {
          ...candidate,
          geminiScore: candidate.score,
          reason: 'Not analyzed by Gemini'
        };
      });

    } catch (error) {
      console.error('Error parsing Gemini response:', error);
      return candidates.map(c => ({ ...c, geminiScore: c.score, reason: 'Parse error' }));
    }
  }

  /**
   * Utility function to add delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Check if Gemini API is available
   */
  isAvailable() {
    return this.gemini !== null;
  }

  /**
   * Test Gemini API connection with multiple models
   */
  async testConnection() {
    if (!this.gemini) {
      return { success: false, message: 'Gemini API key not configured' };
    }

    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    
    for (const modelName of models) {
      try {
        console.log(`Testing Gemini model: ${modelName}`);
        const model = this.gemini.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Hello, are you working?');
        const response = await result.response;
        
        console.log(`✅ Model ${modelName} is working`);
        this.model = model; // Update to working model
        return { success: true, message: `Gemini API is working with model: ${modelName}` };
      } catch (error) {
        console.log(`❌ Model ${modelName} failed:`, error.message);
        continue;
      }
    }
    
    return { success: false, message: 'No working Gemini models found' };
  }
}

module.exports = new GeminiService();

// CORS configuration
const corsOptions = {
  origin: process.env.CORS_ORIGIN?.split(',') || '*',
  credentials: true
};
// app.use(cors(corsOptions));
