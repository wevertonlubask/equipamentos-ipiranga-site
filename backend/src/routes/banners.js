/**
 * Rotas de Banners
 * 
 * @module routes/banners
 * @description Endpoints para gerenciamento de banners
 */

const express = require('express');
const router = express.Router();
const BannerController = require('../controllers/BannerController');
const { authenticate, canEdit } = require('../middleware/auth');
const { upload, processBannerImage } = require('../middleware/upload');
const { validate, bannerSchemas } = require('../validators');

// =============================================
// ROTAS PÚBLICAS
// =============================================

/**
 * @route GET /api/banners/active
 * @description Lista banners ativos para exibição
 * @access Public
 */
router.get('/active', BannerController.active);

// =============================================
// ROTAS ADMIN (requerem autenticação)
// =============================================

/**
 * @route GET /api/banners
 * @description Lista todos os banners
 * @access Private (Editor+)
 */
router.get('/', authenticate, canEdit, BannerController.index);

/**
 * @route GET /api/banners/:id
 * @description Obtém um banner pelo ID
 * @access Private (Editor+)
 */
router.get('/:id', authenticate, canEdit, BannerController.show);

/**
 * @route POST /api/banners
 * @description Cria um novo banner
 * @access Private (Editor+)
 */
router.post('/', 
  authenticate, 
  canEdit, 
  upload.fields([
    { name: 'image_desktop', maxCount: 1 },
    { name: 'image_mobile', maxCount: 1 }
  ]),
  processBannerImage,
  BannerController.create
);

/**
 * @route PUT /api/banners/reorder
 * @description Reordena banners
 * @access Private (Editor+)
 */
router.put('/reorder', authenticate, canEdit, BannerController.reorder);

/**
 * @route PUT /api/banners/:id
 * @description Atualiza um banner
 * @access Private (Editor+)
 */
router.put('/:id', 
  authenticate, 
  canEdit,
  upload.fields([
    { name: 'image_desktop', maxCount: 1 },
    { name: 'image_mobile', maxCount: 1 }
  ]),
  processBannerImage,
  BannerController.update
);

/**
 * @route DELETE /api/banners/:id
 * @description Deleta um banner
 * @access Private (Editor+)
 */
router.delete('/:id', authenticate, canEdit, BannerController.delete);

module.exports = router;
