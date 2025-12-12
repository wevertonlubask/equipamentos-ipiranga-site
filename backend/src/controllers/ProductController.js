/**
 * Controller de Produtos
 * 
 * @module controllers/ProductController
 * @description Endpoints para gerenciamento de produtos/equipamentos
 */

const Product = require('../models/Product');
const { deleteImage } = require('../middleware/upload');

class ProductController {
  /**
   * Lista produtos com filtros e paginação
   * GET /api/products
   */
  static async index(req, res) {
    try {
      const {
        page,
        limit,
        category,
        featured,
        active,
        search,
        orderBy,
        order
      } = req.query;

      const result = await Product.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        categorySlug: category,
        featured: featured === 'true' ? true : featured === 'false' ? false : null,
        active: active === 'true' ? true : active === 'false' ? false : null,
        search,
        orderBy,
        order
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Erro ao listar produtos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém produtos em destaque
   * GET /api/products/featured
   */
  static async featured(req, res) {
    try {
      const { limit } = req.query;
      const products = await Product.findFeatured(parseInt(limit) || 8);

      res.json({
        success: true,
        data: products
      });

    } catch (error) {
      console.error('Erro ao buscar produtos em destaque:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém um produto pelo slug ou ID
   * GET /api/products/:slug
   */
  static async show(req, res) {
    try {
      const { slug } = req.params;

      // Tentar buscar por ID ou slug
      const product = isNaN(slug)
        ? await Product.findBySlug(slug)
        : await Product.findById(parseInt(slug));

      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Buscar produtos relacionados
      const related = await Product.findRelated(product.id, product.category_id, 4);

      res.json({
        success: true,
        data: {
          ...product,
          related
        }
      });

    } catch (error) {
      console.error('Erro ao buscar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Cria um novo produto
   * POST /api/products
   */
  static async create(req, res) {
    try {
      const product = await Product.create(req.body);

      res.status(201).json({
        success: true,
        message: 'Produto criado com sucesso',
        data: product
      });

    } catch (error) {
      console.error('Erro ao criar produto:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Já existe um produto com este slug ou SKU'
        });
      }

      if (error.code === 'ER_NO_REFERENCED_ROW_2') {
        return res.status(400).json({
          success: false,
          message: 'Categoria não encontrada'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Atualiza um produto
   * PUT /api/products/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      const updated = await Product.update(id, req.body);

      res.json({
        success: true,
        message: 'Produto atualizado com sucesso',
        data: updated
      });

    } catch (error) {
      console.error('Erro ao atualizar produto:', error);

      if (error.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({
          success: false,
          message: 'Já existe um produto com este slug ou SKU'
        });
      }

      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Deleta um produto
   * DELETE /api/products/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Deletar imagens
      if (product.featured_image) {
        await deleteImage(product.featured_image);
      }
      for (const img of product.images) {
        await deleteImage(img.image_url);
      }

      const result = await Product.delete(id);

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
      console.error('Erro ao deletar produto:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Adiciona imagens a um produto
   * POST /api/products/:id/images
   */
  static async addImages(req, res) {
    try {
      const { id } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Usar imagem processada do middleware
      if (req.processedImage) {
        const images = await Product.addImages(id, [{
          image_url: req.processedImage.url,
          alt_text: req.body.alt_text || product.name,
          is_primary: req.body.is_primary === 'true'
        }]);

        // Se é primary, atualizar featured_image do produto
        if (req.body.is_primary === 'true') {
          await Product.update(id, { featured_image: req.processedImage.url });
        }

        return res.status(201).json({
          success: true,
          message: 'Imagem adicionada com sucesso',
          data: images[0]
        });
      }

      res.status(400).json({
        success: false,
        message: 'Nenhuma imagem enviada'
      });

    } catch (error) {
      console.error('Erro ao adicionar imagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Remove uma imagem de um produto
   * DELETE /api/products/:id/images/:imageId
   */
  static async removeImage(req, res) {
    try {
      const { id, imageId } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      // Encontrar imagem
      const image = product.images.find(img => img.id === parseInt(imageId));
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Imagem não encontrada'
        });
      }

      // Deletar arquivo
      await deleteImage(image.image_url);

      // Remover do banco
      await Product.removeImage(imageId);

      // Se era a featured_image, limpar
      if (product.featured_image === image.image_url) {
        await Product.update(id, { featured_image: null });
      }

      res.json({
        success: true,
        message: 'Imagem removida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao remover imagem:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Define imagem principal
   * PUT /api/products/:id/images/:imageId/primary
   */
  static async setPrimaryImage(req, res) {
    try {
      const { id, imageId } = req.params;

      const product = await Product.findById(id);
      if (!product) {
        return res.status(404).json({
          success: false,
          message: 'Produto não encontrado'
        });
      }

      const image = product.images.find(img => img.id === parseInt(imageId));
      if (!image) {
        return res.status(404).json({
          success: false,
          message: 'Imagem não encontrada'
        });
      }

      await Product.setPrimaryImage(id, imageId);
      await Product.update(id, { featured_image: image.image_url });

      res.json({
        success: true,
        message: 'Imagem principal definida com sucesso'
      });

    } catch (error) {
      console.error('Erro ao definir imagem principal:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Busca produtos por IDs (para carrinho)
   * POST /api/products/by-ids
   */
  static async findByIds(req, res) {
    try {
      const { ids } = req.body;

      if (!Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({
          success: false,
          message: 'Envie um array de IDs'
        });
      }

      const products = await Product.findByIds(ids);

      res.json({
        success: true,
        data: products
      });

    } catch (error) {
      console.error('Erro ao buscar produtos por IDs:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = ProductController;
