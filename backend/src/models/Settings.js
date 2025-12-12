/**
 * Model de Configurações do Site
 * 
 * @module models/Settings
 * @description Operações de banco de dados para configurações do site
 */

const { query } = require('../config/database');

class Settings {
  /**
   * Obtém uma configuração pelo key
   * @param {string} key - Chave da configuração
   * @returns {Promise<string|null>}
   */
  static async get(key) {
    const rows = await query(
      'SELECT setting_value FROM site_settings WHERE setting_key = ?',
      [key]
    );
    return rows[0]?.setting_value || null;
  }

  /**
   * Obtém múltiplas configurações
   * @param {Array} keys - Array de chaves
   * @returns {Promise<Object>}
   */
  static async getMultiple(keys) {
    if (!keys || keys.length === 0) return {};

    const placeholders = keys.map(() => '?').join(',');
    const rows = await query(
      `SELECT setting_key, setting_value FROM site_settings WHERE setting_key IN (${placeholders})`,
      keys
    );

    const result = {};
    rows.forEach(row => {
      result[row.setting_key] = row.setting_value;
    });

    return result;
  }

  /**
   * Obtém todas as configurações de um grupo
   * @param {string} group - Nome do grupo
   * @returns {Promise<Object>}
   */
  static async getByGroup(group) {
    const rows = await query(
      'SELECT setting_key, setting_value, setting_type, description FROM site_settings WHERE setting_group = ?',
      [group]
    );

    const result = {};
    rows.forEach(row => {
      result[row.setting_key] = {
        value: row.setting_value,
        type: row.setting_type,
        description: row.description
      };
    });

    return result;
  }

  /**
   * Obtém todas as configurações organizadas por grupo
   * @returns {Promise<Object>}
   */
  static async getAll() {
    const rows = await query(
      'SELECT setting_key, setting_value, setting_type, setting_group, description FROM site_settings ORDER BY setting_group, setting_key'
    );

    const result = {};
    rows.forEach(row => {
      if (!result[row.setting_group]) {
        result[row.setting_group] = {};
      }
      result[row.setting_group][row.setting_key] = {
        value: row.setting_value,
        type: row.setting_type,
        description: row.description
      };
    });

    return result;
  }

  /**
   * Obtém configurações públicas (para exibir no site)
   * @returns {Promise<Object>}
   */
  static async getPublic() {
    // Excluir configurações sensíveis como scripts e chaves de API
    const excludeKeys = ['header_scripts', 'footer_scripts', 'google_analytics', 'google_tag_manager'];
    const placeholders = excludeKeys.map(() => '?').join(',');
    
    const rows = await query(
      `SELECT setting_key, setting_value FROM site_settings WHERE setting_key NOT IN (${placeholders})`,
      excludeKeys
    );

    const result = {};
    rows.forEach(row => {
      result[row.setting_key] = row.setting_value;
    });

    return result;
  }

  /**
   * Define uma configuração
   * @param {string} key - Chave da configuração
   * @param {string} value - Valor
   * @returns {Promise<boolean>}
   */
  static async set(key, value) {
    await query(
      `INSERT INTO site_settings (setting_key, setting_value) VALUES (?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?`,
      [key, value, value]
    );
    return true;
  }

  /**
   * Define múltiplas configurações
   * @param {Object} settings - Objeto { key: value }
   * @returns {Promise<boolean>}
   */
  static async setMultiple(settings) {
    for (const [key, value] of Object.entries(settings)) {
      await this.set(key, value);
    }
    return true;
  }

  /**
   * Cria uma nova configuração
   * @param {Object} data - Dados da configuração
   * @returns {Promise<boolean>}
   */
  static async create(data) {
    const {
      setting_key,
      setting_value = null,
      setting_type = 'text',
      setting_group = 'general',
      description = null
    } = data;

    await query(
      `INSERT INTO site_settings (setting_key, setting_value, setting_type, setting_group, description)
       VALUES (?, ?, ?, ?, ?)
       ON DUPLICATE KEY UPDATE setting_value = ?, setting_type = ?, setting_group = ?, description = ?`,
      [setting_key, setting_value, setting_type, setting_group, description, setting_value, setting_type, setting_group, description]
    );

    return true;
  }

  /**
   * Deleta uma configuração
   * @param {string} key - Chave da configuração
   * @returns {Promise<boolean>}
   */
  static async delete(key) {
    const result = await query('DELETE FROM site_settings WHERE setting_key = ?', [key]);
    return result.affectedRows > 0;
  }

  /**
   * Obtém configurações de SEO
   * @returns {Promise<Object>}
   */
  static async getSEO() {
    return this.getByGroup('seo');
  }

  /**
   * Obtém configurações de contato
   * @returns {Promise<Object>}
   */
  static async getContact() {
    return this.getByGroup('contact');
  }

  /**
   * Obtém configurações de redes sociais
   * @returns {Promise<Object>}
   */
  static async getSocial() {
    return this.getByGroup('social');
  }
}

module.exports = Settings;
