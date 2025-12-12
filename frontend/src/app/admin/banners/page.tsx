'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Banner } from '@/types';

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingBanner, setEditingBanner] = useState<Banner | null>(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', link_url: '', link_target: '_self' as '_self' | '_blank', button_text: '', is_active: true });
  const [imagePreview, setImagePreview] = useState('');

  const loadBanners = async () => {
    try { const res = await api.get('/banners'); setBanners(res.data.data || []); } 
    catch (e) { console.error(e); } finally { setLoading(false); }
  };

  useEffect(() => { loadBanners(); }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const openModal = (banner?: Banner) => {
    if (banner) {
      setEditingBanner(banner);
      setFormData({ title: banner.title || '', subtitle: banner.subtitle || '', link_url: banner.link_url || '', link_target: banner.link_target || '_self', button_text: banner.button_text || '', is_active: banner.is_active });
      setImagePreview(banner.image_desktop || '');
    } else {
      setEditingBanner(null);
      setFormData({ title: '', subtitle: '', link_url: '', link_target: '_self', button_text: '', is_active: true });
      setImagePreview('');
    }
    setShowModal(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const payload = { ...formData, image_desktop: imagePreview };
      if (editingBanner) await api.put(`/banners/${editingBanner.id}`, payload);
      else await api.post('/banners', payload);
      setShowModal(false);
      loadBanners();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Erro ao salvar banner');
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este banner?')) return;
    try { await api.delete(`/banners/${id}`); loadBanners(); } 
    catch (e: any) { alert(e.response?.data?.message || 'Erro'); }
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Banners</h1><p className="text-neutral-400 mt-1">Gerencie os banners da home</p></div>
        <button onClick={() => openModal()} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>Novo Banner
        </button>
      </div>

      <div className="space-y-4">
        {loading ? <div className="text-center py-12 text-neutral-500">Carregando...</div> : banners.length === 0 ? <div className="text-center py-12 text-neutral-500">Nenhum banner</div> : (
          banners.map((banner) => (
            <div key={banner.id} className="bg-neutral-900 rounded-xl border border-neutral-800 p-4 flex flex-col md:flex-row gap-4">
              <div className="relative w-full md:w-48 h-28 bg-neutral-800 rounded-lg overflow-hidden flex-shrink-0">
                {banner.image_desktop && <Image src={banner.image_desktop} alt="" fill className="object-cover" />}
              </div>
              <div className="flex-1">
                <div className="flex items-start justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white">{banner.title || 'Sem título'}</h3>
                    <p className="text-neutral-400 text-sm">{banner.subtitle || 'Sem subtítulo'}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${banner.is_active ? 'bg-green-500/20 text-green-500' : 'bg-red-500/20 text-red-500'}`}>{banner.is_active ? 'Ativo' : 'Inativo'}</span>
                </div>
                <div className="flex gap-2 mt-4">
                  <button onClick={() => openModal(banner)} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg text-sm">Editar</button>
                  <button onClick={() => handleDelete(banner.id)} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-500 rounded-lg text-sm">Excluir</button>
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
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-lg bg-neutral-900 rounded-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-800"><h2 className="text-xl font-bold text-white">{editingBanner ? 'Editar' : 'Novo'} Banner</h2></div>
              <form onSubmit={handleSubmit} className="p-6 space-y-4">
                <div><label className="block text-sm font-medium text-neutral-300 mb-2">Título</label><input type="text" name="title" value={formData.title} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm font-medium text-neutral-300 mb-2">Subtítulo</label><input type="text" name="subtitle" value={formData.subtitle} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm font-medium text-neutral-300 mb-2">URL da Imagem</label><input type="text" value={imagePreview} onChange={(e) => setImagePreview(e.target.value)} placeholder="https://..." className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm font-medium text-neutral-300 mb-2">Link</label><input type="text" name="link_url" value={formData.link_url} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" /></div>
                <div><label className="block text-sm font-medium text-neutral-300 mb-2">Texto do Botão</label><input type="text" name="button_text" value={formData.button_text} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" /></div>
                <label className="flex items-center gap-3"><input type="checkbox" name="is_active" checked={formData.is_active} onChange={handleChange} className="w-5 h-5 rounded bg-neutral-800 border-neutral-700 text-amber-500" /><span className="text-white">Ativo</span></label>
                <div className="flex gap-3 pt-4">
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg">Cancelar</button>
                  <button type="submit" className="flex-1 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg">Salvar</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}