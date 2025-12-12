/**
 * Model de Produto
 * 
 * @module models/Product
 * @description Operações de banco de dados para produtos/equipamentos
 */

const { query, beginTransaction } = require('../config/database');
const slugify = require('slugify');

class Product {
  /**
   * Encontra um produto pelo ID
   * @param {number} id - ID do produto
   * @returns {Promise<Object|null>}
   */
  static async findById(id) {
    const rows = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id = ?`,
      [id]
    );

    if (!rows[0]) return null;

    // Buscar imagens
    const images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [id]
    );

    return {
      ...rows[0],
      specifications: rows[0].specifications ? JSON.parse(rows[0].specifications) : {},
      images
    };
  }

  /**
   * Encontra um produto pelo slug
   * @param {string} slug - Slug do produto
   * @returns {Promise<Object|null>}
   */
  static async findBySlug(slug) {
    const rows = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.slug = ?`,
      [slug]
    );

    if (!rows[0]) return null;

    // Incrementar visualizações
    await query('UPDATE products SET views = views + 1 WHERE slug = ?', [slug]);

    // Buscar imagens
    const images = await query(
      'SELECT * FROM product_images WHERE product_id = ? ORDER BY display_order ASC',
      [rows[0].id]
    );

    return {
      ...rows[0],
      specifications: rows[0].specifications ? JSON.parse(rows[0].specifications) : {},
      images
    };
  }

  /**
   * Lista produtos com filtros e paginação
   * @param {Object} options - Opções de filtro
   * @returns {Promise<Object>}
   */
  static async findAll({
    page = 1,
    limit = 20,
    categoryId = null,
    categorySlug = null,
    featured = null,
    active = null,
    search = null,
    orderBy = 'display_order',
    order = 'ASC'
  }) {
    let sql = `
      SELECT p.*, c.name as category_name, c.slug as category_slug
      FROM products p
      LEFT JOIN categories c ON p.category_id = c.id
      WHERE 1=1
    `;
    const params = [];

    if (categoryId) {
      sql += ' AND p.category_id = ?';
      params.push(categoryId);
    }

    if (categorySlug) {
      sql += ' AND c.slug = ?';
      params.push(categorySlug);
    }

    if (featured !== null) {
      sql += ' AND p.is_featured = ?';
      params.push(featured);
    }

    if (active !== null) {
      sql += ' AND p.is_active = ?';
      params.push(active);
    }

    if (search) {
      sql += ' AND (p.name LIKE ? OR p.short_description LIKE ? OR p.sku LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm);
    }

    // Contar total
    const countSql = sql.replace(/SELECT p\.\*, c\.name as category_name, c\.slug as category_slug/, 'SELECT COUNT(*) as total');
    const countResult = await query(countSql, params);
    const total = countResult[0].total;

    // Ordenação
    const allowedOrderBy = ['display_order', 'name', 'created_at', 'views'];
    const finalOrderBy = allowedOrderBy.includes(orderBy) ? orderBy : 'display_order';
    const finalOrder = order.toUpperCase() === 'DESC' ? 'DESC' : 'ASC';
    
    sql += ` ORDER BY p.${finalOrderBy} ${finalOrder}`;

    // Paginação
    sql += ' LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const rows = await query(sql, params);

    // Processar specifications
    const products = rows.map(row => ({
      ...row,
      specifications: row.specifications ? JSON.parse(row.specifications) : {}
    }));

    return {
      products,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Lista produtos em destaque
   * @param {number} limit - Quantidade máxima
   * @returns {Promise<Array>}
   */
  static async findFeatured(limit = 8) {
    const rows = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.is_featured = TRUE AND p.is_active = TRUE
       ORDER BY p.display_order ASC
       LIMIT ?`,
      [limit]
    );

    return rows.map(row => ({
      ...row,
      specifications: row.specifications ? JSON.parse(row.specifications) : {}
    }));
  }

  /**
   * Busca produtos relacionados
   * @param {number} productId - ID do produto atual
   * @param {number} categoryId - ID da categoria
   * @param {number} limit - Quantidade máxima
   * @returns {Promise<Array>}
   */
  static async findRelated(productId, categoryId, limit = 4) {
    const rows = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.category_id = ? AND p.id != ? AND p.is_active = TRUE
       ORDER BY RAND()
       LIMIT ?`,
      [categoryId, productId, limit]
    );

    return rows.map(row => ({
      ...row,
      specifications: row.specifications ? JSON.parse(row.specifications) : {}
    }));
  }

  /**
   * Cria um novo produto
   * @param {Object} data - Dados do produto
   * @returns {Promise<Object>}
   */
  static async create(data) {
    const {
      name,
      slug,
      short_description = null,
      description = null,
      specifications = {},
      category_id,
      sku = null,
      featured_image = null,
      is_featured = false,
      is_active = true,
      display_order = 0,
      meta_title = null,
      meta_description = null
    } = data;

    const finalSlug = slug || slugify(name, { lower: true, strict: true });
    const specsJson = typeof specifications === 'string' ? specifications : JSON.stringify(specifications);

    const result = await query(
      `INSERT INTO products 
       (name, slug, short_description, description, specifications, category_id, sku, featured_image, is_featured, is_active, display_order, meta_title, meta_description)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, finalSlug, short_description, description, specsJson, category_id, sku, featured_image, is_featured, is_active, display_order, meta_title, meta_description]
    );

    return this.findById(result.insertId);
  }

  /**
   * Atualiza um produto
   * @param {number} id - ID do produto
   * @param {Object} data - Dados a atualizar
   * @returns {Promise<Object>}
   */
  static async update(id, data) {
    const fields = [];
    const params = [];

    const allowedFields = [
      'name', 'slug', 'short_description', 'description', 'specifications',
      'category_id', 'sku', 'featured_image', 'is_featured', 'is_active',
      'display_order', 'meta_title', 'meta_description'
    ];

    for (const field of allowedFields) {
      if (data[field] !== undefined) {
        let value = data[field];
        
        // Converter specifications para JSON se necessário
        if (field === 'specifications' && typeof value !== 'string') {
          value = JSON.stringify(value);
        }
        
        fields.push(`${field} = ?`);
        params.push(value);
      }
    }

    // Regenerar slug se nome mudou e slug não foi fornecido
    if (data.name && !data.slug) {
      fields.push('slug = ?');
      params.push(slugify(data.name, { lower: true, strict: true }));
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await query(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  /**
   * Deleta um produto
   * @param {number} id - ID do produto
   * @returns {Promise<Object>}
   */
  static async delete(id) {
    // Verificar se está em alguma cotação
    const quotations = await query(
      'SELECT COUNT(*) as count FROM quotation_items WHERE product_id = ?',
      [id]
    );

    if (quotations[0].count > 0) {
      return {
        success: false,
        message: `Este produto está em ${quotations[0].count} cotação(ões). Considere desativá-lo ao invés de deletar.`
      };
    }

    // Deletar imagens primeiro (cascade deve fazer isso, mas por segurança)
    await query('DELETE FROM product_images WHERE product_id = ?', [id]);

    const result = await query('DELETE FROM products WHERE id = ?', [id]);
    return {
      success: result.affectedRows > 0,
      message: result.affectedRows > 0 ? 'Produto deletado com sucesso' : 'Produto não encontrado'
    };
  }

  /**
   * Adiciona imagens a um produto
   * @param {number} productId - ID do produto
   * @param {Array} images - Array de imagens { image_url, alt_text, is_primary }
   * @returns {Promise<Array>}
   */
  static async addImages(productId, images) {
    const results = [];
    
    for (let i = 0; i < images.length; i++) {
      const img = images[i];
      const result = await query(
        `INSERT INTO product_images (product_id, image_url, alt_text, display_order, is_primary)
         VALUES (?, ?, ?, ?, ?)`,
        [productId, img.image_url, img.alt_text || null, i, img.is_primary || false]
      );
      results.push({ id: result.insertId, ...img });
    }

    return results;
  }

  /**
   * Remove uma imagem
   * @param {number} imageId - ID da imagem
   * @returns {Promise<boolean>}
   */
  static async removeImage(imageId) {
    const result = await query('DELETE FROM product_images WHERE id = ?', [imageId]);
    return result.affectedRows > 0;
  }

  /**
   * Define imagem principal
   * @param {number} productId - ID do produto
   * @param {number} imageId - ID da imagem
   * @returns {Promise<boolean>}
   */
  static async setPrimaryImage(productId, imageId) {
    // Remover primary de todas
    await query('UPDATE product_images SET is_primary = FALSE WHERE product_id = ?', [productId]);
    // Definir nova primary
    await query('UPDATE product_images SET is_primary = TRUE WHERE id = ? AND product_id = ?', [imageId, productId]);
    return true;
  }

  /**
   * Busca produtos por IDs
   * @param {Array} ids - Array de IDs
   * @returns {Promise<Array>}
   */
  static async findByIds(ids) {
    if (!ids || ids.length === 0) return [];

    const placeholders = ids.map(() => '?').join(',');
    const rows = await query(
      `SELECT p.*, c.name as category_name, c.slug as category_slug
       FROM products p
       LEFT JOIN categories c ON p.category_id = c.id
       WHERE p.id IN (${placeholders})`,
      ids
    );

    return rows.map(row => ({
      ...row,
      specifications: row.specifications ? JSON.parse(row.specifications) : {}
    }));
  }
}

module.exports = Product;
