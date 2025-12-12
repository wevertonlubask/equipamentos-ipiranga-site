/**
 * Rotas de Categorias
 * 
 * @module routes/categories
 * @description Endpoints para gerenciamento de categorias
 */

const express = require('express');
const router = express.Router();
const CategoryController = require('../controllers/CategoryController');
const { authenticate, canEdit } = require('../middleware/auth');
const { validate, categorySchemas } = require('../validators');

// =============================================
// ROTAS PÚBLICAS
// =============================================

/**
 * @route GET /api/categories
 * @description Lista todas as categorias
 * @access Public
 */
router.get('/', CategoryController.index);

/**
 * @route GET /api/categories/:slug
 * @description Obtém uma categoria pelo slug ou ID
 * @access Public
 */
router.get('/:slug', CategoryController.show);

// =============================================
// ROTAS ADMIN (requerem autenticação)
// =============================================

/**
 * @route POST /api/categories
 * @description Cria uma nova categoria
 * @access Private (Editor+)
 */
router.post('/', authenticate, canEdit, validate(categorySchemas.create), CategoryController.create);

/**
 * @route PUT /api/categories/reorder
 * @description Reordena categorias
 * @access Private (Editor+)
 */
router.put('/reorder', authenticate, canEdit, CategoryController.reorder);

/**
 * @route PUT /api/categories/:id
 * @description Atualiza uma categoria
 * @access Private (Editor+)
 */
router.put('/:id', authenticate, canEdit, validate(categorySchemas.update), CategoryController.update);

/**
 * @route DELETE /api/categories/:id
 * @description Deleta uma categoria
 * @access Private (Editor+)
 */
router.delete('/:id', authenticate, canEdit, CategoryController.delete);

module.exports = router;
