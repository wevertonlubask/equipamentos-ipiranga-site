/**
 * Serviço de API
 * 
 * @module lib/api
 * @description Cliente HTTP para comunicação com o backend
 */

import type { 
  ApiResponse, 
  Product, 
  Category, 
  Banner, 
  Quotation, 
  QuotationFormData,
  QuotationStats,
  SiteSettings,
  User,
  QueryParams,
  Pagination
} from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

/**
 * Classe base para requisições HTTP
 */
class ApiClient {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  setToken(token: string | null) {
    this.token = token;
  }

  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return this.token || localStorage.getItem('token');
    }
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await response.json();

      if (!response.ok) {
        throw {
          status: response.status,
          message: data.message || 'Erro na requisição',
          errors: data.errors,
        };
      }

      return data;
    } catch (error: any) {
      if (error.status) throw error;
      
      throw {
        status: 500,
        message: 'Erro de conexão com o servidor',
      };
    }
  }

  async get<T>(endpoint: string, params?: QueryParams): Promise<ApiResponse<T>> {
    let url = endpoint;
    
    if (params) {
      const searchParams = new URLSearchParams();
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          searchParams.append(key, String(value));
        }
      });
      const queryString = searchParams.toString();
      if (queryString) {
        url += `?${queryString}`;
      }
    }
    
    return this.request<T>(url, { method: 'GET' });
  }

  async post<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T>(endpoint: string, data?: any): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T>(endpoint: string): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  async upload<T>(endpoint: string, formData: FormData): Promise<ApiResponse<T>> {
    const url = `${this.baseUrl}${endpoint}`;
    const token = this.getToken();

    const headers: HeadersInit = {};
    if (token) {
      (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'POST',
      headers,
      body: formData,
    });

    const data = await response.json();

    if (!response.ok) {
      throw {
        status: response.status,
        message: data.message || 'Erro no upload',
      };
    }

    return data;
  }
}

// Instância do cliente
const client = new ApiClient(API_URL);

// Exportar como 'api' para compatibilidade
export const api = client;

// =============================================
// SERVIÇOS DE AUTENTICAÇÃO
// =============================================

export const authService = {
  async login(email: string, password: string) {
    const response = await client.post<{ user: User; token: string }>('/auth/login', { email, password });
    if (response.data?.token) {
      client.setToken(response.data.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('token', response.data.token);
      }
    }
    return response;
  },

  async me() {
    return client.get<User>('/auth/me');
  },

  async updateProfile(data: Partial<User>) {
    return client.put<User>('/auth/profile', data);
  },

  async updatePassword(currentPassword: string, newPassword: string) {
    return client.put('/auth/password', { currentPassword, newPassword });
  },

  logout() {
    client.setToken(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
    }
  },

  setToken(token: string) {
    client.setToken(token);
  },

  async getUsers(params?: QueryParams) {
    return client.get<{ users: User[]; pagination: Pagination }>('/auth/users', params);
  },

  async createUser(data: { name: string; email: string; password: string; role: string }) {
    return client.post<User>('/auth/users', data);
  },

  async updateUser(id: number, data: Partial<User>) {
    return client.put<User>(`/auth/users/${id}`, data);
  },

  async deleteUser(id: number) {
    return client.delete(`/auth/users/${id}`);
  },
};

// =============================================
// SERVIÇOS DE CATEGORIAS
// =============================================

export const categoryService = {
  async getAll(params?: { active?: boolean; tree?: boolean }) {
    return client.get<Category[]>('/categories', params as QueryParams);
  },

  async getBySlug(slug: string) {
    return client.get<Category>(`/categories/${slug}`);
  },

  async create(data: Partial<Category>) {
    return client.post<Category>('/categories', data);
  },

  async update(id: number, data: Partial<Category>) {
    return client.put<Category>(`/categories/${id}`, data);
  },

  async delete(id: number) {
    return client.delete(`/categories/${id}`);
  },

  async reorder(order: { id: number; display_order: number }[]) {
    return client.put('/categories/reorder', { order });
  },
};

// =============================================
// SERVIÇOS DE PRODUTOS
// =============================================

export const productService = {
  async getAll(params?: QueryParams) {
    return client.get<{ products: Product[]; pagination: Pagination }>('/products', params);
  },

  async getFeatured(limit?: number) {
    return client.get<Product[]>('/products/featured', { limit } as QueryParams);
  },

  async getBySlug(slug: string) {
    return client.get<Product & { related: Product[] }>(`/products/${slug}`);
  },

  async getByIds(ids: number[]) {
    return client.post<Product[]>('/products/by-ids', { ids });
  },

  async create(data: Partial<Product>) {
    return client.post<Product>('/products', data);
  },

  async update(id: number, data: Partial<Product>) {
    return client.put<Product>(`/products/${id}`, data);
  },

  async delete(id: number) {
    return client.delete(`/products/${id}`);
  },

  async addImage(productId: number, formData: FormData) {
    return client.upload(`/products/${productId}/images`, formData);
  },

  async removeImage(productId: number, imageId: number) {
    return client.delete(`/products/${productId}/images/${imageId}`);
  },

  async setPrimaryImage(productId: number, imageId: number) {
    return client.put(`/products/${productId}/images/${imageId}/primary`);
  },
};

// =============================================
// SERVIÇOS DE BANNERS
// =============================================

export const bannerService = {
  async getActive() {
    return client.get<Banner[]>('/banners/active');
  },

  async getAll(params?: { active?: boolean }) {
    return client.get<Banner[]>('/banners', params as QueryParams);
  },

  async getById(id: number) {
    return client.get<Banner>(`/banners/${id}`);
  },

  async create(formData: FormData) {
    return client.upload<Banner>('/banners', formData);
  },

  async update(id: number, formData: FormData) {
    const url = `${API_URL}/banners/${id}`;
    const token = client.getToken();
    
    const headers: HeadersInit = {};
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(url, {
      method: 'PUT',
      headers,
      body: formData,
    });

    return response.json();
  },

  async delete(id: number) {
    return client.delete(`/banners/${id}`);
  },

  async reorder(order: { id: number; display_order: number }[]) {
    return client.put('/banners/reorder', { order });
  },
};

// =============================================
// SERVIÇOS DE COTAÇÕES
// =============================================

export const quotationService = {
  async getAll(params?: QueryParams) {
    return client.get<{ quotations: Quotation[]; pagination: Pagination }>('/quotations', params);
  },

  async getStats() {
    return client.get<QuotationStats>('/quotations/stats');
  },

  async getById(id: number) {
    return client.get<Quotation>(`/quotations/${id}`);
  },

  async create(data: QuotationFormData) {
    return client.post<{ id: number; created_at: string }>('/quotations', data);
  },

  async updateStatus(id: number, status: string, adminNotes?: string) {
    return client.put<Quotation>(`/quotations/${id}/status`, { status, admin_notes: adminNotes });
  },

  async updateNotes(id: number, notes: string) {
    return client.put<Quotation>(`/quotations/${id}/notes`, { admin_notes: notes });
  },

  async delete(id: number) {
    return client.delete(`/quotations/${id}`);
  },

  getExportUrl(params?: { status?: string; dateFrom?: string; dateTo?: string }) {
    const searchParams = new URLSearchParams();
    if (params?.status) searchParams.append('status', params.status);
    if (params?.dateFrom) searchParams.append('dateFrom', params.dateFrom);
    if (params?.dateTo) searchParams.append('dateTo', params.dateTo);
    
    const query = searchParams.toString();
    return `${API_URL}/quotations/export${query ? `?${query}` : ''}`;
  },
};

// =============================================
// SERVIÇOS DE CONFIGURAÇÕES
// =============================================

export const settingsService = {
  async getPublic() {
    return client.get<SiteSettings>('/settings/public');
  },

  async getAll() {
    return client.get<Record<string, Record<string, { value: string; type: string; description: string }>>>('/settings');
  },

  async getByGroup(group: string) {
    return client.get<Record<string, { value: string; type: string; description: string }>>(`/settings/group/${group}`);
  },

  async update(settings: Record<string, string>) {
    return client.put('/settings', settings);
  },

  async getSEO() {
    return client.get<Record<string, { value: string; type: string; description: string }>>('/settings/seo');
  },

  async updateSEO(data: Record<string, string>) {
    return client.put('/settings/seo', data);
  },

  async uploadLogo(formData: FormData, type: 'light' | 'dark' = 'light') {
    return client.upload(`/settings/logo?type=${type}`, formData);
  },

  async uploadFavicon(formData: FormData) {
    return client.upload('/settings/favicon', formData);
  },
};

export default client;
