/**
 * Rotas de Autenticação
 * 
 * @module routes/auth
 * @description Endpoints de autenticação e usuários
 */

const express = require('express');
const router = express.Router();
const AuthController = require('../controllers/AuthController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { validate, authSchemas } = require('../validators');

// =============================================
// ROTAS PÚBLICAS
// =============================================

/**
 * @route POST /api/auth/login
 * @description Login de usuário
 * @access Public
 */
router.post('/login', validate(authSchemas.login), AuthController.login);

// =============================================
// ROTAS AUTENTICADAS
// =============================================

/**
 * @route GET /api/auth/me
 * @description Obtém dados do usuário logado
 * @access Private
 */
router.get('/me', authenticate, AuthController.me);

/**
 * @route PUT /api/auth/profile
 * @description Atualiza perfil do usuário logado
 * @access Private
 */
router.put('/profile', authenticate, AuthController.updateProfile);

/**
 * @route PUT /api/auth/password
 * @description Altera senha do usuário logado
 * @access Private
 */
router.put('/password', authenticate, validate(authSchemas.updatePassword), AuthController.updatePassword);

// =============================================
// ROTAS ADMIN
// =============================================

/**
 * @route GET /api/auth/users
 * @description Lista todos os usuários
 * @access Admin
 */
router.get('/users', authenticate, isAdmin, AuthController.listUsers);

/**
 * @route POST /api/auth/users
 * @description Cria um novo usuário
 * @access Admin
 */
router.post('/users', authenticate, isAdmin, validate(authSchemas.register), AuthController.createUser);

/**
 * @route PUT /api/auth/users/:id
 * @description Atualiza um usuário
 * @access Admin
 */
router.put('/users/:id', authenticate, isAdmin, AuthController.updateUser);

/**
 * @route DELETE /api/auth/users/:id
 * @description Deleta um usuário
 * @access Admin
 */
router.delete('/users/:id', authenticate, isAdmin, AuthController.deleteUser);

module.exports = router;
