'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { api } from '@/lib/api';

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');

  useEffect(() => {
    api.get('/settings').then(res => {
      const data: Record<string, string> = {};
      (res.data.data || []).forEach((s: any) => { data[s.setting_key] = s.setting_value || ''; });
      setSettings(data);
    }).catch(console.error).finally(() => setLoading(false));
  }, []);

  const handleChange = (key: string, value: string) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await api.put('/settings', settings);
      alert('Configurações salvas com sucesso!');
    } catch (e: any) {
      alert(e.response?.data?.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: '⚙️' },
    { id: 'contact', label: 'Contato', icon: '📞' },
    { id: 'social', label: 'Redes Sociais', icon: '🌐' },
    { id: 'seo', label: 'SEO', icon: '🔍' },
  ];

  const fields: Record<string, { key: string; label: string; type?: string; placeholder?: string }[]> = {
    general: [
      { key: 'site_name', label: 'Nome do Site', placeholder: 'Ipiranga Fitness' },
      { key: 'site_description', label: 'Descrição do Site', type: 'textarea' },
      { key: 'site_logo', label: 'URL do Logo', placeholder: 'https://...' },
      { key: 'site_logo_dark', label: 'URL do Logo (Versão Dark)', placeholder: 'https://...' },
      { key: 'site_favicon', label: 'URL do Favicon', placeholder: 'https://...' },
    ],
    contact: [
      { key: 'contact_email', label: 'E-mail', placeholder: 'contato@empresa.com' },
      { key: 'contact_phone', label: 'Telefone', placeholder: '(18) 3333-3333' },
      { key: 'contact_whatsapp', label: 'WhatsApp (apenas números)', placeholder: '5518999999999' },
      { key: 'contact_address', label: 'Endereço', type: 'textarea' },
    ],
    social: [
      { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
      { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
      { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
      { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
    ],
    seo: [
      { key: 'meta_title', label: 'Meta Title Padrão', placeholder: 'Título para buscadores' },
      { key: 'meta_description', label: 'Meta Description Padrão', type: 'textarea', placeholder: 'Descrição para buscadores' },
      { key: 'meta_keywords', label: 'Meta Keywords', placeholder: 'palavra1, palavra2, palavra3' },
      { key: 'google_analytics', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX' },
      { key: 'google_tag_manager', label: 'Google Tag Manager ID', placeholder: 'GTM-XXXXXXX' },
    ],
  };

  if (loading) return <div className="p-8"><div className="text-center py-20 text-neutral-500">Carregando configurações...</div></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Configurações</h1><p className="text-neutral-400 mt-1">Gerencie as configurações do site</p></div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-900 font-bold rounded-lg flex items-center gap-2">
          {saving ? 'Salvando...' : 'Salvar Alterações'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full px-6 py-4 text-left flex items-center gap-3 transition-colors ${activeTab === tab.id ? 'bg-amber-500 text-neutral-900 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}>
                <span>{tab.icon}</span>{tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">{tabs.find(t => t.id === activeTab)?.label}</h2>
            <div className="space-y-6">
              {fields[activeTab]?.map(field => (
                <div key={field.key}>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">{field.label}</label>
                  {field.type === 'textarea' ? (
                    <textarea value={settings[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} rows={3} placeholder={field.placeholder} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none" />
                  ) : (
                    <input type="text" value={settings[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} placeholder={field.placeholder} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500" />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Logo Preview */}
          {activeTab === 'general' && settings.site_logo && (
            <div className="mt-6 bg-neutral-900 rounded-xl border border-neutral-800 p-6">
              <h3 className="text-lg font-bold text-white mb-4">Preview do Logo</h3>
              <div className="flex gap-8">
                <div className="p-8 bg-white rounded-lg">
                  <img src={settings.site_logo} alt="Logo" className="h-12 object-contain" />
                </div>
                <div className="p-8 bg-neutral-950 rounded-lg">
                  <img src={settings.site_logo_dark || settings.site_logo} alt="Logo Dark" className="h-12 object-contain" />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
