/**
 * Middleware de Autenticação
 * 
 * @module middleware/auth
 * @description Middlewares para autenticação e autorização
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Verifica se o token JWT é válido
 */
const authenticate = async (req, res, next) => {
  try {
    // Obter token do header
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        message: 'Token de autenticação não fornecido'
      });
    }

    const token = authHeader.split(' ')[1];

    // Verificar token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Buscar usuário
    const user = await User.findById(decoded.userId);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    if (!user.is_active) {
      return res.status(401).json({
        success: false,
        message: 'Usuário desativado'
      });
    }

    // Adicionar usuário à requisição
    req.user = user;
    next();

  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    console.error('Erro na autenticação:', error);
    return res.status(500).json({
      success: false,
      message: 'Erro interno na autenticação'
    });
  }
};

/**
 * Verifica se o usuário tem uma das roles permitidas
 * @param {Array} allowedRoles - Roles permitidas
 */
const authorize = (allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Não autenticado'
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado. Permissão insuficiente.'
      });
    }

    next();
  };
};

/**
 * Middleware para verificar se é admin
 */
const isAdmin = authorize(['admin']);

/**
 * Middleware para verificar se pode editar (admin ou editor)
 */
const canEdit = authorize(['admin', 'editor']);

/**
 * Gera um token JWT
 * @param {Object} user - Dados do usuário
 * @returns {string} Token JWT
 */
const generateToken = (user) => {
  return jwt.sign(
    { userId: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * Middleware opcional de autenticação (não bloqueia, mas adiciona user se existir)
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (authHeader && authHeader.startsWith('Bearer ')) {
      const token = authHeader.split(' ')[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.userId);
      
      if (user && user.is_active) {
        req.user = user;
      }
    }
  } catch (error) {
    // Ignora erros - autenticação é opcional
  }
  
  next();
};

module.exports = {
  authenticate,
  authorize,
  isAdmin,
  canEdit,
  generateToken,
  optionalAuth
};
