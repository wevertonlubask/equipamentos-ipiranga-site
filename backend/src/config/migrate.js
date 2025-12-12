/**
 * Script de Migração do Banco de Dados
 * 
 * @description Cria todas as tabelas necessárias para o sistema
 * Execute: npm run migrate
 */

const mysql = require('mysql2/promise');
require('dotenv').config();

const migrations = [
  // =============================================
  // TABELA: users (Usuários administrativos)
  // =============================================
  `CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role ENUM('admin', 'editor', 'viewer') DEFAULT 'editor',
    avatar VARCHAR(255) NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_email (email),
    INDEX idx_role (role)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // =============================================
  // TABELA: categories (Categorias de produtos)
  // =============================================
  `CREATE TABLE IF NOT EXISTS categories (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(120) NOT NULL UNIQUE,
    description TEXT NULL,
    image VARCHAR(255) NULL,
    parent_id INT NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    meta_title VARCHAR(70) NULL,
    meta_description VARCHAR(160) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (parent_id) REFERENCES categories(id) ON DELETE SET NULL,
    INDEX idx_slug (slug),
    INDEX idx_parent (parent_id),
    INDEX idx_active (is_active)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // =============================================
  // TABELA: products (Produtos/Equipamentos)
  // =============================================
  `CREATE TABLE IF NOT EXISTS products (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    slug VARCHAR(220) NOT NULL UNIQUE,
    short_description VARCHAR(300) NULL,
    description TEXT NULL,
    specifications JSON NULL,
    category_id INT NOT NULL,
    sku VARCHAR(50) NULL UNIQUE,
    featured_image VARCHAR(255) NULL,
    is_featured BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    display_order INT DEFAULT 0,
    meta_title VARCHAR(70) NULL,
    meta_description VARCHAR(160) NULL,
    views INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (category_id) REFERENCES categories(id) ON DELETE RESTRICT,
    INDEX idx_slug (slug),
    INDEX idx_category (category_id),
    INDEX idx_featured (is_featured),
    INDEX idx_active (is_active),
    FULLTEXT idx_search (name, short_description, description)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // =============================================
  // TABELA: product_images (Imagens dos produtos)
  // =============================================
  `CREATE TABLE IF NOT EXISTS product_images (
    id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT NOT NULL,
    image_url VARCHAR(255) NOT NULL,
    alt_text VARCHAR(200) NULL,
    display_order INT DEFAULT 0,
    is_primary BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_product (product_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // =============================================
  // TABELA: banners (Banners do carrossel)
  // =============================================
  `CREATE TABLE IF NOT EXISTS banners (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(150) NULL,
    subtitle VARCHAR(255) NULL,
    image_desktop VARCHAR(255) NOT NULL,
    image_mobile VARCHAR(255) NULL,
    link_url VARCHAR(500) NULL,
    link_target ENUM('_self', '_blank') DEFAULT '_self',
    button_text VARCHAR(50) NULL,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    start_date DATETIME NULL,
    end_date DATETIME NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_active (is_active),
    INDEX idx_dates (start_date, end_date)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // =============================================
  // TABELA: quotation_requests (Solicitações de cotação)
  // =============================================
  `CREATE TABLE IF NOT EXISTS quotation_requests (
    id INT AUTO_INCREMENT PRIMARY KEY,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    company_name VARCHAR(150) NULL,
    cnpj VARCHAR(20) NULL,
    installation_type ENUM('academia', 'condominio', 'hotel', 'empresa', 'residencia', 'ct_esportivo', 'outro') NOT NULL,
    installation_type_other VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    state VARCHAR(2) NULL,
    message TEXT NULL,
    status ENUM('pending', 'contacted', 'quoted', 'converted', 'cancelled') DEFAULT 'pending',
    admin_notes TEXT NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_status (status),
    INDEX idx_email (email),
    INDEX idx_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // =============================================
  // TABELA: quotation_items (Itens da cotação)
  // =============================================
  `CREATE TABLE IF NOT EXISTS quotation_items (
    id INT AUTO_INCREMENT PRIMARY KEY,
    quotation_id INT NOT NULL,
    product_id INT NOT NULL,
    product_name VARCHAR(200) NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    notes VARCHAR(500) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (quotation_id) REFERENCES quotation_requests(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES products(id) ON DELETE RESTRICT,
    INDEX idx_quotation (quotation_id)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // =============================================
  // TABELA: site_settings (Configurações do site)
  // =============================================
  `CREATE TABLE IF NOT EXISTS site_settings (
    id INT AUTO_INCREMENT PRIMARY KEY,
    setting_key VARCHAR(100) NOT NULL UNIQUE,
    setting_value TEXT NULL,
    setting_type ENUM('text', 'textarea', 'image', 'boolean', 'json') DEFAULT 'text',
    setting_group VARCHAR(50) DEFAULT 'general',
    description VARCHAR(255) NULL,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_key (setting_key),
    INDEX idx_group (setting_group)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`,

  // =============================================
  // TABELA: activity_logs (Log de atividades)
  // =============================================
  `CREATE TABLE IF NOT EXISTS activity_logs (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NULL,
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id INT NULL,
    old_values JSON NULL,
    new_values JSON NULL,
    ip_address VARCHAR(45) NULL,
    user_agent TEXT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_user (user_id),
    INDEX idx_action (action),
    INDEX idx_entity (entity_type, entity_id),
    INDEX idx_created (created_at)
  ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci`
];

// Configurações iniciais do site
const initialSettings = [
  ['site_name', 'Equipamentos Ipiranga', 'text', 'general', 'Nome do site'],
  ['site_description', 'Fábrica de equipamentos de musculação desde 1969', 'textarea', 'general', 'Descrição do site'],
  ['site_logo', '', 'image', 'general', 'Logo do site'],
  ['site_logo_dark', '', 'image', 'general', 'Logo do site (versão escura)'],
  ['site_favicon', '', 'image', 'general', 'Favicon do site'],
  ['contact_email', 'contato@equipamentosipiranga.com.br', 'text', 'contact', 'Email de contato'],
  ['contact_phone', '(18) 99999-9999', 'text', 'contact', 'Telefone de contato'],
  ['contact_whatsapp', '5518999999999', 'text', 'contact', 'WhatsApp'],
  ['contact_address', 'Rua Vicente Mele, 338 - Presidente Prudente/SP', 'textarea', 'contact', 'Endereço'],
  ['social_instagram', 'https://instagram.com/ipirangafitness', 'text', 'social', 'Instagram'],
  ['social_facebook', '', 'text', 'social', 'Facebook'],
  ['social_youtube', '', 'text', 'social', 'YouTube'],
  ['social_linkedin', '', 'text', 'social', 'LinkedIn'],
  ['meta_title', 'Equipamentos Ipiranga | Musculação de Alta Performance desde 1969', 'text', 'seo', 'Meta título padrão'],
  ['meta_description', 'Fábrica de equipamentos de musculação de alta performance. Máquinas robustas e duráveis para academias profissionais. Desde 1969.', 'textarea', 'seo', 'Meta descrição padrão'],
  ['meta_keywords', 'equipamentos musculação, máquinas academia, fitness, ipiranga fitness', 'textarea', 'seo', 'Palavras-chave'],
  ['google_analytics', '', 'text', 'seo', 'ID do Google Analytics'],
  ['google_tag_manager', '', 'text', 'seo', 'ID do Google Tag Manager'],
  ['header_scripts', '', 'textarea', 'advanced', 'Scripts no header'],
  ['footer_scripts', '', 'textarea', 'advanced', 'Scripts no footer']
];

async function runMigrations() {
  let connection;
  
  try {
    // Conectar sem especificar banco para poder criá-lo
    connection = await mysql.createConnection({
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT) || 3306,
      user: process.env.DB_USER || 'root',
      password: process.env.DB_PASSWORD || ''
    });

    console.log('🔌 Conectado ao MySQL');

    // Criar banco de dados se não existir
    const dbName = process.env.DB_NAME || 'ipiranga_fitness';
    await connection.query(`CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci`);
    console.log(`📦 Banco de dados "${dbName}" verificado/criado`);

    // Selecionar banco de dados
    await connection.query(`USE \`${dbName}\``);

    // Executar migrações
    console.log('\n🚀 Iniciando migrações...\n');
    
    for (let i = 0; i < migrations.length; i++) {
      const migration = migrations[i];
      const tableName = migration.match(/CREATE TABLE IF NOT EXISTS (\w+)/)?.[1] || `Migration ${i + 1}`;
      
      try {
        await connection.query(migration);
        console.log(`✅ Tabela "${tableName}" criada/verificada`);
      } catch (error) {
        console.error(`❌ Erro na tabela "${tableName}":`, error.message);
        throw error;
      }
    }

    // Inserir configurações iniciais
    console.log('\n⚙️  Inserindo configurações iniciais...\n');
    
    for (const setting of initialSettings) {
      const [key, value, type, group, description] = setting;
      await connection.query(
        `INSERT IGNORE INTO site_settings (setting_key, setting_value, setting_type, setting_group, description) 
         VALUES (?, ?, ?, ?, ?)`,
        [key, value, type, group, description]
      );
    }
    console.log('✅ Configurações iniciais inseridas');

    console.log('\n✨ Migrações concluídas com sucesso!\n');

  } catch (error) {
    console.error('\n❌ Erro durante as migrações:', error.message);
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
    }
  }
}

// Executar migrações
runMigrations();
