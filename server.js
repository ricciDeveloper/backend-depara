const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
require('dotenv').config();

const geminiService = require('./services/geminiService');
const excelService = require('./services/excelService');
const similarityService = require('./services/similarityService');

// Store for progress tracking
const progressStore = new Map();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration - Allow all origins for development
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);

    // Allow localhost on any port for development
    if (origin.match(/^http:\/\/localhost(:\d+)?$/)) {
      return callback(null, true);
    }

    // Allow production domains
    const allowedOrigins = [
      'https://dexpara-automation.vercel.app',
      'https://dexpara-backend-production.up.railway.app'
    ];

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    // Environment variable override
    if (process.env.CORS_ORIGIN) {
      const envOrigins = process.env.CORS_ORIGIN.split(',');
      if (envOrigins.includes(origin)) {
        return callback(null, true);
      }
    }

    callback(null, true); // Allow all for now - tighten in production
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With']
};

// Security middleware
app.use(helmet());
app.use(cors(corsOptions));

// Rate limiting
const limiter = rateLimit({
  windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000, // 15 minutes
  max: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS) || 100, // limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});
app.use('/api/', limiter);

// Body parsing middleware
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use(express.static(path.join(__dirname)));

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Gemini API test endpoint
app.get('/api/gemini/test', async (req, res) => {
  try {
    const result = await geminiService.testConnection();
    res.json(result);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: error.message 
    });
  }
});

// Progress tracking endpoint (Server-Sent Events)
app.get('/api/progress/:sessionId', (req, res) => {
  const sessionId = req.params.sessionId;

  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Cache-Control': 'no-cache',
    'Connection': 'keep-alive',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Cache-Control'
  });

  // Send initial connection
  res.write(`data: ${JSON.stringify({ type: 'connected', sessionId })}\n\n`);

  // Check for progress updates
  const checkProgress = () => {
    const progress = progressStore.get(sessionId);
    if (progress) {
      res.write(`data: ${JSON.stringify(progress)}\n\n`);

      // If processing is complete or error, close connection
      if (progress.status === 'completed' || progress.status === 'error') {
        progressStore.delete(sessionId);
        res.end();
        return;
      }
    }

    // Continue checking every 500ms
    setTimeout(checkProgress, 500);
  };

  checkProgress();

  // Handle client disconnect
  req.on('close', () => {
    console.log(`Client disconnected from progress stream: ${sessionId}`);
  });
});

// Main processing endpoint
app.post('/api/process', async (req, res) => {
  const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

  try {
    const { fileData, weights, minScore = 0.8 } = req.body;

    if (!fileData) {
      return res.status(400).json({ error: 'File data is required' });
    }

    console.log('Processing file with weights:', weights, 'minScore:', minScore);

    // Initialize progress tracking
    const updateProgress = (step, percentage, message, details = {}) => {
      const progress = {
        sessionId,
        step,
        percentage: Math.round(percentage),
        message,
        details,
        timestamp: new Date().toISOString(),
        status: percentage === 100 ? 'completed' : 'processing'
      };
      progressStore.set(sessionId, progress);
      console.log(`Progress [${sessionId}]: ${percentage}% - ${message}`);
    };

    // Step 1: Parse Excel data (10%)
    updateProgress('parsing', 10, 'Analisando arquivo Excel...');
    const { deRows, rastRows } = excelService.parseExcelData(fileData);

    if (!deRows.length || !rastRows.length) {
      updateProgress('error', 0, 'Erro: Planilhas DE ou RASTREIO estão vazias');
      return res.status(400).json({ error: 'Invalid Excel data: DE or RASTREIO sheets are empty' });
    }

    // Step 2: Normalize data (20%)
    updateProgress('normalizing', 20, 'Normalizando dados...');
    const de = excelService.normalizeRows(deRows);
    const rast = excelService.normalizeRows(rastRows);

    // Step 3: Calculate similarities (40%)
    updateProgress('similarities', 40, `Calculando similaridades: ${de.length} URLs DE vs ${rast.length} URLs RASTREIO...`);
    const results = similarityService.calculateSimilarities(de, rast, weights);

    console.log(`Processing ${results.length} DE URLs against ${rast.length} RASTREIO URLs`);

    // Step 4: Gemini enhancement (40% to 90%)
    updateProgress('gemini', 50, 'Aplicando inteligência artificial Gemini...');
    const enhancedResults = await geminiService.enhanceMatchesWithProgress(results, minScore, (progress) => {
      const geminiProgress = 50 + (progress * 0.4); // 50% to 90%
      updateProgress('gemini', geminiProgress, `Gemini AI: ${progress.toFixed(0)}% concluído`, { processed: progress });
    });

    console.log(`Enhanced ${enhancedResults.length} results with Gemini AI`);

    // Step 5: Generate output Excel (90% to 100%)
    updateProgress('generating', 90, 'Gerando planilha de resultado...');
    const outputBuffer = excelService.generateOutputExcel(enhancedResults, minScore);

    // Complete
    updateProgress('completed', 100, 'Processamento concluído com sucesso!', {
      totalProcessed: results.length,
      enhancedResults: enhancedResults.length
    });

    // Send response
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', 'attachment; filename="dexpara_resultado.xlsx"');
    res.send(outputBuffer);

  } catch (error) {
    console.error('Processing error:', error);

    // Update progress with error
    const errorProgress = {
      sessionId,
      step: 'error',
      percentage: 0,
      message: `Erro: ${error.message}`,
      details: { error: error.message },
      timestamp: new Date().toISOString(),
      status: 'error'
    };
    progressStore.set(sessionId, errorProgress);

    res.status(500).json({ 
      error: 'Internal server error', 
      message: error.message,
      sessionId // Include sessionId for debugging
    });
  }
});

// Gemini enhancement endpoint (for individual requests)
app.post('/api/gemini/enhance', async (req, res) => {
  try {
    const { deRow, candidates } = req.body;

    if (!deRow || !candidates) {
      return res.status(400).json({ error: 'DE row and candidates are required' });
    }

    const enhanced = await geminiService.enhanceSingleMatch(deRow, candidates);
    res.json(enhanced);

  } catch (error) {
    console.error('Gemini enhancement error:', error);
    res.status(500).json({ 
      error: 'Gemini enhancement failed', 
      message: error.message 
    });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// ✅ Start server (only once)
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/api/health`);
  if (process.env.RENDER) {
    console.log("🌐 Running inside Render environment");
  }
});

module.exports = app;
