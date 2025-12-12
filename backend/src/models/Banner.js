/**
 * Model de Banner
 * 
 * @module models/Banner
 * @description Operações de banco de dados para banners do carrossel
 */

const { query } = require('../config/database');

class Banner {
  /**
   * Encontra um banner pelo ID
   * @param {number} id - ID do banner
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const rows = await query('SELECT * FROM banners WHERE id = ?', [id]);
    return rows[0] || null;
  }

  /**
   * Lista todos os banners
   * @param {Object} options - Opções de filtro
   * @returns {Promise<Array>}
   */
  static async findAll({ activeOnly = false, includeScheduled = false }) {
    let sql = 'SELECT * FROM banners WHERE 1=1';
    const params = [];

    if (activeOnly) {
      sql += ' AND is_active = TRUE';
      
      if (!includeScheduled) {
        sql += ' AND (start_date IS NULL OR start_date <= NOW())';
        sql += ' AND (end_date IS NULL OR end_date >= NOW())';
      }
    }

    sql += ' ORDER BY display_order ASC';

    return query(sql, params);
  }

  /**
   * Lista banners ativos para exibição no site
   * @returns {Promise<Array>}
   */
  static async findActive() {
    return query(`
      SELECT * FROM banners 
      WHERE is_active = TRUE 
        AND (start_date IS NULL OR start_date <= NOW())
        AND (end_date IS NULL OR end_date >= NOW())
      ORDER BY display_order ASC
    `);
  }

  /**
   * Cria um novo banner
   * @param {Object} data - Dados do banner
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const {
      title = null,
      subtitle = null,
      image_desktop,
      image_mobile = null,
      link_url = null,
      link_target = '_self',
      button_text = null,
      display_order = 0,
      is_active = true,
      start_date = null,
      end_date = null
    } = data;

    const result = await query(
      `INSERT INTO banners 
       (title, subtitle, image_desktop, image_mobile, link_url, link_target, button_text, display_order, is_active, start_date, end_date)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [title, subtitle, image_desktop, image_mobile, link_url, link_target, button_text, display_order, is_active, start_date, end_date]
    );

    return this.findById(result.insertId);
  }

  /**
   * Atualiza um banner
   * @param {number} id - ID do banner
   * @param {Object} data - Dados a atualizar
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = [
      'title', 'subtitle', 'image_desktop', 'image_mobile',
      'link_url', 'link_target', 'button_text', 'display_order',
      'is_active', 'start_date', 'end_date'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await query(`UPDATE banners SET ${fields.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  /**
   * Deleta um banner
   * @param {number} id - ID do banner
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    const result = await query('DELETE FROM banners WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Reordena banners
   * @param {Array} order - Array de { id, display_order }
   * @returns {Promise<boolean>}
   */
  static async reorder(order) {
    for (const item of order) {
      await query('UPDATE banners SET display_order = ? WHERE id = ?', [item.display_order, item.id]);
    }
    return true;
  }
}

module.exports = Banner;
