/**
 * Model de Cotação
 * 
 * @module models/Quotation
 * @description Operações de banco de dados para solicitações de cotação
 */

const { query, beginTransaction } = require('../config/database');

class Quotation {
  /**
   * Encontra uma cotação pelo ID
   * @param {number} id - ID da cotação
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const rows = await query('SELECT * FROM quotation_requests WHERE id = ?', [id]);
    
    if (!rows[0]) return null;

    // Buscar itens da cotação
    const items = await query(
      `SELECT qi.*, p.slug as product_slug, p.featured_image
       FROM quotation_items qi
       LEFT JOIN products p ON qi.product_id = p.id
       WHERE qi.quotation_id = ?`,
      [id]
    );

    return {
      ...rows[0],
      items
    };
  }

  /**
   * Lista cotações com filtros e paginação
   * @param {Object} options - Opções de filtro
   * @returns {Promise<Object>}
   */
  static async findAll({
    page = 1,
    limit = 20,
    status = null,
    search = null,
    dateFrom = null,
    dateTo = null,
    orderBy = 'created_at',
    order = 'DESC'
  }) {
    let sql = 'SELECT * FROM quotation_requests WHERE 1=1';
    const params = [];

    if (status) {
      sql += ' AND status = ?';
      params.push(status);
    }

    if (search) {
      sql += ' AND (first_name LIKE ? OR last_name LIKE ? OR email LIKE ? OR company_name LIKE ? OR phone LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm, searchTerm);
    }

    if (dateFrom) {
      sql += ' AND created_at >= ?';
      params.push(dateFrom);
    }

    if (dateTo) {
      sql += ' AND created_at <= ?';
      params.push(dateTo);
    }

    // Contar total
    const countResult = await query(sql.replace('SELECT *', 'SELECT COUNT(*) as total'), params);
    const total = countResult[0].total;

    // Ordenação
    const allowedOrderBy = ['created_at', 'status', 'first_name'];
    const finalOrderBy = allowedOrderBy.includes(orderBy) ? orderBy : 'created_at';
    const finalOrder = order.toUpperCase() === 'ASC' ? 'ASC' : 'DESC';

    sql += ` ORDER BY ${finalOrderBy} ${finalOrder}`;

    // Paginação
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const rows = await query(sql, params);

    // Buscar contagem de itens para cada cotação
    const quotationsWithCount = await Promise.all(
      rows.map(async (row) => {
        const itemCount = await query(
          'SELECT SUM(quantity) as total_items FROM quotation_items WHERE quotation_id = ?',
          [row.id]
        );
        return {
          ...row,
          total_items: itemCount[0].total_items || 0
        };
      })
    );

    return {
      quotations: quotationsWithCount,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Estatísticas de cotações
   * @returns {Promise<Object>}
   */
  static async getStats() {
    const stats = await query(`
      SELECT 
        COUNT(*) as total,
        SUM(CASE WHEN status = 'pending' THEN 1 ELSE 0 END) as pending,
        SUM(CASE WHEN status = 'contacted' THEN 1 ELSE 0 END) as contacted,
        SUM(CASE WHEN status = 'quoted' THEN 1 ELSE 0 END) as quoted,
        SUM(CASE WHEN status = 'converted' THEN 1 ELSE 0 END) as converted,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) as cancelled,
        SUM(CASE WHEN DATE(created_at) = CURDATE() THEN 1 ELSE 0 END) as today,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY) THEN 1 ELSE 0 END) as last_7_days,
        SUM(CASE WHEN created_at >= DATE_SUB(NOW(), INTERVAL 30 DAY) THEN 1 ELSE 0 END) as last_30_days
      FROM quotation_requests
    `);

    return stats[0];
  }

  /**
   * Cria uma nova cotação
   * @param {Object} data - Dados da cotação
   * @param {Array} items - Itens da cotação
   * @returns {Promise<Object>}
   */
  static async create(data, items) {
    const connection = await beginTransaction();

    try {
      const {
        first_name,
        last_name,
        email,
        phone,
        company_name = null,
        cnpj = null,
        installation_type,
        installation_type_other = null,
        city = null,
        state = null,
        message = null,
        ip_address = null,
        user_agent = null
      } = data;

      // Inserir cotação
      const [result] = await connection.execute(
        `INSERT INTO quotation_requests 
         (first_name, last_name, email, phone, company_name, cnpj, installation_type, installation_type_other, city, state, message, ip_address, user_agent)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [first_name, last_name, email, phone, company_name, cnpj, installation_type, installation_type_other, city, state, message, ip_address, user_agent]
      );

      const quotationId = result.insertId;

      // Inserir itens
      for (const item of items) {
        await connection.execute(
          `INSERT INTO quotation_items (quotation_id, product_id, product_name, quantity, notes)
           VALUES (?, ?, ?, ?, ?)`,
          [quotationId, item.product_id, item.product_name, item.quantity, item.notes || null]
        );
      }

      await connection.commit();
      connection.release();

      return this.findById(quotationId);

    } catch (error) {
      await connection.rollback();
      connection.release();
      throw error;
    }
  }

  /**
   * Atualiza status da cotação
   * @param {number} id - ID da cotação
   * @param {string} status - Novo status
   * @param {string} adminNotes - Notas do admin
   * @returns {Promise<Object>}
   */
  static async updateStatus(id, status, adminNotes = null) {
    let sql = 'UPDATE quotation_requests SET status = ?';
    const params = [status];

    if (adminNotes !== null) {
      sql += ', admin_notes = ?';
      params.push(adminNotes);
    }

    sql += ' WHERE id = ?';
    params.push(id);

    await query(sql, params);
    return this.findById(id);
  }

  /**
   * Atualiza notas do admin
   * @param {number} id - ID da cotação
   * @param {string} notes - Notas
   * @returns {Promise<Object>}
   */
  static async updateNotes(id, notes) {
    await query('UPDATE quotation_requests SET admin_notes = ? WHERE id = ?', [notes, id]);
    return this.findById(id);
  }

  /**
   * Deleta uma cotação
   * @param {number} id - ID da cotação
   * @returns {Promise<boolean>}
   */
  static async delete(id) {
    // Items são deletados em cascata
    const result = await query('DELETE FROM quotation_requests WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }

  /**
   * Exporta cotações para CSV
   * @param {Object} filters - Filtros
   * @returns {Promise<Array>}
   */
  static async export(filters = {}) {
    let sql = `
      SELECT 
        qr.id,
        qr.first_name,
        qr.last_name,
        qr.email,
        qr.phone,
        qr.company_name,
        qr.cnpj,
        qr.installation_type,
        qr.city,
        qr.state,
        qr.status,
        qr.created_at,
        GROUP_CONCAT(CONCAT(qi.product_name, ' (', qi.quantity, ')') SEPARATOR '; ') as products
      FROM quotation_requests qr
      LEFT JOIN quotation_items qi ON qr.id = qi.quotation_id
      WHERE 1=1
    `;
    const params = [];

    if (filters.status) {
      sql += ' AND qr.status = ?';
      params.push(filters.status);
    }

    if (filters.dateFrom) {
      sql += ' AND qr.created_at >= ?';
      params.push(filters.dateFrom);
    }

    if (filters.dateTo) {
      sql += ' AND qr.created_at <= ?';
      params.push(filters.dateTo);
    }

    sql += ' GROUP BY qr.id ORDER BY qr.created_at DESC';

    return query(sql, params);
  }
}

module.exports = Quotation;
