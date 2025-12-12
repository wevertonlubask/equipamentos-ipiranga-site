/**
 * Índice de Models
 * 
 * @module models
 * @description Exporta todos os models do sistema
 */

const User = require('./User');
const Category = require('./Category');
const Product = require('./Product');
const Banner = require('./Banner');
const Quotation = require('./Quotation');
const Settings = require('./Settings');

module.exports = {
  User,
  Category,
  Product,
  Banner,
  Quotation,
  Settings
};
