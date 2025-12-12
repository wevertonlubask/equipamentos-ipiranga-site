'use client';

import { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Banner } from '@/types';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001/api';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    link_url: '',
    button_text: '',
    is_active: true
  });
  
  const [imageDesktopFile, setImageDesktopFile] = useState<File | null>(null);
  const [imageMobileFile, setImageMobileFile] = useState<File | null>(null);
  const [imageDesktopPreview, setImageDesktopPreview] = useState('');
  const [imageMobilePreview, setImageMobilePreview] = useState('');
  
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const mobileInputRef = useRef<HTMLInputElement>(null);

  const getToken = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('admin_token') || localStorage.getItem('token');
    }
    return null;
  };

  const loadBanners = async () => {
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/banners`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setBanners(data.data || []);
    } catch (e) {
      console.error('Erro ao carregar banners:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, type: 'desktop' | 'mobile') => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Formato inválido. Use JPG, PNG ou WebP.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 10MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === 'desktop') {
        setImageDesktopFile(file);
        setImageDesktopPreview(event.target?.result as string);
      } else {
        setImageMobileFile(file);
        setImageMobilePreview(event.target?.result as string);
      }
    };
    reader.readAsDataURL(file);
  };

  const getImageUrl = (path: string) => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    if (path.startsWith('data:')) return path;
    return `${API_URL.replace('/api', '')}/uploads${path}`;
  };

  const openModal = (banner?: Banner) => {
    setError('');
    if (banner) {
      setEditingBanner(banner);
      setFormData({
        title: banner.title || '',
        subtitle: banner.subtitle || '',
        link_url: banner.link_url || '',
        button_text: banner.button_text || '',
        is_active: banner.is_active
      });
      setImageDesktopPreview(banner.image_desktop ? getImageUrl(banner.image_desktop) : '');
      setImageMobilePreview(banner.image_mobile ? getImageUrl(banner.image_mobile) : '');
    } else {
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', link_url: '', button_text: '', is_active: true });
      setImageDesktopPreview('');
      setImageMobilePreview('');
    }
    setImageDesktopFile(null);
    setImageMobileFile(null);
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSaving(true);

    try {
      const token = getToken();
      const formDataToSend = new FormData();
      
      formDataToSend.append('title', formData.title);
      formDataToSend.append('subtitle', formData.subtitle);
      formDataToSend.append('link_url', formData.link_url);
      formDataToSend.append('button_text', formData.button_text);
      formDataToSend.append('is_active', String(formData.is_active));
      
      if (imageDesktopFile) {
        formDataToSend.append('image_desktop', imageDesktopFile);
      }
      if (imageMobileFile) {
        formDataToSend.append('image_mobile', imageMobileFile);
      }

      if (!editingBanner && !imageDesktopFile) {
        setError('Selecione uma imagem desktop para o banner');
        setSaving(false);
        return;
      }

      const url = editingBanner 
        ? `${API_URL}/banners/${editingBanner.id}`
        : `${API_URL}/banners`;
      
      const method = editingBanner ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Authorization': `Bearer ${token}` },
        body: formDataToSend
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Erro ao salvar banner');
      }

      setShowModal(false);
      loadBanners();
    } catch (error: any) {
      console.error('Erro:', error);
      setError(error.message || 'Erro ao salvar banner');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Tem certeza que deseja excluir este banner?')) return;
    
    try {
      const token = getToken();
      const res = await fetch(`${API_URL}/banners/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Erro ao excluir');
      }
      
      loadBanners();
    } catch (e: any) {
      alert(e.message || 'Erro ao excluir banner');
    }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Banners</h1>
          <p className="text-neutral-400 mt-1">Gerencie os banners do carrossel da home</p>
        </div>
        <button 
          onClick={() => openModal()} 
          className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg flex items-center gap-2 transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Novo Banner
        </button>
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-neutral-500">Carregando...</div>
        ) : banners.length === 0 ? (
          <div className="text-center py-12 text-neutral-500">
            <svg className="w-16 h-16 mx-auto mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p>Nenhum banner cadastrado</p>
            <button onClick={() => openModal()} className="mt-4 text-amber-500 hover:text-amber-400">
              Criar primeiro banner
            </button>
          </div>
        ) : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-64 h-36 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                {banner.image_desktop ? (
                  <img 
                    src={getImageUrl(banner.image_desktop)} 
                    alt={banner.title || 'Banner'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-neutral-600">
                    <svg className="w-12 h-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{banner.title || 'Sem título'}</h3>
                    <p className="text-neutral-400 text-sm mt-1">{banner.subtitle || 'Sem subtítulo'}</p>
                    {banner.link_url && (
                      <p className="text-neutral-500 text-xs mt-2">Link: {banner.link_url}</p>
                    )}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                    banner.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'
                  }`}>
                    {banner.is_active ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openModal(banner)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm transition-colors">Editar</button>
                  <button onClick={() => handleDelete(banner.id)} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm transition-colors">Excluir</button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowModal(false)} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl bg-neutral-900 rounded-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-800">
                <h2 className="text-xl font-bold text-white">{editingBanner ? 'Editar Banner' : 'Novo Banner'}</h2>
              </div>
              
              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                {error && (
                  <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">{error}</div>
                )}

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Imagem Desktop (1920x700) *</label>
                  <div 
                    onClick={() => desktopInputRef.current?.click()}
                    className="relative w-full h-48 bg-neutral-800 border-2 border-dashed border-neutral-700 rounded-lg overflow-hidden cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    {imageDesktopPreview ? (
                      <img src={imageDesktopPreview} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
                        <svg className="w-12 h-12 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span>Clique para selecionar imagem</span>
                        <span className="text-xs mt-1">JPG, PNG ou WebP (máx. 10MB)</span>
                      </div>
                    )}
                  </div>
                  <input ref={desktopInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, 'desktop')} className="hidden" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Imagem Mobile (768x500) - Opcional</label>
                  <div 
                    onClick={() => mobileInputRef.current?.click()}
                    className="relative w-full h-32 bg-neutral-800 border-2 border-dashed border-neutral-700 rounded-lg overflow-hidden cursor-pointer hover:border-amber-500 transition-colors"
                  >
                    {imageMobilePreview ? (
                      <img src={imageMobilePreview} alt="Preview Mobile" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-neutral-500">
                        <svg className="w-8 h-8 mb-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm">Imagem para mobile (opcional)</span>
                      </div>
                    )}
                  </div>
                  <input ref={mobileInputRef} type="file" accept="image/jpeg,image/png,image/webp" onChange={(e) => handleImageChange(e, 'mobile')} className="hidden" />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Título</label>
                    <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Título do banner" className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Subtítulo</label>
                    <input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} placeholder="Subtítulo do banner" className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Link</label>
                    <input type="text" name="link_url" value={formData.link_url} onChange={handleChange} placeholder="/equipamentos" className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Texto do Botão</label>
                    <input type="text" name="button_text" value={formData.button_text} onChange={handleChange} placeholder="Ver mais" className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <label className="flex items-center gap-3 cursor-pointer">
                  <input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-amber-500 focus:ring-amber-500" />
                  <span className="text-white">Banner ativo</span>
                </label>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">Cancelar</button>
                  <button type="submit" disabled={saving} className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-neutral-900 font-bold rounded-lg transition-colors flex items-center justify-center gap-2">
                    {saving ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Salvando...
                      </>
                    ) : 'Salvar'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
