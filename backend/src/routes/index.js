/**
 * Índice de Rotas
 * 
 * @module routes
 * @description Centraliza todas as rotas da API
 */

const express = require('express');
const router = express.Router();

// Importar rotas
const authRoutes = require('./auth');
const categoryRoutes = require('./categories');
const productRoutes = require('./products');
const bannerRoutes = require('./banners');
const quotationRoutes = require('./quotations');
const settingsRoutes = require('./settings');

// Registrar rotas
router.use('/auth', authRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/banners', bannerRoutes);
router.use('/quotations', quotationRoutes);
router.use('/settings', settingsRoutes);

// Rota de health check
router.get('/health', (req, res) => {
  res.json({
    success: true,
    message: 'API Ipiranga Fitness funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rota 404 para API
router.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Endpoint não encontrado'
  });
});

module.exports = router;
