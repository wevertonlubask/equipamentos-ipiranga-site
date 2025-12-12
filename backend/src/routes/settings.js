/**
 * Rotas de Configurações
 * 
 * @module routes/settings
 * @description Endpoints para gerenciamento de configurações do site
 */

const express = require('express');
const router = express.Router();
const SettingsController = require('../controllers/SettingsController');
const { authenticate, isAdmin } = require('../middleware/auth');
const { upload, processLogoImage } = require('../middleware/upload');
const { validate, settingsSchemas } = require('../validators');

// =============================================
// ROTAS PÚBLICAS
// =============================================

/**
 * @route GET /api/settings/public
 * @description Obtém configurações públicas
 * @access Public
 */
router.get('/public', SettingsController.public);

// =============================================
// ROTAS ADMIN (requerem autenticação)
// =============================================

/**
 * @route GET /api/settings
 * @description Obtém todas as configurações
 * @access Private (Admin)
 */
router.get('/', authenticate, isAdmin, SettingsController.index);

/**
 * @route GET /api/settings/group/:group
 * @description Obtém configurações por grupo
 * @access Private (Admin)
 */
router.get('/group/:group', authenticate, isAdmin, SettingsController.byGroup);

/**
 * @route GET /api/settings/seo
 * @description Obtém configurações de SEO
 * @access Private (Admin)
 */
router.get('/seo', authenticate, isAdmin, SettingsController.seo);

/**
 * @route GET /api/settings/contact
 * @description Obtém configurações de contato
 * @access Private (Admin)
 */
router.get('/contact', authenticate, isAdmin, SettingsController.contact);

/**
 * @route GET /api/settings/social
 * @description Obtém configurações de redes sociais
 * @access Private (Admin)
 */
router.get('/social', authenticate, isAdmin, SettingsController.social);

/**
 * @route PUT /api/settings
 * @description Atualiza configurações
 * @access Private (Admin)
 */
router.put('/', authenticate, isAdmin, validate(settingsSchemas.update), SettingsController.update);

/**
 * @route PUT /api/settings/seo
 * @description Atualiza configurações de SEO
 * @access Private (Admin)
 */
router.put('/seo', authenticate, isAdmin, SettingsController.updateSEO);

/**
 * @route POST /api/settings/logo
 * @description Upload de logo
 * @access Private (Admin)
 */
router.post('/logo', authenticate, isAdmin, upload.single('logo'), processLogoImage, SettingsController.uploadLogo);

/**
 * @route POST /api/settings/favicon
 * @description Upload de favicon
 * @access Private (Admin)
 */
router.post('/favicon', authenticate, isAdmin, upload.single('favicon'), processLogoImage, SettingsController.uploadFavicon);

module.exports = router;
