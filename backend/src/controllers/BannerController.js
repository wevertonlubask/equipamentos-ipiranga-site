/**
 * Controller de Banners
 * 
 * @module controllers/BannerController
 * @description Endpoints para gerenciamento de banners do carrossel
 */

const Banner = require('../models/Banner');
const { deleteImage } = require('../middleware/upload');

class BannerController {
  /**
   * Lista todos os banners
   * GET /api/banners
   */
  static async index(req, res) {
    try {
      const { active } = req.query;
      
      const banners = active === 'true' 
        ? await Banner.findActive()
        : await Banner.findAll({ activeOnly: false });

      res.json({
        success: true,
        data: banners
      });

    } catch (error) {
      console.error('Erro ao listar banners:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém banners ativos para exibição no site
   * GET /api/banners/active
   */
  static async active(req, res) {
    try {
      const banners = await Banner.findActive();

      res.json({
        success: true,
        data: banners
      });

    } catch (error) {
      console.error('Erro ao buscar banners ativos:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém um banner pelo ID
   * GET /api/banners/:id
   */
  static async show(req, res) {
    try {
      const { id } = req.params;
      const banner = await Banner.findById(id);

      if (!banner) {
        return res.status(404).json({
          success: false,
          message: 'Banner não encontrado'
        });
      }

      res.json({
        success: true,
        data: banner
      });

    } catch (error) {
      console.error('Erro ao buscar banner:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Cria um novo banner
   * POST /api/banners
   */
  static async create(req, res) {
    try {
      const data = { ...req.body };
      
      // Converter is_active de string para boolean
      if (typeof data.is_active === 'string') {
        data.is_active = data.is_active === 'true';
      }

      // Usar imagens processadas do middleware
      if (req.processedImages?.desktop) {
        data.image_desktop = req.processedImages.desktop.url;
      }
      if (req.processedImages?.mobile) {
        data.image_mobile = req.processedImages.mobile.url;
      }

      if (!data.image_desktop) {
        return res.status(400).json({
          success: false,
          message: 'Imagem desktop é obrigatória'
        });
      }

      const banner = await Banner.create(data);

      res.status(201).json({
        success: true,
        message: 'Banner criado com sucesso',
        data: banner
      });

    } catch (error) {
      console.error('Erro ao criar banner:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Atualiza um banner
   * PUT /api/banners/:id
   */
  static async update(req, res) {
    try {
      const { id } = req.params;
      const data = { ...req.body };
      
      // Converter is_active de string para boolean
      if (typeof data.is_active === 'string') {
        data.is_active = data.is_active === 'true';
      }

      const banner = await Banner.findById(id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: 'Banner não encontrado'
        });
      }

      // Usar imagens processadas do middleware
      if (req.processedImages?.desktop) {
        // Deletar imagem antiga
        if (banner.image_desktop) {
          await deleteImage(banner.image_desktop);
        }
        data.image_desktop = req.processedImages.desktop.url;
      }
      if (req.processedImages?.mobile) {
        if (banner.image_mobile) {
          await deleteImage(banner.image_mobile);
        }
        data.image_mobile = req.processedImages.mobile.url;
      }

      const updated = await Banner.update(id, data);

      res.json({
        success: true,
        message: 'Banner atualizado com sucesso',
        data: updated
      });

    } catch (error) {
      console.error('Erro ao atualizar banner:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Deleta um banner
   * DELETE /api/banners/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const banner = await Banner.findById(id);
      if (!banner) {
        return res.status(404).json({
          success: false,
          message: 'Banner não encontrado'
        });
      }

      // Deletar imagens
      if (banner.image_desktop) {
        await deleteImage(banner.image_desktop);
      }
      if (banner.image_mobile) {
        await deleteImage(banner.image_mobile);
      }

      await Banner.delete(id);

      res.json({
        success: true,
        message: 'Banner deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar banner:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Reordena banners
   * PUT /api/banners/reorder
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

      await Banner.reorder(order);

      res.json({
        success: true,
        message: 'Banners reordenados com sucesso'
      });

    } catch (error) {
      console.error('Erro ao reordenar banners:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = BannerController;
