/**
 * Servidor Principal - Ipiranga Fitness API
 * 
 * @description Servidor Express para a API do sistema
 */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

// Importar configurações e rotas
const { testConnection } = require('./config/database');
const routes = require('./routes');

// Criar app Express
const app = express();

// =============================================
// MIDDLEWARES DE SEGURANÇA
// =============================================

// Helmet para headers de segurança
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));

// CORS configurado
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting geral
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por janela
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  }
});

// Rate limiting para cotações (mais restritivo)
const quotationLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hora
  max: 10, // máximo 10 cotações por hora
  message: {
    success: false,
    message: 'Limite de solicitações atingido. Tente novamente mais tarde.'
  }
});

// =============================================
// MIDDLEWARES DE PARSING
// =============================================

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// =============================================
// ARQUIVOS ESTÁTICOS
// =============================================

// Servir uploads
app.use('/uploads', express.static(path.join(__dirname, '../uploads'), {
  maxAge: '7d',
  etag: true
}));

// =============================================
// ROTAS
// =============================================

// Aplicar rate limit à rota de cotações
app.use('/api/quotations', quotationLimiter);

// Aplicar rate limit geral
app.use('/api', generalLimiter);

// Rotas da API
app.use('/api', routes);

// Rota raiz
app.get('/', (req, res) => {
  res.json({
    name: 'Ipiranga Fitness API',
    version: '1.0.0',
    status: 'online',
    documentation: '/api/health'
  });
});

// =============================================
// TRATAMENTO DE ERROS
// =============================================

// Erro de validação do Multer
app.use((error, req, res, next) => {
  if (error.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({
      success: false,
      message: 'Arquivo muito grande. Tamanho máximo: 10MB'
    });
  }

  if (error.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({
      success: false,
      message: 'Campo de upload inválido'
    });
  }

  next(error);
});

// Erro genérico
app.use((error, req, res, next) => {
  console.error('Erro não tratado:', error);
  
  res.status(error.status || 500).json({
    success: false,
    message: process.env.NODE_ENV === 'production' 
      ? 'Erro interno no servidor' 
      : error.message,
    ...(process.env.NODE_ENV !== 'production' && { stack: error.stack })
  });
});

// =============================================
// INICIALIZAÇÃO DO SERVIDOR
// =============================================

const PORT = process.env.PORT || 3001;

async function startServer() {
  try {
    // Testar conexão com banco
    const dbConnected = await testConnection();
    
    if (!dbConnected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      console.log('💡 Execute "npm run migrate" para criar as tabelas');
      // Continuar mesmo sem banco para desenvolvimento
    }

    // Iniciar servidor
    app.listen(PORT, () => {
      console.log('\n========================================');
      console.log('   🏋️  IPIRANGA FITNESS API');
      console.log('========================================');
      console.log(`   📡 Servidor: http://localhost:${PORT}`);
      console.log(`   🔧 Ambiente: ${process.env.NODE_ENV || 'development'}`);
      console.log(`   🗄️  Banco: ${dbConnected ? 'Conectado' : 'Desconectado'}`);
      console.log('========================================\n');
    });

  } catch (error) {
    console.error('Erro ao iniciar servidor:', error);
    process.exit(1);
  }
}

// Tratamento de sinais para encerramento gracioso
process.on('SIGTERM', () => {
  console.log('Recebido SIGTERM, encerrando servidor...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('Recebido SIGINT, encerrando servidor...');
  process.exit(0);
});

// Iniciar
startServer();

module.exports = app;
