/**
 * Controller de Categorias
 * 
 * @module controllers/CategoryController
 * @description Endpoints para gerenciamento de categorias
 */

const Category = require('../models/Category');

class CategoryController {
  /**
   * Lista todas as categorias
   * GET /api/categories
   */
  static async index(req, res) {
    try {
      const { active, tree } = req.query;
      
      if (tree === 'true') {
        const categories = await Category.findAsTree(active !== 'false');
        return res.json({
          success: true,
          data: categories
        });
      }

      const categories = await Category.findAll({
        activeOnly: active === 'true',
        withProductCount: true
      });

      res.json({
        success: true,
        data: categories
      });

    } catch (error) {
      console.error('Erro ao listar categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém uma categoria pelo slug
   * GET /api/categories/:slug
   */
  static async show(req, res) {
    try {
      const { slug } = req.params;
      
      // Tentar buscar por ID ou slug
      const category = isNaN(slug) 
        ? await Category.findBySlug(slug)
        : await Category.findById(parseInt(slug));

      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      res.json({
        success: true,
        data: category
      });

    } catch (error) {
      console.error('Erro ao buscar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Cria uma nova categoria
   * POST /api/categories
   */
  static async create(req, res) {
    try {
      const category = await Category.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Categoria criada com sucesso',
        data: category
      });

    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      
      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma categoria com este slug'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Atualiza uma categoria
   * PUT /api/categories/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;

      const category = await Category.findById(id);
      if (!category) {
        return res.status(404).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      const updated = await Category.update(id, req.body);

      res.json({
        success: true,
        message: 'Categoria atualizada com sucesso',
        data: updated
      });

    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Já existe uma categoria com este slug'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Deleta uma categoria
   * DELETE /api/categories/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const result = await Category.delete(id);

      if (!result.success) {
        return res.status(400).json({
          success: false,
          message: result.message
        });
      }

      res.json({
        success: true,
        message: result.message
      });

    } catch (error) {
      console.error('Erro ao deletar categoria:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Reordena categorias
   * PUT /api/categories/reorder
   */
  static async reorder(req, res) {
    try {
      const { order } = req.body;

      if (!Array.isArray(order)) {
        return res.status(400).json({
          success: false,
          message: 'Formato inválido. Envie um array de { id, display_order }'
        });
      }

      await Category.reorder(order);

      res.json({
        success: true,
        message: 'Categorias reordenadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao reordenar categorias:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = CategoryController;
