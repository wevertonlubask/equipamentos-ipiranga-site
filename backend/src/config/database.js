/**
 * Configuração da conexão com o banco de dados MySQL
 * 
 * @module config/database
 * @description Pool de conexões MySQL com suporte a Promises
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do pool de conexões
const poolConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT) || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'ipiranga_fitness',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  enableKeepAlive: true,
  keepAliveInitialDelay: 0
};

// Criar pool de conexões
const pool = mysql.createPool(poolConfig);

/**
 * Testa a conexão com o banco de dados
 * @returns {Promise<boolean>} Retorna true se a conexão for bem-sucedida
 */
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ Conexão com MySQL estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ Erro ao conectar com MySQL:', error.message);
    return false;
  }
}

/**
 * Executa uma query no banco de dados
 * @param {string} sql - Query SQL a ser executada
 * @param {Array} params - Parâmetros da query
 * @returns {Promise<Array>} Resultado da query
 */
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erro na query:', error.message);
    throw error;
  }
}

/**
 * Inicia uma transação
 * @returns {Promise<Connection>} Conexão com transação iniciada
 */
async function beginTransaction() {
  const connection = await pool.getConnection();
  await connection.beginTransaction();
  return connection;
}

module.exports = {
  pool,
  query,
  testConnection,
  beginTransaction
};
