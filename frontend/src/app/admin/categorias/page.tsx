'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Category } from '@/types';
import { getUploadUrl } from '@/utils';

export default function AdminCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [formData, setFormData] = useState({ name: '', slug: '', description: '', is_active: true, meta_title: '', meta_description: '' });

  const loadCategories = async () => {
    try {
      const res = await api.get('/categories');
      // res já é o JSON: { success: true, data: [...] }
      setCategories(res.data || []);
    } catch (error) {
      console.error('Erro ao carregar categorias:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadCategories(); }, []);

  const generateSlug = (name: string) => name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !editingCategory ? { slug: generateSlug(value) } : {})
    }));
  };

  const openModal = (category?: Category) => {
    if (category) {
      setEditingCategory(category);
      setFormData({ name: category.name, slug: category.slug, description: category.description || '', is_active: category.is_active, meta_title: category.meta_title || '', meta_description: category.meta_description || '' });
    } else {
      setEditingCategory(null);
      setFormData({ name: '', slug: '', description: '', is_active: true, meta_title: '', meta_description: '' });
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingCategory) {
        await api.put(`/categories/${editingCategory.id}`, formData);
      } else {
        await api.post('/categories', formData);
      }
      setShowModal(false);
      loadCategories();
    } catch (error: any) {
      console.error('Erro ao salvar categoria:', error);
      alert(error.message || 'Erro ao salvar categoria');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir esta categoria?')) return;
    try {
      await api.delete(`/categories/${id}`);
      loadCategories();
    } catch (error: any) {
      console.error('Erro ao excluir categoria:', error);
      alert(error.message || 'Erro ao excluir categoria');
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Categorias</h1>
          <p className="text-neutral-400 mt-1">Organize os equipamentos em categorias</p>
        </div>
        <button onClick={() => openModal()} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
          Nova Categoria
        </button>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 animate-pulse">
              <div className="h-6 bg-neutral-800 rounded w-2/3 mb-2" />
              <div className="h-4 bg-neutral-800 rounded w-1/2" />
            </div>
          ))
        ) : categories.length === 0 ? (
          <div className="col-span-full text-center py-12 text-neutral-500">Nenhuma categoria encontrada</div>
        ) : (
          categories.map((category) => (
            <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
              {category.image && (
                <div className="relative h-32 bg-neutral-800">
                  <Image src={getUploadUrl(category.image)} alt={category.name} fill className="object-cover" />
                </div>
              )}
              <div className="p-6">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-lg font-bold text-white">{category.name}</h3>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${category.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>
                    {category.is_active ? 'Ativa' : 'Inativa'}
                  </span>
                </div>
                <p className="text-neutral-400 text-sm mb-4 line-clamp-2">{category.description || 'Sem descrição'}</p>
                <div className="flex items-center justify-between">
                  <span className="text-neutral-500 text-sm">{category.product_count || 0} produtos</span>
                  <div className="flex gap-2">
                    <button onClick={() => openModal(category)} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" /></svg>
                    </button>
                    <button onClick={() => handleDelete(category.id)} className="p-2 rounded-lg hover:bg-red-500/20 text-neutral-400 hover:text-red-500 transition-colors">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" /></svg>
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>

      {/* Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-neutral-900 rounded-2xl">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-white">{editingCategory ? 'Editar Categoria' : 'Nova Categoria'}</h2>
              </div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Nome *</label>
                  <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Slug (URL)</label>
                  <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Descrição</label>
                  <textarea name="description" value={formData.description} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Meta Title (SEO)</label>
                  <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Meta Description (SEO)</label>
                  <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none" />
                </div>
                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-amber-500" />
                  <span className="text-white">Categoria ativa</span>
                </label>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg transition-colors">Salvar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
