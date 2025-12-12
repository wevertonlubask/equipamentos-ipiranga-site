/**
 * Rotas de Produtos
 * 
 * @module routes/products
 * @description Endpoints para gerenciamento de produtos
 */

const express = require('express');
const router = express.Router();
const ProductController = require('../controllers/ProductController');
const { authenticate, canEdit } = require('../middleware/auth');
const { upload, processProductImage } = require('../middleware/upload');
const { validate, productSchemas } = require('../validators');

// =============================================
// ROTAS PÚBLICAS
// =============================================

/**
 * @route GET /api/products
 * @description Lista produtos com filtros
 * @access Public
 */
router.get('/', validate(productSchemas.query, 'query'), ProductController.index);

/**
 * @route GET /api/products/featured
 * @description Lista produtos em destaque
 * @access Public
 */
router.get('/featured', ProductController.featured);

/**
 * @route POST /api/products/by-ids
 * @description Busca produtos por IDs (para carrinho)
 * @access Public
 */
router.post('/by-ids', ProductController.findByIds);

/**
 * @route GET /api/products/:slug
 * @description Obtém um produto pelo slug ou ID
 * @access Public
 */
router.get('/:slug', ProductController.show);

// =============================================
// ROTAS ADMIN (requerem autenticação)
// =============================================

/**
 * @route POST /api/products
 * @description Cria um novo produto
 * @access Private (Editor+)
 */
router.post('/', authenticate, canEdit, validate(productSchemas.create), ProductController.create);

/**
 * @route PUT /api/products/:id
 * @description Atualiza um produto
 * @access Private (Editor+)
 */
router.put('/:id', authenticate, canEdit, validate(productSchemas.update), ProductController.update);

/**
 * @route DELETE /api/products/:id
 * @description Deleta um produto
 * @access Private (Editor+)
 */
router.delete('/:id', authenticate, canEdit, ProductController.delete);

/**
 * @route POST /api/products/:id/images
 * @description Adiciona imagem a um produto
 * @access Private (Editor+)
 */
router.post('/:id/images', authenticate, canEdit, upload.single('image'), processProductImage, ProductController.addImages);

/**
 * @route DELETE /api/products/:id/images/:imageId
 * @description Remove uma imagem de um produto
 * @access Private (Editor+)
 */
router.delete('/:id/images/:imageId', authenticate, canEdit, ProductController.removeImage);

/**
 * @route PUT /api/products/:id/images/:imageId/primary
 * @description Define imagem principal
 * @access Private (Editor+)
 */
router.put('/:id/images/:imageId/primary', authenticate, canEdit, ProductController.setPrimaryImage);

module.exports = router;
