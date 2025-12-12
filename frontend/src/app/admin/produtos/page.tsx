'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { Product, Category, Pagination } from '@/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [page, setPage] = useState(1);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (search) params.append('search', search);
      if (categoryFilter) params.append('category', categoryFilter);

      const res = await api.get(`/products?${params.toString()}`);
      setProducts(res.data.data?.products || []);
      setPagination(res.data.data?.pagination);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  useEffect(() => {
    loadProducts();
  }, [page, categoryFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadProducts();
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este produto?')) return;
    try {
      await api.delete(`/products/${id}`);
      loadProducts();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao excluir produto');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Produtos</h1>
          <p className="text-neutral-400 mt-1">Gerencie os equipamentos do catálogo</p>
        </div>
        <Link href="/admin/produtos/novo" className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Novo Produto
        </Link>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar produtos..." className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500" />
          </div>
          <select value={categoryFilter} onChange={(e) => { setCategoryFilter(e.target.value); setPage(1); }} className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
            <option value="">Todas as categorias</option>
            {categories.map((cat) => (
              <option key={cat.id} value={cat.slug}>{cat.name}</option>
            ))}
          </select>
          <button type="submit" className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors">Buscar</button>
        </form>
      </div>

      {/* Products Table */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-neutral-400 text-sm border-b border-neutral-800">
                <th className="px-6 py-4 font-medium">Produto</th>
                <th className="px-6 py-4 font-medium">Categoria</th>
                <th className="px-6 py-4 font-medium">SKU</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">Carregando...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-12 text-center text-neutral-500">Nenhum produto encontrado</td></tr>
              ) : (
                products.map((product) => (
                  <tr key={product.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-lg overflow-hidden bg-neutral-800 flex-shrink-0">
                          {product.featured_image ? (
                            <Image src={product.featured_image} alt={product.name} width={48} height={48} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center text-neutral-600">
                              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="text-white font-medium">{product.name}</p>
                          {product.is_featured && <span className="text-xs text-amber-500">Destaque</span>}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">{product.category_name || '-'}</td>
                    <td className="px-6 py-4 text-neutral-400">{product.sku || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${product.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                        {product.is_active ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <Link href={`/admin/produtos/${product.id}`} className="p-2 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Editar">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                        </Link>
                        <button onClick={() => handleDelete(product.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition-colors" title="Excluir">
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
            <p className="text-neutral-400 text-sm">
              Mostrando {((page - 1) * pagination.limit) + 1} - {Math.min(page * pagination.limit, pagination.total)} de {pagination.total}
            </p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors">Anterior</button>
              <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg transition-colors">Próximo</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
