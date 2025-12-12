/**
 * Validators
 * 
 * @module validators
 * @description Esquemas de validação com Joi
 */

const Joi = require('joi');

/**
 * Middleware de validação
 * @param {Object} schema - Schema Joi para validação
 * @param {string} property - Propriedade do request a validar (body, query, params)
 */
const validate = (schema, property = 'body') => {
  return (req, res, next) => {
    const { error, value } = schema.validate(req[property], {
      abortEarly: false,
      stripUnknown: true
    });

    if (error) {
      const errors = error.details.map(detail => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, '')
      }));

      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors
      });
    }

    req[property] = value;
    next();
  };
};

// =============================================
// SCHEMAS DE AUTENTICAÇÃO
// =============================================

const authSchemas = {
  login: Joi.object({
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
    password: Joi.string().min(6).required().messages({
      'string.min': 'Senha deve ter pelo menos 6 caracteres',
      'any.required': 'Senha é obrigatória'
    })
  }),

  register: Joi.object({
    name: Joi.string().min(3).max(100).required(),
    email: Joi.string().email().required(),
    password: Joi.string().min(6).max(100).required(),
    role: Joi.string().valid('admin', 'editor', 'viewer').default('editor')
  }),

  updatePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).max(100).required()
  })
};

// =============================================
// SCHEMAS DE CATEGORIA
// =============================================

const categorySchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(100).required().messages({
      'string.min': 'Nome deve ter pelo menos 2 caracteres',
      'any.required': 'Nome é obrigatório'
    }),
    slug: Joi.string().max(120).pattern(/^[a-z0-9-]+$/).allow('', null),
    description: Joi.string().max(1000).allow('', null),
    image: Joi.string().max(255).allow('', null),
    parent_id: Joi.number().integer().allow(null),
    display_order: Joi.number().integer().min(0).default(0),
    is_active: Joi.boolean().default(true),
    meta_title: Joi.string().max(70).allow('', null),
    meta_description: Joi.string().max(160).allow('', null)
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(100),
    slug: Joi.string().max(120).pattern(/^[a-z0-9-]+$/).allow('', null),
    description: Joi.string().max(1000).allow('', null),
    image: Joi.string().max(255).allow('', null),
    parent_id: Joi.number().integer().allow(null),
    display_order: Joi.number().integer().min(0),
    is_active: Joi.boolean(),
    meta_title: Joi.string().max(70).allow('', null),
    meta_description: Joi.string().max(160).allow('', null)
  })
};

// =============================================
// SCHEMAS DE PRODUTO
// =============================================

const productSchemas = {
  create: Joi.object({
    name: Joi.string().min(2).max(200).required(),
    slug: Joi.string().max(220).pattern(/^[a-z0-9-]+$/).allow('', null),
    short_description: Joi.string().max(300).allow('', null),
    description: Joi.string().max(10000).allow('', null),
    specifications: Joi.alternatives().try(
      Joi.object(),
      Joi.string()
    ).allow(null),
    category_id: Joi.number().integer().required(),
    sku: Joi.string().max(50).allow('', null),
    featured_image: Joi.string().max(255).allow('', null),
    is_featured: Joi.boolean().default(false),
    is_active: Joi.boolean().default(true),
    display_order: Joi.number().integer().min(0).default(0),
    meta_title: Joi.string().max(70).allow('', null),
    meta_description: Joi.string().max(160).allow('', null)
  }),

  update: Joi.object({
    name: Joi.string().min(2).max(200),
    slug: Joi.string().max(220).pattern(/^[a-z0-9-]+$/).allow('', null),
    short_description: Joi.string().max(300).allow('', null),
    description: Joi.string().max(10000).allow('', null),
    specifications: Joi.alternatives().try(
      Joi.object(),
      Joi.string()
    ).allow(null),
    category_id: Joi.number().integer(),
    sku: Joi.string().max(50).allow('', null),
    featured_image: Joi.string().max(255).allow('', null),
    is_featured: Joi.boolean(),
    is_active: Joi.boolean(),
    display_order: Joi.number().integer().min(0),
    meta_title: Joi.string().max(70).allow('', null),
    meta_description: Joi.string().max(160).allow('', null)
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    category: Joi.string(),
    featured: Joi.boolean(),
    active: Joi.boolean(),
    search: Joi.string().max(100),
    orderBy: Joi.string().valid('display_order', 'name', 'created_at', 'views'),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
  })
};

// =============================================
// SCHEMAS DE BANNER
// =============================================

const bannerSchemas = {
  create: Joi.object({
    title: Joi.string().max(150).allow('', null),
    subtitle: Joi.string().max(255).allow('', null),
    image_desktop: Joi.string().max(255).required(),
    image_mobile: Joi.string().max(255).allow('', null),
    link_url: Joi.string().max(500).uri().allow('', null),
    link_target: Joi.string().valid('_self', '_blank').default('_self'),
    button_text: Joi.string().max(50).allow('', null),
    display_order: Joi.number().integer().min(0).default(0),
    is_active: Joi.boolean().default(true),
    start_date: Joi.date().iso().allow(null),
    end_date: Joi.date().iso().greater(Joi.ref('start_date')).allow(null)
  }),

  update: Joi.object({
    title: Joi.string().max(150).allow('', null),
    subtitle: Joi.string().max(255).allow('', null),
    image_desktop: Joi.string().max(255),
    image_mobile: Joi.string().max(255).allow('', null),
    link_url: Joi.string().max(500).uri().allow('', null),
    link_target: Joi.string().valid('_self', '_blank'),
    button_text: Joi.string().max(50).allow('', null),
    display_order: Joi.number().integer().min(0),
    is_active: Joi.boolean(),
    start_date: Joi.date().iso().allow(null),
    end_date: Joi.date().iso().allow(null)
  })
};

// =============================================
// SCHEMAS DE COTAÇÃO
// =============================================

const quotationSchemas = {
  create: Joi.object({
    first_name: Joi.string().min(2).max(100).required().messages({
      'any.required': 'Nome é obrigatório'
    }),
    last_name: Joi.string().min(2).max(100).required().messages({
      'any.required': 'Sobrenome é obrigatório'
    }),
    email: Joi.string().email().required().messages({
      'string.email': 'Email inválido',
      'any.required': 'Email é obrigatório'
    }),
    phone: Joi.string().min(10).max(20).required().messages({
      'any.required': 'Telefone é obrigatório'
    }),
    company_name: Joi.string().max(150).allow('', null),
    cnpj: Joi.string().max(20).pattern(/^[0-9./\-]+$/).allow('', null),
    installation_type: Joi.string().valid(
      'academia', 'condominio', 'hotel', 'empresa', 
      'residencia', 'ct_esportivo', 'outro'
    ).required().messages({
      'any.required': 'Tipo de instalação é obrigatório'
    }),
    installation_type_other: Joi.string().max(100).allow('', null),
    city: Joi.string().max(100).allow('', null),
    state: Joi.string().length(2).uppercase().allow('', null),
    message: Joi.string().max(2000).allow('', null),
    items: Joi.array().items(
      Joi.object({
        product_id: Joi.number().integer().required(),
        product_name: Joi.string().max(200).required(),
        quantity: Joi.number().integer().min(1).default(1),
        notes: Joi.string().max(500).allow('', null)
      })
    ).min(1).required().messages({
      'array.min': 'Adicione pelo menos um produto à cotação'
    })
  }),

  updateStatus: Joi.object({
    status: Joi.string().valid(
      'pending', 'contacted', 'quoted', 'converted', 'cancelled'
    ).required(),
    admin_notes: Joi.string().max(2000).allow('', null)
  }),

  query: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    status: Joi.string().valid('pending', 'contacted', 'quoted', 'converted', 'cancelled'),
    search: Joi.string().max(100),
    dateFrom: Joi.date().iso(),
    dateTo: Joi.date().iso(),
    orderBy: Joi.string().valid('created_at', 'status', 'first_name'),
    order: Joi.string().valid('asc', 'desc', 'ASC', 'DESC')
  })
};

// =============================================
// SCHEMAS DE CONFIGURAÇÕES
// =============================================

const settingsSchemas = {
  update: Joi.object().pattern(
    Joi.string(),
    Joi.alternatives().try(
      Joi.string().allow(''),
      Joi.boolean(),
      Joi.number()
    )
  )
};

module.exports = {
  validate,
  authSchemas,
  categorySchemas,
  productSchemas,
  bannerSchemas,
  quotationSchemas,
  settingsSchemas
};
