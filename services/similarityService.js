class SimilarityService {
  /**
   * Calculate similarities between DE and RASTREIO rows
   * @param {Array} deRows - DE rows
   * @param {Array} rastRows - RASTREIO rows
   * @param {Array} weights - Similarity weights [slug, title, description, h1]
   * @returns {Array} Results with calculated similarities
   */
  calculateSimilarities(deRows, rastRows, weights = [0.4, 0.25, 0.2, 0.15]) {
    // Normalize weights
    const normalizedWeights = this.normalizeWeights(weights);
    
    return deRows.map(deRow => {
      const candidates = rastRows.map(rastRow => {
        // Calculate individual scores
        const slugScore = this.calculateSlugSimilarity(deRow.slug, rastRow.slug);
        const titleScore = this.calculateTextSimilarity(deRow.meta_title, rastRow.meta_title);
        const descScore = this.calculateTextSimilarity(deRow.meta_description, rastRow.meta_description);
        const h1Score = this.calculateTextSimilarity(deRow.h1, rastRow.h1);
        
        // Calculate weighted score
        const score = (
          slugScore * normalizedWeights[0] +
          titleScore * normalizedWeights[1] +
          descScore * normalizedWeights[2] +
          h1Score * normalizedWeights[3]
        );
        
        return {
          ...rastRow,
          score: Math.max(0, Math.min(1, score)), // Ensure score is between 0 and 1
          details: {
            slugScore,
            titleScore,
            descScore,
            h1Score
          }
        };
      }).sort((a, b) => b.score - a.score); // Sort by score descending
      
      return {
        de: deRow,
        candidates
      };
    });
  }

  /**
   * Normalize weights to sum to 1
   * @param {Array} weights - Input weights
   * @returns {Array} Normalized weights
   */
  normalizeWeights(weights) {
    const sum = weights.reduce((a, b) => a + b, 0);
    return weights.map(w => w / sum);
  }

  /**
   * Calculate slug similarity with special handling for URL slugs and product categories
   * @param {string} slug1 - First slug
   * @param {string} slug2 - Second slug
   * @returns {number} Similarity score (0-1)
   */
  calculateSlugSimilarity(slug1, slug2) {
    if (!slug1 || !slug2) return 0;
    if (slug1 === slug2) return 1;
    
    // Clean slugs (remove special characters, normalize)
    const clean1 = this.cleanSlug(slug1);
    const clean2 = this.cleanSlug(slug2);
    
    if (clean1 === clean2) return 1;
    
    // Extract product categories from slugs
    const category1 = this.extractProductCategory(clean1);
    const category2 = this.extractProductCategory(clean2);
    
    // Check if categories match (high importance)
    if (category1 && category2 && category1 === category2) {
      return 0.9; // High score for same category
    }
    
    // Check for incompatible categories (very low score)
    if (category1 && category2 && this.areIncompatibleCategories(category1, category2)) {
      return 0.1; // Very low score for incompatible categories
    }
    
    // Check for partial matches (one slug contains the other)
    if (clean1.includes(clean2) || clean2.includes(clean1)) {
      return 0.8;
    }
    
    // Use Levenshtein distance for similarity
    return this.calculateTextSimilarity(clean1, clean2);
  }

  /**
   * Clean slug for comparison
   * @param {string} slug - Raw slug
   * @returns {string} Cleaned slug
   */
  cleanSlug(slug) {
    return slug
      .toLowerCase()
      .replace(/[^a-z0-9\-_]/g, '') // Remove special chars except hyphens and underscores
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .replace(/^-|-$/g, ''); // Remove leading/trailing hyphens
  }

  /**
   * Calculate text similarity using Levenshtein distance
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Similarity score (0-1)
   */
  calculateTextSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    if (text1 === text2) return 1;
    
    const distance = this.levenshteinDistance(text1.toLowerCase(), text2.toLowerCase());
    const maxLength = Math.max(text1.length, text2.length);
    
    if (maxLength === 0) return 1;
    
    return Math.max(0, 1 - (distance / maxLength));
  }

  /**
   * Calculate Levenshtein distance between two strings
   * @param {string} str1 - First string
   * @param {string} str2 - Second string
   * @returns {number} Levenshtein distance
   */
  levenshteinDistance(str1, str2) {
    if (str1 === str2) return 0;
    if (str1.length === 0) return str2.length;
    if (str2.length === 0) return str1.length;
    
    const matrix = [];
    
    // Initialize matrix
    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }
    
    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }
    
    // Fill matrix
    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    
    return matrix[str2.length][str1.length];
  }

  /**
   * Calculate semantic similarity using keyword matching
   * @param {string} text1 - First text
   * @param {string} text2 - Second text
   * @returns {number} Semantic similarity score (0-1)
   */
  calculateSemanticSimilarity(text1, text2) {
    if (!text1 || !text2) return 0;
    
    const keywords1 = this.extractKeywords(text1);
    const keywords2 = this.extractKeywords(text2);
    
    if (keywords1.length === 0 || keywords2.length === 0) return 0;
    
    const intersection = keywords1.filter(k => keywords2.includes(k));
    const union = [...new Set([...keywords1, ...keywords2])];
    
    return intersection.length / union.length;
  }

  /**
   * Extract keywords from text
   * @param {string} text - Input text
   * @returns {Array} Array of keywords
   */
  extractKeywords(text) {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ') // Remove punctuation
      .split(/\s+/)
      .filter(word => word.length > 2) // Filter short words
      .filter(word => !this.isStopWord(word)); // Remove stop words
  }

  /**
   * Check if word is a stop word
   * @param {string} word - Word to check
   * @returns {boolean} True if stop word
   */
  isStopWord(word) {
    const stopWords = [
      'the', 'a', 'an', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for', 'of', 'with', 'by',
      'o', 'a', 'os', 'as', 'um', 'uma', 'uns', 'umas', 'de', 'da', 'do', 'das', 'dos',
      'em', 'na', 'no', 'nas', 'nos', 'para', 'por', 'com', 'sem', 'sobre', 'entre'
    ];
    return stopWords.includes(word.toLowerCase());
  }

  /**
   * Extract product category from slug
   * @param {string} slug - Cleaned slug
   * @returns {string|null} Product category
   */
  extractProductCategory(slug) {
    const categories = {
      // Roupas
      'blusa': 'roupa',
      'camiseta': 'roupa',
      'camisa': 'roupa',
      'bermuda': 'roupa',
      'calca': 'roupa',
      'calça': 'roupa',
      'short': 'roupa',
      'vestido': 'roupa',
      'saia': 'roupa',
      'jaqueta': 'roupa',
      'casaco': 'roupa',
      'moletom': 'roupa',
      'sueter': 'roupa',
      'cardigan': 'roupa',
      
      // Calçados
      'sapato': 'calcado',
      'tenis': 'calcado',
      'tênis': 'calcado',
      'sandalias': 'calcado',
      'sandálias': 'calcado',
      'chinelo': 'calcado',
      'bota': 'calcado',
      'salto': 'calcado',
      'sneaker': 'calcado',
      
      // Acessórios
      'oculos': 'acessorio',
      'óculos': 'acessorio',
      'mochila': 'acessorio',
      'bolsa': 'acessorio',
      'carteira': 'acessorio',
      'cinto': 'acessorio',
      'relogio': 'acessorio',
      'relógio': 'acessorio',
      'chapeu': 'acessorio',
      'chapéu': 'acessorio',
      'boné': 'acessorio',
      'bonet': 'acessorio',
      'luvas': 'acessorio',
      'cachecol': 'acessorio',
      'cachecól': 'acessorio'
    };

    const words = slug.split('-');
    for (const word of words) {
      if (categories[word.toLowerCase()]) {
        return categories[word.toLowerCase()];
      }
    }
    
    return null;
  }

  /**
   * Check if two product categories are incompatible
   * @param {string} category1 - First category
   * @param {string} category2 - Second category
   * @returns {boolean} True if incompatible
   */
  areIncompatibleCategories(category1, category2) {
    if (category1 === category2) return false;
    
    // Define incompatible category pairs
    const incompatiblePairs = [
      ['roupa', 'calcado'],
      ['roupa', 'acessorio'],
      ['calcado', 'acessorio']
    ];
    
    for (const pair of incompatiblePairs) {
      if ((category1 === pair[0] && category2 === pair[1]) ||
          (category1 === pair[1] && category2 === pair[0])) {
        return true;
      }
    }
    
    return false;
  }

  /**
   * Get similarity statistics
   * @param {Array} results - Similarity results
   * @returns {Object} Statistics
   */
  getSimilarityStats(results) {
    const allScores = results.flatMap(r => r.candidates.map(c => c.score));
    
    return {
      totalComparisons: allScores.length,
      averageScore: allScores.reduce((a, b) => a + b, 0) / allScores.length,
      maxScore: Math.max(...allScores),
      minScore: Math.min(...allScores),
      scoresAbove80: allScores.filter(s => s >= 0.8).length,
      scoresAbove90: allScores.filter(s => s >= 0.9).length
    };
  }
}

module.exports = new SimilarityService();
