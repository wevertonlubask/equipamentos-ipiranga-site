/**
 * Controller de Cotações
 * 
 * @module controllers/QuotationController
 * @description Endpoints para gerenciamento de solicitações de cotação
 */

const Quotation = require('../models/Quotation');
const Product = require('../models/Product');

class QuotationController {
  /**
   * Lista cotações com filtros e paginação
   * GET /api/quotations
   */
  static async index(req, res) {
    try {
      const {
        page,
        limit,
        status,
        search,
        dateFrom,
        dateTo,
        orderBy,
        order
      } = req.query;

      const result = await Quotation.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        status,
        search,
        dateFrom,
        dateTo,
        orderBy,
        order
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Erro ao listar cotações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém estatísticas de cotações
   * GET /api/quotations/stats
   */
  static async stats(req, res) {
    try {
      const stats = await Quotation.getStats();

      res.json({
        success: true,
        data: stats
      });

    } catch (error) {
      console.error('Erro ao buscar estatísticas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém uma cotação pelo ID
   * GET /api/quotations/:id
   */
  static async show(req, res) {
    try {
      const { id } = req.params;
      const quotation = await Quotation.findById(id);

      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      res.json({
        success: true,
        data: quotation
      });

    } catch (error) {
      console.error('Erro ao buscar cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Cria uma nova solicitação de cotação (público)
   * POST /api/quotations
   */
  static async create(req, res) {
    try {
      const { items, ...customerData } = req.body;

      // Validar se os produtos existem
      const productIds = items.map(item => item.product_id);
      const products = await Product.findByIds(productIds);

      if (products.length !== productIds.length) {
        return res.status(400).json({
          success: false,
          message: 'Um ou mais produtos não foram encontrados'
        });
      }

      // Enriquecer items com nomes dos produtos
      const enrichedItems = items.map(item => {
        const product = products.find(p => p.id === item.product_id);
        return {
          ...item,
          product_name: product.name
        };
      });

      // Capturar informações do cliente
      const quotationData = {
        ...customerData,
        ip_address: req.ip || req.connection.remoteAddress,
        user_agent: req.get('User-Agent')
      };

      const quotation = await Quotation.create(quotationData, enrichedItems);

      // TODO: Enviar email de notificação

      res.status(201).json({
        success: true,
        message: 'Cotação enviada com sucesso! Entraremos em contato em breve.',
        data: {
          id: quotation.id,
          created_at: quotation.created_at
        }
      });

    } catch (error) {
      console.error('Erro ao criar cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro ao processar sua solicitação. Tente novamente.'
      });
    }
  }

  /**
   * Atualiza status da cotação
   * PUT /api/quotations/:id/status
   */
  static async updateStatus(req, res) {
    try {
      const { id } = req.params;
      const { status, admin_notes } = req.body;

      const quotation = await Quotation.findById(id);
      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const updated = await Quotation.updateStatus(id, status, admin_notes);

      res.json({
        success: true,
        message: 'Status atualizado com sucesso',
        data: updated
      });

    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Atualiza notas do admin
   * PUT /api/quotations/:id/notes
   */
  static async updateNotes(req, res) {
    try {
      const { id } = req.params;
      const { admin_notes } = req.body;

      const quotation = await Quotation.findById(id);
      if (!quotation) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      const updated = await Quotation.updateNotes(id, admin_notes);

      res.json({
        success: true,
        message: 'Notas atualizadas com sucesso',
        data: updated
      });

    } catch (error) {
      console.error('Erro ao atualizar notas:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Deleta uma cotação
   * DELETE /api/quotations/:id
   */
  static async delete(req, res) {
    try {
      const { id } = req.params;

      const deleted = await Quotation.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Cotação não encontrada'
        });
      }

      res.json({
        success: true,
        message: 'Cotação deletada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar cotação:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Exporta cotações para CSV
   * GET /api/quotations/export
   */
  static async export(req, res) {
    try {
      const { status, dateFrom, dateTo } = req.query;

      const data = await Quotation.export({ status, dateFrom, dateTo });

      // Gerar CSV
      const headers = [
        'ID', 'Nome', 'Sobrenome', 'Email', 'Telefone', 'Empresa',
        'CNPJ', 'Tipo Instalação', 'Cidade', 'Estado', 'Status',
        'Data', 'Produtos'
      ];

      const csvRows = [
        headers.join(';'),
        ...data.map(row => [
          row.id,
          row.first_name,
          row.last_name,
          row.email,
          row.phone,
          row.company_name || '',
          row.cnpj || '',
          row.installation_type,
          row.city || '',
          row.state || '',
          row.status,
          new Date(row.created_at).toLocaleString('pt-BR'),
          row.products || ''
        ].map(v => `"${v}"`).join(';'))
      ];

      const csv = csvRows.join('\n');

      res.setHeader('Content-Type', 'text/csv; charset=utf-8');
      res.setHeader('Content-Disposition', `attachment; filename=cotacoes-${Date.now()}.csv`);
      res.send('\uFEFF' + csv); // BOM para Excel reconhecer UTF-8

    } catch (error) {
      console.error('Erro ao exportar cotações:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = QuotationController;
