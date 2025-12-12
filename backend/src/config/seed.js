/**
 * Script de Seed - Dados Iniciais
 * 
 * @description Popula o banco com dados de exemplo
 * Execute: npm run seed
 */

const bcrypt = require('bcryptjs');
const { query, testConnection } = require('./database');
require('dotenv').config();

const categories = [
  {
    name: 'Linha Smart',
    slug: 'linha-smart',
    description: 'A nova Linha Smart vem com traços sofisticados e modernos – trazendo a tradição OLDSCHOOL em seu DNA, porém com o conforto e praticidade de múltiplas regulagens.',
    display_order: 1,
    meta_title: 'Linha Smart | Equipamentos de Musculação Ipiranga',
    meta_description: 'Equipamentos da Linha Smart - Design moderno com DNA tradicional. Múltiplas regulagens e extrema robustez.'
  },
  {
    name: 'Linha Robótica',
    slug: 'linha-robotica',
    description: 'Máquinas articuladas robóticas exclusivas, inspiradas nos treinos dos grandes fisiculturistas, baseada em treinos de alta performance.',
    display_order: 2,
    meta_title: 'Linha Robótica | Máquinas Articuladas Ipiranga',
    meta_description: 'Linha Robótica de máquinas articuladas para treinos de alta performance. Exclusividade Ipiranga Fitness.'
  },
  {
    name: 'Linha Clássica',
    slug: 'linha-classica',
    description: 'Os clássicos equipamentos de musculação – seguros, resistentes e com ótimos resultados em seu treinamento.',
    display_order: 3,
    meta_title: 'Linha Clássica | Equipamentos Tradicionais Ipiranga',
    meta_description: 'Linha Clássica de equipamentos de musculação. Tradição, segurança e resultados comprovados desde 1969.'
  },
  {
    name: 'Acessórios GRIPS',
    slug: 'acessorios-grips',
    description: 'Puxadores GRIPS que maximizam pegada, conforto e estabilidade, permitindo diferentes ativações musculares.',
    display_order: 4,
    meta_title: 'Acessórios GRIPS | Puxadores Profissionais',
    meta_description: 'Puxadores GRIPS profissionais para maior pegada, conforto e estabilidade nos treinos.'
  },
  {
    name: 'Cardio',
    slug: 'cardio',
    description: 'Equipamentos de cardio para complementar sua academia com treinos aeróbicos de alta qualidade.',
    display_order: 5,
    meta_title: 'Equipamentos Cardio | Ipiranga Fitness',
    meta_description: 'Equipamentos de cardio profissionais para academias. Bicicletas, esteiras e mais.'
  },
  {
    name: 'Peso Livre',
    slug: 'peso-livre',
    description: 'Equipamentos para treino com peso livre - racks, suportes, bancos e acessórios.',
    display_order: 6,
    meta_title: 'Peso Livre | Racks e Suportes Ipiranga',
    meta_description: 'Equipamentos para peso livre - racks, gaiolas, suportes e bancos profissionais.'
  }
];

const products = [
  // Linha Smart
  {
    name: 'Supino Reto Smart',
    slug: 'supino-reto-smart',
    short_description: 'Supino reto da linha Smart com design moderno e múltiplas regulagens.',
    description: 'O Supino Reto Smart combina a tradição OLDSCHOOL com tecnologia moderna. Estrutura em aço carbono com pintura eletrostática, estofados de alta densidade e sistema de regulagem preciso.',
    specifications: JSON.stringify({
      'Dimensões': '180 x 135 x 120 cm',
      'Peso': '95 kg',
      'Carga Máxima': '300 kg',
      'Material': 'Aço carbono SAE 1020',
      'Acabamento': 'Pintura eletrostática',
      'Estofado': 'Espuma D45 com revestimento courvin'
    }),
    category_slug: 'linha-smart',
    sku: 'SM-SUP-001',
    is_featured: true
  },
  {
    name: 'Peck Deck Smart',
    slug: 'peck-deck-smart',
    short_description: 'Peck Deck convergente com movimento natural e amplitude completa.',
    description: 'Peck Deck Smart com sistema convergente que proporciona movimento natural do exercício. Torre curvada no perfil 80x40 mantendo padrão visual arrojado.',
    specifications: JSON.stringify({
      'Dimensões': '160 x 150 x 200 cm',
      'Peso': '180 kg',
      'Carga': '100 kg (placas inclusas)',
      'Material': 'Aço carbono SAE 1020',
      'Acabamento': 'Pintura eletrostática',
      'Cabos': 'Aço revestido 6mm'
    }),
    category_slug: 'linha-smart',
    sku: 'SM-PD-001',
    is_featured: true
  },
  {
    name: 'Leg Press 45° Smart',
    slug: 'leg-press-45-smart',
    short_description: 'Leg Press 45 graus com plataforma ampla e sistema de trava de segurança.',
    description: 'Leg Press 45° com plataforma extra ampla para variações de pegada. Sistema de trava de segurança dupla e estrutura reforçada para cargas pesadas.',
    specifications: JSON.stringify({
      'Dimensões': '220 x 180 x 150 cm',
      'Peso': '250 kg',
      'Carga Máxima': '500 kg',
      'Plataforma': '90 x 70 cm',
      'Material': 'Aço carbono SAE 1020',
      'Trilhos': 'Rolamentos lineares'
    }),
    category_slug: 'linha-smart',
    sku: 'SM-LP-001',
    is_featured: true
  },
  // Linha Robótica
  {
    name: 'Supino Articulado Robótico',
    slug: 'supino-articulado-robotico',
    short_description: 'Supino com movimento articulado convergente para máxima contração peitoral.',
    description: 'Supino Articulado Robótico com braços independentes e movimento convergente que acompanha a biomecânica natural do movimento. Ideal para treinos de alta intensidade.',
    specifications: JSON.stringify({
      'Dimensões': '200 x 160 x 180 cm',
      'Peso': '220 kg',
      'Carga': '150 kg (placas inclusas)',
      'Movimento': 'Articulado convergente',
      'Material': 'Aço carbono reforçado',
      'Pegadas': 'Múltiplas posições'
    }),
    category_slug: 'linha-robotica',
    sku: 'RB-SUP-001',
    is_featured: true
  },
  {
    name: 'Remada Articulada Unilateral',
    slug: 'remada-articulada-unilateral',
    short_description: 'Remada unilateral com movimento articulado para trabalho isolado de dorsais.',
    description: 'Remada Articulada Unilateral permite trabalho independente de cada lado, com trajetória de movimento que maximiza a contração das dorsais.',
    specifications: JSON.stringify({
      'Dimensões': '180 x 140 x 160 cm',
      'Peso': '200 kg',
      'Carga': '120 kg por lado',
      'Movimento': 'Unilateral independente',
      'Apoios': 'Peito e joelhos',
      'Pegadas': 'Neutra e pronada'
    }),
    category_slug: 'linha-robotica',
    sku: 'RB-REM-001',
    is_featured: false
  },
  {
    name: 'Glúteo Robótico Standing',
    slug: 'gluteo-robotico-standing',
    short_description: 'Máquina para glúteos em pé com amplitude total de movimento.',
    description: 'Glúteo Robótico Standing para treino intenso de glúteos com amplitude completa. Movimento articulado que isola o músculo sem sobrecarregar a lombar.',
    specifications: JSON.stringify({
      'Dimensões': '160 x 100 x 180 cm',
      'Peso': '180 kg',
      'Carga': '100 kg (placas inclusas)',
      'Movimento': 'Pendular articulado',
      'Apoios': 'Reguláveis em altura',
      'Caneleira': 'Acolchoada anatômica'
    }),
    category_slug: 'linha-robotica',
    sku: 'RB-GLU-001',
    is_featured: true
  },
  // Linha Clássica
  {
    name: 'Supino Reto Clássico',
    slug: 'supino-reto-classico',
    short_description: 'O tradicional supino reto Ipiranga, robusto e durável.',
    description: 'Supino Reto Clássico - o equipamento que fez a história da Ipiranga. Estrutura super reforçada, design atemporal e durabilidade comprovada por décadas.',
    specifications: JSON.stringify({
      'Dimensões': '170 x 130 x 115 cm',
      'Peso': '85 kg',
      'Carga Máxima': '300 kg',
      'Material': 'Aço carbono SAE 1020',
      'Acabamento': 'Pintura eletrostática',
      'Ganchos': '5 posições'
    }),
    category_slug: 'linha-classica',
    sku: 'CL-SUP-001',
    is_featured: false
  },
  {
    name: 'Banco Scott Clássico',
    slug: 'banco-scott-classico',
    short_description: 'Banco Scott para rosca bíceps com apoio anatômico.',
    description: 'Banco Scott Clássico com apoio anatômico para rosca bíceps. Ajuste de altura do assento e suporte para barra incluso.',
    specifications: JSON.stringify({
      'Dimensões': '100 x 80 x 90 cm',
      'Peso': '45 kg',
      'Carga Máxima': '150 kg',
      'Apoio': 'Inclinação fixa 45°',
      'Assento': 'Regulável em altura',
      'Suporte': 'Para barra W ou reta'
    }),
    category_slug: 'linha-classica',
    sku: 'CL-SCT-001',
    is_featured: false
  },
  // Acessórios GRIPS
  {
    name: 'Puxador Triangular GRIP',
    slug: 'puxador-triangular-grip',
    short_description: 'Puxador triangular com pegada emborrachada antiderrapante.',
    description: 'Puxador Triangular GRIP com pegada emborrachada de alta aderência. Ideal para remadas e puxadas com pegada neutra.',
    specifications: JSON.stringify({
      'Material': 'Aço cromado',
      'Pegada': 'Emborrachada antiderrapante',
      'Largura': '20 cm',
      'Peso': '2 kg',
      'Conexão': 'Mosquetão giratório'
    }),
    category_slug: 'acessorios-grips',
    sku: 'GR-TRI-001',
    is_featured: false
  },
  {
    name: 'Barra Pulley Reta GRIP',
    slug: 'barra-pulley-reta-grip',
    short_description: 'Barra reta para pulley com pegadas múltiplas.',
    description: 'Barra Pulley Reta GRIP com pegadas em diferentes larguras. Emborrachamento nas extremidades para conforto e aderência.',
    specifications: JSON.stringify({
      'Material': 'Aço cromado',
      'Comprimento': '120 cm',
      'Pegadas': '3 posições',
      'Peso': '5 kg',
      'Conexão': 'Central giratória'
    }),
    category_slug: 'acessorios-grips',
    sku: 'GR-BAR-001',
    is_featured: false
  },
  // Cardio
  {
    name: 'Bike Spinning Pro',
    slug: 'bike-spinning-pro',
    short_description: 'Bicicleta de spinning profissional para aulas em grupo.',
    description: 'Bike Spinning Pro - a tradição Ipiranga em equipamentos de cardio. Volante de inércia pesado, transmissão por correia e estrutura ultra reforçada.',
    specifications: JSON.stringify({
      'Volante': '22 kg',
      'Transmissão': 'Correia',
      'Resistência': 'Feltro ajustável',
      'Guidão': 'Múltiplas pegadas',
      'Pedais': 'Clip e presilha',
      'Peso Máximo Usuário': '150 kg'
    }),
    category_slug: 'cardio',
    sku: 'CD-BIK-001',
    is_featured: false
  },
  // Peso Livre
  {
    name: 'Gaiola de Agachamento',
    slug: 'gaiola-agachamento',
    short_description: 'Gaiola completa para agachamento com múltiplos acessórios.',
    description: 'Gaiola de Agachamento profissional com estrutura reforçada, pinos de segurança reguláveis, suporte para barra e puxador alto incluso.',
    specifications: JSON.stringify({
      'Dimensões': '180 x 160 x 240 cm',
      'Peso': '280 kg',
      'Carga Máxima': '500 kg',
      'Ganchos': '30 posições',
      'Acessórios': 'Puxador alto, suporte barra',
      'Fixação': 'Parafusos no piso'
    }),
    category_slug: 'peso-livre',
    sku: 'PL-GAI-001',
    is_featured: true
  }
];

async function seed() {
  try {
    const connected = await testConnection();
    if (!connected) {
      console.error('❌ Não foi possível conectar ao banco de dados');
      process.exit(1);
    }

    console.log('\n🌱 Iniciando seed do banco de dados...\n');

    // Criar usuário admin padrão
    console.log('👤 Criando usuário administrador...');
    const hashedPassword = await bcrypt.hash('admin123', 12);
    
    // Usar ON DUPLICATE KEY UPDATE para garantir que a senha seja atualizada
    await query(`
      INSERT INTO users (name, email, password, role, is_active)
      VALUES (?, ?, ?, 'admin', TRUE)
      ON DUPLICATE KEY UPDATE password = VALUES(password), is_active = TRUE
    `, ['Administrador', 'admin@equipamentosipiranga.com.br', hashedPassword]);
    
    console.log('✅ Usuário admin criado/atualizado (email: admin@equipamentosipiranga.com.br, senha: admin123)');

    // Inserir categorias
    console.log('\n📁 Inserindo categorias...');
    for (const category of categories) {
      await query(`
        INSERT IGNORE INTO categories (name, slug, description, display_order, meta_title, meta_description, is_active)
        VALUES (?, ?, ?, ?, ?, ?, TRUE)
      `, [category.name, category.slug, category.description, category.display_order, category.meta_title, category.meta_description]);
      console.log(`   ✅ ${category.name}`);
    }

    // Buscar IDs das categorias
    const categoryRows = await query('SELECT id, slug FROM categories');
    const categoryMap = {};
    categoryRows.forEach(row => {
      categoryMap[row.slug] = row.id;
    });

    // Inserir produtos
    console.log('\n📦 Inserindo produtos...');
    for (const product of products) {
      const categoryId = categoryMap[product.category_slug];
      if (!categoryId) {
        console.log(`   ⚠️  Categoria não encontrada para: ${product.name}`);
        continue;
      }

      await query(`
        INSERT IGNORE INTO products (name, slug, short_description, description, specifications, category_id, sku, is_featured, is_active)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, TRUE)
      `, [
        product.name,
        product.slug,
        product.short_description,
        product.description,
        product.specifications,
        categoryId,
        product.sku,
        product.is_featured
      ]);
      console.log(`   ✅ ${product.name}`);
    }

    // Inserir banners de exemplo
    console.log('\n🖼️  Inserindo banners de exemplo...');
    const banners = [
      {
        title: 'Equipamentos de Alta Performance',
        subtitle: 'Desde 1969 fabricando máquinas que fazem campeões',
        button_text: 'Ver Catálogo',
        link_url: '/equipamentos',
        display_order: 1
      },
      {
        title: 'Nova Linha Smart 2025',
        subtitle: 'Design moderno com DNA tradicional',
        button_text: 'Conhecer',
        link_url: '/equipamentos/linha-smart',
        display_order: 2
      },
      {
        title: 'Solicite sua Cotação',
        subtitle: 'Projetos personalizados para sua academia',
        button_text: 'Solicitar',
        link_url: '/equipamentos',
        display_order: 3
      }
    ];

    for (const banner of banners) {
      await query(`
        INSERT INTO banners (title, subtitle, button_text, link_url, image_desktop, display_order, is_active)
        VALUES (?, ?, ?, ?, '/images/banners/placeholder.jpg', ?, TRUE)
      `, [banner.title, banner.subtitle, banner.button_text, banner.link_url, banner.display_order]);
      console.log(`   ✅ Banner: ${banner.title}`);
    }

    console.log('\n✨ Seed concluído com sucesso!\n');
    console.log('📋 Resumo:');
    console.log(`   - ${categories.length} categorias`);
    console.log(`   - ${products.length} produtos`);
    console.log(`   - ${banners.length} banners`);
    console.log(`   - 1 usuário administrador`);
    console.log('\n🔑 Acesso admin: admin@equipamentosipiranga.com.br / admin123\n');

    process.exit(0);

  } catch (error) {
    console.error('\n❌ Erro durante o seed:', error.message);
    process.exit(1);
  }
}

seed();
