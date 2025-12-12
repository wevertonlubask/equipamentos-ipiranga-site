/**
 * Controller de Autenticação
 * 
 * @module controllers/AuthController
 * @description Endpoints de autenticação e gerenciamento de usuários
 */

const User = require('../models/User');
const { generateToken } = require('../middleware/auth');

class AuthController {
  /**
   * Login de usuário
   * POST /api/auth/login
   */
  static async login(req, res) {
    try {
      const { email, password } = req.body;

      // Buscar usuário
      const user = await User.findByEmail(email);

      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }

      // Verificar se está ativo
      if (!user.is_active) {
        return res.status(401).json({
          success: false,
          message: 'Usuário desativado. Contate o administrador.'
        });
      }

      // Verificar senha
      const isValid = await User.verifyPassword(password, user.password);

      if (!isValid) {
        return res.status(401).json({
          success: false,
          message: 'Email ou senha incorretos'
        });
      }

      // Atualizar último login
      await User.updateLastLogin(user.id);

      // Gerar token
      const token = generateToken(user);

      // Remover senha da resposta
      const { password: _, ...userWithoutPassword } = user;

      res.json({
        success: true,
        message: 'Login realizado com sucesso',
        data: {
          user: userWithoutPassword,
          token
        }
      });

    } catch (error) {
      console.error('Erro no login:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Obtém dados do usuário logado
   * GET /api/auth/me
   */
  static async me(req, res) {
    try {
      res.json({
        success: true,
        data: req.user
      });
    } catch (error) {
      console.error('Erro ao obter usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Atualiza perfil do usuário logado
   * PUT /api/auth/profile
   */
  static async updateProfile(req, res) {
    try {
      const { name, email, avatar } = req.body;

      // Verificar se email já existe (se estiver alterando)
      if (email && email !== req.user.email) {
        const existing = await User.findByEmail(email);
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Este email já está em uso'
          });
        }
      }

      const updated = await User.update(req.user.id, { name, email, avatar });

      res.json({
        success: true,
        message: 'Perfil atualizado com sucesso',
        data: updated
      });

    } catch (error) {
      console.error('Erro ao atualizar perfil:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Altera senha do usuário logado
   * PUT /api/auth/password
   */
  static async updatePassword(req, res) {
    try {
      const { currentPassword, newPassword } = req.body;

      // Buscar usuário com senha
      const user = await User.findByEmail(req.user.email);

      // Verificar senha atual
      const isValid = await User.verifyPassword(currentPassword, user.password);

      if (!isValid) {
        return res.status(400).json({
          success: false,
          message: 'Senha atual incorreta'
        });
      }

      // Atualizar senha
      await User.updatePassword(req.user.id, newPassword);

      res.json({
        success: true,
        message: 'Senha alterada com sucesso'
      });

    } catch (error) {
      console.error('Erro ao alterar senha:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Lista todos os usuários (admin only)
   * GET /api/auth/users
   */
  static async listUsers(req, res) {
    try {
      const { page, limit, role, isActive } = req.query;

      const result = await User.findAll({
        page: parseInt(page) || 1,
        limit: parseInt(limit) || 20,
        role,
        isActive: isActive === 'true' ? true : isActive === 'false' ? false : null
      });

      res.json({
        success: true,
        data: result
      });

    } catch (error) {
      console.error('Erro ao listar usuários:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Cria um novo usuário (admin only)
   * POST /api/auth/users
   */
  static async createUser(req, res) {
    try {
      const { name, email, password, role } = req.body;

      // Verificar se email já existe
      const existing = await User.findByEmail(email);
      if (existing) {
        return res.status(400).json({
          success: false,
          message: 'Este email já está em uso'
        });
      }

      const user = await User.create({ name, email, password, role });

      res.status(201).json({
        success: true,
        message: 'Usuário criado com sucesso',
        data: user
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Atualiza um usuário (admin only)
   * PUT /api/auth/users/:id
   */
  static async updateUser(req, res) {
    try {
      const { id } = req.params;
      const { name, email, role, is_active } = req.body;

      // Verificar se usuário existe
      const user = await User.findById(id);
      if (!user) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      // Verificar se email já existe (se estiver alterando)
      if (email && email !== user.email) {
        const existing = await User.findByEmail(email);
        if (existing) {
          return res.status(400).json({
            success: false,
            message: 'Este email já está em uso'
          });
        }
      }

      const updated = await User.update(id, { name, email, role, is_active });

      res.json({
        success: true,
        message: 'Usuário atualizado com sucesso',
        data: updated
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }

  /**
   * Deleta um usuário (admin only)
   * DELETE /api/auth/users/:id
   */
  static async deleteUser(req, res) {
    try {
      const { id } = req.params;

      // Não permitir deletar a si mesmo
      if (parseInt(id) === req.user.id) {
        return res.status(400).json({
          success: false,
          message: 'Você não pode deletar seu próprio usuário'
        });
      }

      const deleted = await User.delete(id);

      if (!deleted) {
        return res.status(404).json({
          success: false,
          message: 'Usuário não encontrado'
        });
      }

      res.json({
        success: true,
        message: 'Usuário deletado com sucesso'
      });

    } catch (error) {
      console.error('Erro ao deletar usuário:', error);
      res.status(500).json({
        success: false,
        message: 'Erro interno no servidor'
      });
    }
  }
}

module.exports = AuthController;
