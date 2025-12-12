/**
 * Model de Categoria
 * 
 * @module models/Category
 * @description Operações de banco de dados para categorias de produtos
 */

const { query } = require('../config/database');
const slugify = require('slugify');

class Category {
  /**
   * Encontra uma categoria pelo ID
   * @param {number} id - ID da categoria
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const rows = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = TRUE) as product_count,
        p.name as parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE c.id = ?`,
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Encontra uma categoria pelo slug
   * @param {string} slug - Slug da categoria
   * @returns {Promise<Object|null>}
   */
  static async findBySlug(slug) {
    const rows = await query(
      `SELECT c.*, 
        (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = TRUE) as product_count,
        p.name as parent_name
       FROM categories c
       LEFT JOIN categories p ON c.parent_id = p.id
       WHERE c.slug = ?`,
      [slug]
    );
    return rows[0] || null;
  }

  /**
   * Lista todas as categorias
   * @param {Object} options - Opções de filtro
   * @returns {Promise<Array>}
   */
  static async findAll({ activeOnly = false, withProductCount = true, parentId = null }) {
    let sql = `
      SELECT c.*
      ${withProductCount ? ', (SELECT COUNT(*) FROM products WHERE category_id = c.id AND is_active = TRUE) as product_count' : ''}
      FROM categories c
      WHERE 1=1
    `;
    const params = [];

    if (activeOnly) {
      sql += ' AND c.is_active = TRUE';
    }

    if (parentId !== null) {
      sql += ' AND c.parent_id = ?';
      params.push(parentId);
    }

    sql += ' ORDER BY c.display_order ASC, c.name ASC';

    return query(sql, params);
  }

  /**
   * Lista categorias em formato de árvore
   * @param {boolean} activeOnly - Apenas ativas
   * @returns {Promise<Array>}
   */
  static async findAsTree(activeOnly = true) {
    const categories = await this.findAll({ activeOnly, withProductCount: true });
    
    // Organizar em árvore
    const tree = [];
    const map = {};

    categories.forEach(cat => {
      map[cat.id] = { ...cat, children: [] };
    });

    categories.forEach(cat => {
      if (cat.parent_id && map[cat.parent_id]) {
        map[cat.parent_id].children.push(map[cat.id]);
      } else {
        tree.push(map[cat.id]);
      }
    });

    return tree;
  }

  /**
   * Cria uma nova categoria
   * @param {Object} data - Dados da categoria
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const {
      name,
      slug,
      description = null,
      image = null,
      parent_id = null,
      display_order = 0,
      is_active = true,
      meta_title = null,
      meta_description = null
    } = data;

    // Gerar slug se não fornecido
    const finalSlug = slug || slugify(name, { lower: true, strict: true });

    const result = await query(
      `INSERT INTO categories (name, slug, description, image, parent_id, display_order, is_active, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, finalSlug, description, image, parent_id, display_order, is_active, meta_title, meta_description]
    );

    return this.findById(result.insertId);
  }

  /**
   * Atualiza uma categoria
   * @param {number} id - ID da categoria
   * @param {Object} data - Dados a atualizar
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = ['name', 'slug', 'description', 'image', 'parent_id', 'display_order', 'is_active', 'meta_title', 'meta_description'];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        fields.push(`${field} = ?`);
        params.push(data[field]);
      }
    }

    // Regenerar slug se nome mudou e slug não foi fornecido
    if (data.name && !data.slug) {
      fields.push('slug = ?');
      params.push(slugify(data.name, { lower: true, strict: true }));
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await query(`UPDATE categories SET ${fields.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  /**
   * Deleta uma categoria
   * @param {number} id - ID da categoria
   * @returns {Promise<Object>} Resultado com sucesso e mensagem
   */
  static async delete(id) {
    // Verificar se tem produtos
    const products = await query('SELECT COUNT(*) as count FROM products WHERE category_id = ?', [id]);
    if (products[0].count > 0) {
      return { 
        success: false, 
        message: `Não é possível deletar. Existem ${products[0].count} produtos nesta categoria.` 
      };
    }

    // Verificar se tem subcategorias
    const children = await query('SELECT COUNT(*) as count FROM categories WHERE parent_id = ?', [id]);
    if (children[0].count > 0) {
      return { 
        success: false, 
        message: `Não é possível deletar. Existem ${children[0].count} subcategorias.` 
      };
    }

    const result = await query('DELETE FROM categories WHERE id = ?', [id]);
    return { 
      success: result.affectedRows > 0, 
      message: result.affectedRows > 0 ? 'Categoria deletada com sucesso' : 'Categoria não encontrada' 
    };
  }

  /**
   * Reordena categorias
   * @param {Array} order - Array de { id, display_order }
   * @returns {Promise<boolean>}
   */
  static async reorder(order) {
    for (const item of order) {
      await query('UPDATE categories SET display_order = ? WHERE id = ?', [item.display_order, item.id]);
    }
    return true;
  }
}

module.exports = Category;
