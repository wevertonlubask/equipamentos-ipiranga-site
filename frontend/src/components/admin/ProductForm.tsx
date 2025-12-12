'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { api } from '@/lib/api';
import { Product, Category } from '@/types';
import { getUploadUrl } from '@/utils';

interface ProductFormProps {
  product?: Product;
  isEdit?: boolean;
}

export default function ProductForm({ product, isEdit }: ProductFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [formData, setFormData] = useState({
    name: product?.name || '',
    slug: product?.slug || '',
    short_description: product?.short_description || '',
    description: product?.description || '',
    category_id: product?.category_id?.toString() || '',
    sku: product?.sku || '',
    is_featured: product?.is_featured || false,
    is_active: product?.is_active ?? true,
    meta_title: product?.meta_title || '',
    meta_description: product?.meta_description || '',
    specifications: product?.specifications || {},
  });

  const [featuredImage, setFeaturedImage] = useState(product?.featured_image || '');
  const [images, setImages] = useState(product?.images || []);
  const [newSpec, setNewSpec] = useState({ key: '', value: '' });

  useEffect(() => {
    api.get('/categories').then(res => setCategories(res.data || [])).catch(() => {});
  }, []);

  const generateSlug = (name: string) => {
    return name.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'name' && !isEdit ? { slug: generateSlug(value) } : {})
    }));
  };

  const handleAddSpec = () => {
    if (newSpec.key && newSpec.value) {
      setFormData(prev => ({
        ...prev,
        specifications: { ...prev.specifications, [newSpec.key]: newSpec.value }
      }));
      setNewSpec({ key: '', value: '' });
    }
  };

  const handleRemoveSpec = (key: string) => {
    const specs = { ...formData.specifications };
    delete specs[key];
    setFormData(prev => ({ ...prev, specifications: specs }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, isPrimary = false) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploadingImage(true);
    const formDataUpload = new FormData();
    formDataUpload.append('image', file);

    try {
      if (isEdit && product?.id) {
        const res = await api.post(`/products/${product.id}/images`, formDataUpload, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        if (isPrimary) {
          setFeaturedImage(res.data.image_url);
        }
        setImages(res.data.images || []);
      } else {
        // For new products, just preview the image
        const reader = new FileReader();
        reader.onload = (e) => {
          if (isPrimary) {
            setFeaturedImage(e.target?.result as string);
          }
        };
        reader.readAsDataURL(file);
      }
    } catch (error) {
      console.error('Erro no upload:', error);
      alert('Erro ao fazer upload da imagem');
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        ...formData,
        category_id: parseInt(formData.category_id),
      };

      if (isEdit && product?.id) {
        await api.put(`/products/${product.id}`, payload);
      } else {
        await api.post('/products', payload);
      }

      router.push('/admin/produtos');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar produto');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-bold text-white mb-4">Informações Básicas</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Nome do Produto *</label>
                <input type="text" name="name" value={formData.name} onChange={handleChange} required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Slug (URL)</label>
                <input type="text" name="slug" value={formData.slug} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Categoria *</label>
                  <select name="category_id" value={formData.category_id} onChange={handleChange} required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                    <option value="">Selecione...</option>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">SKU / Código</label>
                  <input type="text" name="sku" value={formData.sku} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Descrição Curta</label>
                <textarea name="short_description" value={formData.short_description} onChange={handleChange} rows={2} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none" />
              </div>

              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Descrição Completa</label>
                <textarea name="description" value={formData.description} onChange={handleChange} rows={6} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none" />
              </div>
            </div>
          </div>

          {/* Specifications */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-bold text-white mb-4">Especificações Técnicas</h2>
            
            <div className="space-y-4">
              {Object.entries(formData.specifications).map(([key, value]) => (
                <div key={key} className="flex items-center gap-2">
                  <div className="flex-1 grid grid-cols-2 gap-2">
                    <input type="text" value={key} disabled className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-400" />
                    <input type="text" value={value as string} disabled className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-neutral-400" />
                  </div>
                  <button type="button" onClick={() => handleRemoveSpec(key)} className="p-2 text-red-500 hover:bg-red-500/20 rounded-lg transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                </div>
              ))}

              <div className="flex items-center gap-2">
                <div className="flex-1 grid grid-cols-2 gap-2">
                  <input type="text" value={newSpec.key} onChange={(e) => setNewSpec(prev => ({ ...prev, key: e.target.value }))} placeholder="Ex: Dimensões" className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                  <input type="text" value={newSpec.value} onChange={(e) => setNewSpec(prev => ({ ...prev, value: e.target.value }))} placeholder="Ex: 120x80x150cm" className="px-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                </div>
                <button type="button" onClick={handleAddSpec} className="p-2 text-amber-500 hover:bg-amber-500/20 rounded-lg transition-colors">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                </button>
              </div>
            </div>
          </div>

          {/* SEO */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-bold text-white mb-4">SEO</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Meta Title</label>
                <input type="text" name="meta_title" value={formData.meta_title} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-neutral-300 mb-2">Meta Description</label>
                <textarea name="meta_description" value={formData.meta_description} onChange={handleChange} rows={3} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none" />
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Status */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-bold text-white mb-4">Status</h2>
            
            <div className="space-y-4">
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-amber-500" />
                <span className="text-white">Produto ativo</span>
              </label>
              <label className="flex items-center gap-3 cursor-pointer">
                <input type="checkbox" name="is_featured" checked={formData.is_featured} onChange={handleChange} className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-amber-500" />
                <span className="text-white">Destacar na home</span>
              </label>
            </div>
          </div>

          {/* Featured Image */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <h2 className="text-lg font-bold text-white mb-4">Imagem Principal</h2>
            
            <div className="space-y-4">
              {featuredImage ? (
                <div className="relative aspect-square rounded-lg overflow-hidden bg-neutral-800">
                  <Image src={featuredImage.startsWith('data:') ? featuredImage : getUploadUrl(featuredImage)} alt="Preview" fill className="object-cover" />
                </div>
              ) : (
                <div className="aspect-square rounded-lg bg-neutral-800 flex items-center justify-center">
                  <svg className="w-16 h-16 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
                </div>
              )}
              
              <label className="block">
                <span className="sr-only">Escolher imagem</span>
                <input type="file" accept="image/*" onChange={(e) => handleImageUpload(e, true)} disabled={uploadingImage} className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-amber-500 file:text-neutral-900 file:font-semibold hover:file:bg-amber-400 file:cursor-pointer cursor-pointer" />
              </label>
            </div>
          </div>

          {/* Actions */}
          <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800">
            <div className="space-y-3">
              <button type="submit" disabled={loading} className="w-full py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-900 font-bold rounded-lg transition-colors">
                {loading ? 'Salvando...' : (isEdit ? 'Atualizar Produto' : 'Criar Produto')}
              </button>
              <button type="button" onClick={() => router.back()} className="w-full py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">
                Cancelar
              </button>
            </div>
          </div>
        </div>
      </div>
    </form>
  );
}
