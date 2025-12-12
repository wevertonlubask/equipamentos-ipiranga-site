/**
 * Tipos TypeScript do Projeto
 * 
 * @module types
 * @description Definições de tipos para todo o projeto
 */

// =============================================
// TIPOS DE USUÁRIO
// =============================================

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  avatar?: string;
  is_active: boolean;
  last_login?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

// =============================================
// TIPOS DE CATEGORIA
// =============================================

export interface Category {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  parent_id?: number;
  parent_name?: string;
  display_order: number;
  is_active: boolean;
  meta_title?: string;
  meta_description?: string;
  product_count?: number;
  created_at: string;
  updated_at: string;
  children?: Category[];
}

// =============================================
// TIPOS DE PRODUTO
// =============================================

export interface ProductSpecifications {
  [key: string]: string;
}

export interface ProductImage {
  id: number;
  product_id: number;
  image_url: string;
  alt_text?: string;
  display_order: number;
  is_primary: boolean;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  short_description?: string;
  description?: string;
  specifications: ProductSpecifications;
  category_id: number;
  category_name?: string;
  category_slug?: string;
  sku?: string;
  featured_image?: string;
  is_featured: boolean;
  is_active: boolean;
  display_order: number;
  meta_title?: string;
  meta_description?: string;
  views: number;
  created_at: string;
  updated_at: string;
  images?: ProductImage[];
  related?: Product[];
}

// =============================================
// TIPOS DE BANNER
// =============================================

export interface Banner {
  id: number;
  title?: string;
  subtitle?: string;
  image_desktop: string;
  image_mobile?: string;
  link_url?: string;
  link_target: '_self' | '_blank';
  button_text?: string;
  display_order: number;
  is_active: boolean;
  start_date?: string;
  end_date?: string;
  created_at: string;
  updated_at: string;
}

// =============================================
// TIPOS DE COTAÇÃO
// =============================================

export type InstallationType = 
  | 'academia' 
  | 'condominio' 
  | 'hotel' 
  | 'empresa' 
  | 'residencia' 
  | 'ct_esportivo' 
  | 'outro';

export type QuotationStatus = 
  | 'pending' 
  | 'contacted' 
  | 'quoted' 
  | 'converted' 
  | 'cancelled';

export interface QuotationItem {
  id?: number;
  quotation_id?: number;
  product_id: number;
  product_name: string;
  product_slug?: string;
  featured_image?: string;
  quantity: number;
  notes?: string;
  created_at?: string;
}

export interface Quotation {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  cnpj?: string;
  installation_type: InstallationType;
  installation_type_other?: string;
  city?: string;
  state?: string;
  message?: string;
  status: QuotationStatus;
  admin_notes?: string;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
  updated_at: string;
  items: QuotationItem[];
  total_items?: number;
}

export interface QuotationFormData {
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  company_name?: string;
  cnpj?: string;
  installation_type: InstallationType;
  installation_type_other?: string;
  city?: string;
  state?: string;
  message?: string;
  items: {
    product_id: number;
    product_name: string;
    quantity: number;
    notes?: string;
  }[];
}

export interface QuotationStats {
  total: number;
  pending: number;
  contacted: number;
  quoted: number;
  converted: number;
  cancelled: number;
  today: number;
  last_7_days: number;
  last_30_days: number;
}

// =============================================
// TIPOS DE CARRINHO
// =============================================

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CartState {
  items: CartItem[];
  isOpen: boolean;
}

// =============================================
// TIPOS DE CONFIGURAÇÕES
// =============================================

export interface SiteSettings {
  site_name?: string;
  site_description?: string;
  site_logo?: string;
  site_logo_dark?: string;
  site_favicon?: string;
  contact_email?: string;
  contact_phone?: string;
  contact_whatsapp?: string;
  contact_address?: string;
  social_instagram?: string;
  social_facebook?: string;
  social_youtube?: string;
  social_linkedin?: string;
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  google_analytics?: string;
  google_tag_manager?: string;
  [key: string]: string | undefined;
}

// =============================================
// TIPOS DE RESPOSTA DA API
// =============================================

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
  errors?: { field: string; message: string }[];
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: {
    [key: string]: T[];
  } & {
    pagination: Pagination;
  };
}

export interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

// =============================================
// TIPOS UTILITÁRIOS
// =============================================

export type SortOrder = 'asc' | 'desc';

export interface QueryParams {
  page?: number;
  limit?: number;
  search?: string;
  category?: string;
  status?: string;
  featured?: boolean;
  active?: boolean;
  orderBy?: string;
  order?: SortOrder;
  dateFrom?: string;
  dateTo?: string;
}
