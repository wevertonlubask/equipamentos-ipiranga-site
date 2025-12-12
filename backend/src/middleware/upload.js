/**
 * Middleware de Upload de Imagens
 * 
 * @module middleware/upload
 * @description Configuração do Multer para upload de imagens
 */

const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const sharp = require('sharp');
const fs = require('fs').promises;

// Diretórios de upload
const UPLOAD_DIRS = {
  products: path.join(__dirname, '../../uploads/products'),
  banners: path.join(__dirname, '../../uploads/banners'),
  logo: path.join(__dirname, '../../uploads/logo'),
  temp: path.join(__dirname, '../../uploads/temp')
};

// Criar diretórios sincronamente na inicialização
const fsSync = require('fs');
Object.values(UPLOAD_DIRS).forEach((dir) => {
  try {
    if (!fsSync.existsSync(dir)) {
      fsSync.mkdirSync(dir, { recursive: true });
      console.log(`📁 Pasta criada: ${dir}`);
    }
  } catch (error) {
    console.error(`Erro ao criar pasta ${dir}:`, error);
  }
});

// Tipos de arquivo permitidos
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

// Tamanho máximo (10MB)
const MAX_SIZE = parseInt(process.env.UPLOAD_MAX_SIZE) || 10 * 1024 * 1024;

/**
 * Filtro de arquivos
 */
const fileFilter = (req, file, cb) => {
  if (ALLOWED_TYPES.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Tipo de arquivo não permitido. Use: JPG, PNG, WebP ou GIF'), false);
  }
};

/**
 * Storage temporário para depois processar com Sharp
 */
const tempStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIRS.temp);
  },
  filename: (req, file, cb) => {
    const uniqueName = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueName);
  }
});

/**
 * Configuração do Multer
 */
const upload = multer({
  storage: tempStorage,
  fileFilter,
  limits: {
    fileSize: MAX_SIZE
  }
});

/**
 * Processa e otimiza uma imagem
 * @param {string} inputPath - Caminho da imagem original
 * @param {string} outputDir - Diretório de destino
 * @param {Object} options - Opções de processamento
 * @returns {Promise<Object>} Informações da imagem processada
 */
const processImage = async (inputPath, outputDir, options = {}) => {
  const {
    width = null,
    height = null,
    quality = 85,
    format = 'webp',
    fit = 'cover'
  } = options;

  const filename = `${uuidv4()}.${format}`;
  const outputPath = path.join(outputDir, filename);

  let transformer = sharp(inputPath);

  // Redimensionar se especificado
  if (width || height) {
    transformer = transformer.resize(width, height, { fit, withoutEnlargement: true });
  }

  // Converter para o formato desejado
  switch (format) {
    case 'webp':
      transformer = transformer.webp({ quality });
      break;
    case 'jpeg':
    case 'jpg':
      transformer = transformer.jpeg({ quality, progressive: true });
      break;
    case 'png':
      transformer = transformer.png({ quality: Math.round(quality / 10) });
      break;
  }

  await transformer.toFile(outputPath);

  // Obter metadados
  const metadata = await sharp(outputPath).metadata();

  // Remover arquivo temporário
  try {
    await fs.unlink(inputPath);
  } catch (e) {
    // Ignora erro se arquivo já foi removido
  }

  // Extrair o tipo de pasta (products, banners, logo) do caminho
  // Normalizar para sempre usar barras normais (/)
  const normalizedDir = outputDir.replace(/\\/g, '/');
  const uploadsIndex = normalizedDir.indexOf('uploads');
  let relativePath = uploadsIndex !== -1 
    ? normalizedDir.substring(uploadsIndex + 'uploads'.length)
    : '';
  
  // Garantir que começa com /
  if (relativePath && !relativePath.startsWith('/')) {
    relativePath = '/' + relativePath;
  }
  
  return {
    filename,
    path: outputPath,
    url: `${relativePath}/${filename}`.replace(/\/+/g, '/'),
    width: metadata.width,
    height: metadata.height,
    format: metadata.format,
    size: metadata.size
  };
};

/**
 * Middleware para processar imagem de produto
 */
const processProductImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const processed = await processImage(
      req.file.path,
      UPLOAD_DIRS.products,
      { width: 1200, height: 1200, quality: 85 }
    );

    // Criar thumbnail
    const thumbnail = await processImage(
      path.join(UPLOAD_DIRS.products, processed.filename),
      UPLOAD_DIRS.products,
      { width: 400, height: 400, quality: 80 }
    );

    // Renomear thumbnail
    const thumbFilename = processed.filename.replace('.webp', '_thumb.webp');
    await fs.rename(
      path.join(UPLOAD_DIRS.products, thumbnail.filename),
      path.join(UPLOAD_DIRS.products, thumbFilename)
    );

    req.processedImage = {
      ...processed,
      thumbnail: {
        filename: thumbFilename,
        url: `/products/${thumbFilename}`
      }
    };

    next();
  } catch (error) {
    console.error('Erro ao processar imagem:', error);
    next(error);
  }
};

/**
 * Middleware para processar banner
 */
const processBannerImage = async (req, res, next) => {
  try {
    const files = req.files || {};
    req.processedImages = {};

    // Processar imagem desktop
    if (files.image_desktop?.[0]) {
      req.processedImages.desktop = await processImage(
        files.image_desktop[0].path,
        UPLOAD_DIRS.banners,
        { width: 1920, height: 700, quality: 90 }
      );
    }

    // Processar imagem mobile
    if (files.image_mobile?.[0]) {
      req.processedImages.mobile = await processImage(
        files.image_mobile[0].path,
        UPLOAD_DIRS.banners,
        { width: 768, height: 500, quality: 85 }
      );
    }

    next();
  } catch (error) {
    console.error('Erro ao processar banner:', error);
    next(error);
  }
};

/**
 * Middleware para processar logo
 */
const processLogoImage = async (req, res, next) => {
  if (!req.file) return next();

  try {
    const processed = await processImage(
      req.file.path,
      UPLOAD_DIRS.logo,
      { height: 200, quality: 90, format: 'png' }
    );

    req.processedImage = processed;
    next();
  } catch (error) {
    console.error('Erro ao processar logo:', error);
    next(error);
  }
};

/**
 * Remove uma imagem
 * @param {string} imagePath - Caminho relativo da imagem
 * @returns {Promise<boolean>}
 */
const deleteImage = async (imagePath) => {
  try {
    const fullPath = path.join(__dirname, '../../uploads', imagePath);
    await fs.unlink(fullPath);
    return true;
  } catch (error) {
    console.error('Erro ao deletar imagem:', error);
    return false;
  }
};

module.exports = {
  upload,
  processImage,
  processProductImage,
  processBannerImage,
  processLogoImage,
  deleteImage,
  UPLOAD_DIRS
};
