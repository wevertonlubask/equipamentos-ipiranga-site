/**
 * Rotas de Cotações
 * 
 * @module routes/quotations
 * @description Endpoints para gerenciamento de cotações
 */

const express = require('express');
const router = express.Router();
const QuotationController = require('../controllers/QuotationController');
const { authenticate, canEdit, isAdmin } = require('../middleware/auth');
const { validate, quotationSchemas } = require('../validators');

// =============================================
// ROTAS PÚBLICAS
// =============================================

/**
 * @route POST /api/quotations
 * @description Cria uma nova solicitação de cotação
 * @access Public
 */
router.post('/', validate(quotationSchemas.create), QuotationController.create);

// =============================================
// ROTAS ADMIN (requerem autenticação)
// =============================================

/**
 * @route GET /api/quotations
 * @description Lista cotações com filtros
 * @access Private (Editor+)
 */
router.get('/', authenticate, canEdit, validate(quotationSchemas.query, 'query'), QuotationController.index);

/**
 * @route GET /api/quotations/stats
 * @description Obtém estatísticas de cotações
 * @access Private (Editor+)
 */
router.get('/stats', authenticate, canEdit, QuotationController.stats);

/**
 * @route GET /api/quotations/export
 * @description Exporta cotações para CSV
 * @access Private (Editor+)
 */
router.get('/export', authenticate, canEdit, QuotationController.export);

/**
 * @route GET /api/quotations/:id
 * @description Obtém uma cotação pelo ID
 * @access Private (Editor+)
 */
router.get('/:id', authenticate, canEdit, QuotationController.show);

/**
 * @route PUT /api/quotations/:id/status
 * @description Atualiza status da cotação
 * @access Private (Editor+)
 */
router.put('/:id/status', authenticate, canEdit, validate(quotationSchemas.updateStatus), QuotationController.updateStatus);

/**
 * @route PUT /api/quotations/:id/notes
 * @description Atualiza notas do admin
 * @access Private (Editor+)
 */
router.put('/:id/notes', authenticate, canEdit, QuotationController.updateNotes);

/**
 * @route DELETE /api/quotations/:id
 * @description Deleta uma cotação
 * @access Private (Admin)
 */
router.delete('/:id', authenticate, isAdmin, QuotationController.delete);

module.exports = router;
