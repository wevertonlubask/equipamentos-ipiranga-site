/**
 * Controller de Configurações
 * 
 * @module controllers/SettingsController
 * @description Endpoints para gerenciamento de configurações do site
 */

const Settings = require('../models/Settings');
const { deleteImage } = require('../middleware/upload');

class SettingsController {
  /**
   * Obtém todas as configurações (admin)
   * GET /api/settings
   */
  static async index(req, res) {
    try {
      const settings = await Settings.getAll();

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('Erro ao listar configurações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém configurações públicas (para o site)
   * GET /api/settings/public
   */
  static async public(req, res) {
    try {
      const settings = await Settings.getPublic();

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('Erro ao buscar configurações públicas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém configurações por grupo
   * GET /api/settings/group/:group
   */
  static async byGroup(req, res) {
    try {
      const { group } = req.params;
      const settings = await Settings.getByGroup(group);

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('Erro ao buscar configurações por grupo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Atualiza configurações
   * PUT /api/settings
   */
  static async update(req, res) {
    try {
      const settings = req.body;

      await Settings.setMultiple(settings);

      res.json({
        success: true,
        message: 'Configurações atualizadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar configurações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Upload de logo
   * POST /api/settings/logo
   */
  static async uploadLogo(req, res) {
    try {
      if (!req.processedImage) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem enviada'
        });
      }

      const { type } = req.query; // 'light' ou 'dark'
      const settingKey = type === 'dark' ? 'site_logo_dark' : 'site_logo';

      // Deletar logo anterior
      const currentLogo = await Settings.get(settingKey);
      if (currentLogo) {
        await deleteImage(currentLogo);
      }

      // Salvar novo logo
      await Settings.set(settingKey, req.processedImage.url);

      res.json({
        success: true,
        message: 'Logo atualizado com sucesso',
        data: {
          url: req.processedImage.url
        }
      });

    } catch (error) {
      console.error('Erro ao fazer upload do logo:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Upload de favicon
   * POST /api/settings/favicon
   */
  static async uploadFavicon(req, res) {
    try {
      if (!req.processedImage) {
        return res.status(400).json({
          success: false,
          message: 'Nenhuma imagem enviada'
        });
      }

      // Deletar favicon anterior
      const currentFavicon = await Settings.get('site_favicon');
      if (currentFavicon) {
        await deleteImage(currentFavicon);
      }

      // Salvar novo favicon
      await Settings.set('site_favicon', req.processedImage.url);

      res.json({
        success: true,
        message: 'Favicon atualizado com sucesso',
        data: {
          url: req.processedImage.url
        }
      });

    } catch (error) {
      console.error('Erro ao fazer upload do favicon:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém configurações de SEO
   * GET /api/settings/seo
   */
  static async seo(req, res) {
    try {
      const settings = await Settings.getSEO();

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('Erro ao buscar configurações de SEO:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Atualiza configurações de SEO
   * PUT /api/settings/seo
   */
  static async updateSEO(req, res) {
    try {
      const {
        meta_title,
        meta_description,
        meta_keywords,
        google_analytics,
        google_tag_manager,
        header_scripts,
        footer_scripts
      } = req.body;

      const seoSettings = {
        meta_title,
        meta_description,
        meta_keywords,
        google_analytics,
        google_tag_manager,
        header_scripts,
        footer_scripts
      };

      // Filtrar undefined
      Object.keys(seoSettings).forEach(key => {
        if (seoSettings[key] === undefined) delete seoSettings[key];
      });

      await Settings.setMultiple(seoSettings);

      res.json({
        success: true,
        message: 'Configurações de SEO atualizadas com sucesso'
      });

    } catch (error) {
      console.error('Erro ao atualizar configurações de SEO:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém configurações de contato
   * GET /api/settings/contact
   */
  static async contact(req, res) {
    try {
      const settings = await Settings.getContact();

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('Erro ao buscar configurações de contato:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém configurações de redes sociais
   * GET /api/settings/social
   */
  static async social(req, res) {
    try {
      const settings = await Settings.getSocial();

      res.json({
        success: true,
        data: settings
      });

    } catch (error) {
      console.error('Erro ao buscar configurações de redes sociais:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = SettingsController;
