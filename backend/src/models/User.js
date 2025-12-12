/**
 * Model de Usuário
 * 
 * @module models/User
 * @description Operações de banco de dados para usuários administrativos
 */

const { query, pool } = require('../config/database');
const bcrypt = require('bcryptjs');

class User {
  /**
   * Encontra um usuário pelo ID
   * @param {number} id - ID do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findById(id) {
    const rows = await query(
      'SELECT id, name, email, role, avatar, is_active, last_login, created_at FROM users WHERE id = ?',
      [id]
    );
    return rows[0] || null;
  }

  /**
   * Encontra um usuário pelo email
   * @param {string} email - Email do usuário
   * @returns {Promise<Object|null>} Usuário encontrado ou null
   */
  static async findByEmail(email) {
    const rows = await query(
      'SELECT * FROM users WHERE email = ?',
      [email]
    );
    return rows[0] || null;
  }

  /**
   * Lista todos os usuários
   * @param {Object} options - Opções de filtro e paginação
   * @returns {Promise<Object>} Lista de usuários e total
   */
  static async findAll({ page = 1, limit = 20, role = null, isActive = null }) {
    let sql = 'SELECT id, name, email, role, avatar, is_active, last_login, created_at FROM users WHERE 1=1';
    const params = [];

    if (role) {
      sql += ' AND role = ?';
      params.push(role);
    }

    if (isActive !== null) {
      sql += ' AND is_active = ?';
      params.push(isActive);
    }

    // Contar total
    const countResult = await query(sql.replace('SELECT id, name, email, role, avatar, is_active, last_login, created_at', 'SELECT COUNT(*) as total'), params);
    const total = countResult[0].total;

    // Adicionar paginação
    sql += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(limit, (page - 1) * limit);

    const rows = await query(sql, params);

    return {
      users: rows,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit)
      }
    };
  }

  /**
   * Cria um novo usuário
   * @param {Object} userData - Dados do usuário
   * @returns {Promise<Object>} Usuário criado
   */
  static async create({ name, email, password, role = 'editor' }) {
    const hashedPassword = await bcrypt.hash(password, 12);

    const result = await query(
      'INSERT INTO users (name, email, password, role) VALUES (?, ?, ?, ?)',
      [name, email, hashedPassword, role]
    );

    return this.findById(result.insertId);
  }

  /**
   * Atualiza um usuário
   * @param {number} id - ID do usuário
   * @param {Object} userData - Dados a atualizar
   * @returns {Promise<Object>} Usuário atualizado
   */
  static async update(id, { name, email, role, avatar, is_active }) {
    const fields = [];
    const params = [];

    if (name !== undefined) {
      fields.push('name = ?');
      params.push(name);
    }
    if (email !== undefined) {
      fields.push('email = ?');
      params.push(email);
    }
    if (role !== undefined) {
      fields.push('role = ?');
      params.push(role);
    }
    if (avatar !== undefined) {
      fields.push('avatar = ?');
      params.push(avatar);
    }
    if (is_active !== undefined) {
      fields.push('is_active = ?');
      params.push(is_active);
    }

    if (fields.length === 0) return this.findById(id);

    params.push(id);
    await query(`UPDATE users SET ${fields.join(', ')} WHERE id = ?`, params);

    return this.findById(id);
  }

  /**
   * Atualiza a senha do usuário
   * @param {number} id - ID do usuário
   * @param {string} newPassword - Nova senha
   * @returns {Promise<boolean>} Sucesso
   */
  static async updatePassword(id, newPassword) {
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await query('UPDATE users SET password = ? WHERE id = ?', [hashedPassword, id]);
    return true;
  }

  /**
   * Verifica a senha do usuário
   * @param {string} password - Senha em texto plano
   * @param {string} hashedPassword - Senha hash armazenada
   * @returns {Promise<boolean>} Senha válida ou não
   */
  static async verifyPassword(password, hashedPassword) {
    return bcrypt.compare(password, hashedPassword);
  }

  /**
   * Atualiza último login
   * @param {number} id - ID do usuário
   * @returns {Promise<void>}
   */
  static async updateLastLogin(id) {
    await query('UPDATE users SET last_login = NOW() WHERE id = ?', [id]);
  }

  /**
   * Deleta um usuário
   * @param {number} id - ID do usuário
   * @returns {Promise<boolean>} Sucesso
   */
  static async delete(id) {
    const result = await query('DELETE FROM users WHERE id = ?', [id]);
    return result.affectedRows > 0;
  }
}

module.exports = User;
