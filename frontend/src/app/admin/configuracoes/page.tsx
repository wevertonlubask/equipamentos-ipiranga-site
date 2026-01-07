'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { getUploadUrl } from '@/utils';

// Cores predefinidas para facilitar a escolha
const presetColors = {
  primary: [
    { name: 'Vermelho Ipiranga', value: '#c02c2a' },
    { name: 'Vermelho Escuro', value: '#991b1b' },
    { name: 'Laranja', value: '#ea580c' },
    { name: 'Amber', value: '#d97706' },
    { name: 'Verde', value: '#16a34a' },
    { name: 'Azul', value: '#2563eb' },
    { name: 'Indigo', value: '#4f46e5' },
    { name: 'Roxo', value: '#7c3aed' },
    { name: 'Rosa', value: '#db2777' },
    { name: 'Cinza', value: '#475569' },
  ],
  secondary: [
    { name: 'Cinza Escuro', value: '#1f2937' },
    { name: 'Slate', value: '#334155' },
    { name: 'Zinc', value: '#3f3f46' },
    { name: 'Neutral', value: '#404040' },
    { name: 'Stone', value: '#44403c' },
  ],
  accent: [
    { name: 'Dourado', value: '#eab308' },
    { name: 'Amber', value: '#f59e0b' },
    { name: 'Laranja', value: '#f97316' },
    { name: 'Verde Limao', value: '#84cc16' },
    { name: 'Ciano', value: '#06b6d4' },
    { name: 'Rosa', value: '#ec4899' },
  ]
};

export default function AdminSettingsPage() {
  const [settings, setSettings] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('general');
  const [uploading, setUploading] = useState<string | null>(null);

  useEffect(() => {
    api.get('/settings').then(res => {
      const data: Record<string, string> = {};
      (res.data || []).forEach((s: any) => { data[s.setting_key] = s.setting_value || ''; });
      // Definir cores padrao se nao existirem
      if (!data.theme_primary) data.theme_primary = '#c02c2a';
      if (!data.theme_secondary) data.theme_secondary = '#1f2937';
      if (!data.theme_accent) data.theme_accent = '#eab308';
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
      alert('Configuracoes salvas com sucesso! Recarregue a pagina para ver as alteracoes de cor.');
    } catch (e: any) {
      console.error('Erro ao salvar configuracoes:', e);
      alert(e.message || 'Erro ao salvar');
    } finally {
      setSaving(false);
    }
  };

  const handleImageUpload = async (
    e: React.ChangeEvent<HTMLInputElement>,
    type: 'logo' | 'logo_dark' | 'favicon'
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      alert('Tipo de arquivo nao permitido. Use: JPG, PNG ou WebP');
      return;
    }

    setUploading(type);

    try {
      const formData = new FormData();

      if (type === 'favicon') {
        formData.append('favicon', file);
        const res = await api.upload<{ url: string }>('/settings/favicon', formData);
        if (res.data?.url) {
          setSettings(prev => ({ ...prev, site_favicon: res.data!.url }));
        }
      } else {
        formData.append('logo', file);
        const logoType = type === 'logo_dark' ? 'dark' : 'light';
        const res = await api.upload<{ url: string }>(`/settings/logo?type=${logoType}`, formData);
        if (res.data?.url) {
          const settingKey = type === 'logo_dark' ? 'site_logo_dark' : 'site_logo';
          setSettings(prev => ({ ...prev, [settingKey]: res.data!.url }));
        }
      }

      alert('Imagem enviada com sucesso!');
    } catch (error: any) {
      console.error('Erro no upload:', error);
      alert(error.message || 'Erro ao fazer upload da imagem');
    } finally {
      setUploading(null);
      e.target.value = '';
    }
  };

  const tabs = [
    { id: 'general', label: 'Geral', icon: 'cog' },
    { id: 'appearance', label: 'Aparencia', icon: 'palette' },
    { id: 'contact', label: 'Contato', icon: 'phone' },
    { id: 'social', label: 'Redes Sociais', icon: 'globe' },
    { id: 'seo', label: 'SEO', icon: 'search' },
  ];

  const fields: Record<string, { key: string; label: string; type?: string; placeholder?: string }[]> = {
    general: [
      { key: 'site_name', label: 'Nome do Site', placeholder: 'Ipiranga Fitness' },
      { key: 'site_description', label: 'Descricao do Site', type: 'textarea' },
    ],
    contact: [
      { key: 'contact_email', label: 'E-mail', placeholder: 'contato@empresa.com' },
      { key: 'contact_phone', label: 'Telefone', placeholder: '(18) 3333-3333' },
      { key: 'contact_whatsapp', label: 'WhatsApp (apenas numeros)', placeholder: '5518999999999' },
      { key: 'contact_address', label: 'Endereco', type: 'textarea' },
    ],
    social: [
      { key: 'social_instagram', label: 'Instagram', placeholder: 'https://instagram.com/...' },
      { key: 'social_facebook', label: 'Facebook', placeholder: 'https://facebook.com/...' },
      { key: 'social_youtube', label: 'YouTube', placeholder: 'https://youtube.com/...' },
      { key: 'social_linkedin', label: 'LinkedIn', placeholder: 'https://linkedin.com/...' },
    ],
    seo: [
      { key: 'meta_title', label: 'Meta Title Padrao', placeholder: 'Titulo para buscadores' },
      { key: 'meta_description', label: 'Meta Description Padrao', type: 'textarea', placeholder: 'Descricao para buscadores' },
      { key: 'meta_keywords', label: 'Meta Keywords', placeholder: 'palavra1, palavra2, palavra3' },
      { key: 'google_analytics', label: 'Google Analytics ID', placeholder: 'G-XXXXXXXXXX' },
      { key: 'google_tag_manager', label: 'Google Tag Manager ID', placeholder: 'GTM-XXXXXXX' },
    ],
  };

  const getImageSrc = (url: string) => {
    if (!url) return '';
    if (url.startsWith('http://') || url.startsWith('https://')) {
      return url;
    }
    return getUploadUrl(url);
  };

  if (loading) return <div className="p-8"><div className="text-center py-20 text-neutral-500">Carregando configuracoes...</div></div>;

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div><h1 className="text-3xl font-bold text-white">Configuracoes</h1><p className="text-neutral-400 mt-1">Gerencie as configuracoes do site</p></div>
        <button onClick={handleSave} disabled={saving} className="px-6 py-3 bg-primary-600 hover:bg-primary-500 disabled:opacity-50 text-white font-bold rounded-lg flex items-center gap-2 transition-colors">
          {saving ? 'Salvando...' : 'Salvar Alteracoes'}
        </button>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Tabs */}
        <div className="lg:w-64 flex-shrink-0">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
            {tabs.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`w-full px-6 py-4 text-left flex items-center gap-3 transition-colors ${activeTab === tab.id ? 'bg-primary-600 text-white font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'}`}>
                <TabIcon name={tab.icon} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1">
          <div className="bg-neutral-900 rounded-xl border border-neutral-800 p-6">
            <h2 className="text-xl font-bold text-white mb-6">{tabs.find(t => t.id === activeTab)?.label}</h2>

            {/* Aba Aparencia - Personalizacao de Cores */}
            {activeTab === 'appearance' && (
              <div className="space-y-8">
                {/* Preview */}
                <div className="p-6 bg-neutral-800 rounded-xl border border-neutral-700">
                  <h3 className="text-lg font-semibold text-white mb-4">Preview</h3>
                  <div className="flex flex-wrap gap-4">
                    <button
                      style={{ backgroundColor: settings.theme_primary || '#c02c2a' }}
                      className="px-6 py-3 text-white font-bold rounded-lg transition-opacity hover:opacity-90"
                    >
                      Botao Primario
                    </button>
                    <button
                      style={{ backgroundColor: settings.theme_secondary || '#1f2937' }}
                      className="px-6 py-3 text-white font-bold rounded-lg transition-opacity hover:opacity-90"
                    >
                      Botao Secundario
                    </button>
                    <button
                      style={{ backgroundColor: settings.theme_accent || '#eab308' }}
                      className="px-6 py-3 text-neutral-900 font-bold rounded-lg transition-opacity hover:opacity-90"
                    >
                      Botao Destaque
                    </button>
                  </div>
                  <div className="mt-4 flex gap-4">
                    <div
                      style={{ backgroundColor: settings.theme_primary || '#c02c2a' }}
                      className="w-20 h-20 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">Primaria</span>
                    </div>
                    <div
                      style={{ backgroundColor: settings.theme_secondary || '#1f2937' }}
                      className="w-20 h-20 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-white text-xs font-bold">Secundaria</span>
                    </div>
                    <div
                      style={{ backgroundColor: settings.theme_accent || '#eab308' }}
                      className="w-20 h-20 rounded-lg flex items-center justify-center"
                    >
                      <span className="text-neutral-900 text-xs font-bold">Destaque</span>
                    </div>
                  </div>
                </div>

                {/* Cor Primaria */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Cor Primaria (Botoes, Links, Destaques)
                  </label>
                  <div className="flex items-center gap-4 mb-3">
                    <input
                      type="color"
                      value={settings.theme_primary || '#c02c2a'}
                      onChange={(e) => handleChange('theme_primary', e.target.value)}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-neutral-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.theme_primary || '#c02c2a'}
                      onChange={(e) => handleChange('theme_primary', e.target.value)}
                      placeholder="#c02c2a"
                      className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.primary.map(color => (
                      <button
                        key={color.value}
                        onClick={() => handleChange('theme_primary', color.value)}
                        style={{ backgroundColor: color.value }}
                        className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${settings.theme_primary === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : ''}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Cor Secundaria */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Cor Secundaria (Fundo de secoes, Cards)
                  </label>
                  <div className="flex items-center gap-4 mb-3">
                    <input
                      type="color"
                      value={settings.theme_secondary || '#1f2937'}
                      onChange={(e) => handleChange('theme_secondary', e.target.value)}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-neutral-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.theme_secondary || '#1f2937'}
                      onChange={(e) => handleChange('theme_secondary', e.target.value)}
                      placeholder="#1f2937"
                      className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.secondary.map(color => (
                      <button
                        key={color.value}
                        onClick={() => handleChange('theme_secondary', color.value)}
                        style={{ backgroundColor: color.value }}
                        className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${settings.theme_secondary === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : ''}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Cor de Destaque */}
                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-3">
                    Cor de Destaque (CTAs, Badges, Alertas)
                  </label>
                  <div className="flex items-center gap-4 mb-3">
                    <input
                      type="color"
                      value={settings.theme_accent || '#eab308'}
                      onChange={(e) => handleChange('theme_accent', e.target.value)}
                      className="w-16 h-12 rounded-lg cursor-pointer border-2 border-neutral-700 bg-transparent"
                    />
                    <input
                      type="text"
                      value={settings.theme_accent || '#eab308'}
                      onChange={(e) => handleChange('theme_accent', e.target.value)}
                      placeholder="#eab308"
                      className="flex-1 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 font-mono"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {presetColors.accent.map(color => (
                      <button
                        key={color.value}
                        onClick={() => handleChange('theme_accent', color.value)}
                        style={{ backgroundColor: color.value }}
                        className={`w-10 h-10 rounded-lg transition-all hover:scale-110 ${settings.theme_accent === color.value ? 'ring-2 ring-white ring-offset-2 ring-offset-neutral-900' : ''}`}
                        title={color.name}
                      />
                    ))}
                  </div>
                </div>

                {/* Restaurar Padrao */}
                <div className="pt-4 border-t border-neutral-800">
                  <button
                    onClick={() => {
                      handleChange('theme_primary', '#c02c2a');
                      handleChange('theme_secondary', '#1f2937');
                      handleChange('theme_accent', '#eab308');
                    }}
                    className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-lg transition-colors text-sm"
                  >
                    Restaurar Cores Padrao
                  </button>
                </div>
              </div>
            )}

            {/* Outras abas */}
            {activeTab !== 'appearance' && (
              <div className="space-y-6">
                {fields[activeTab]?.map(field => (
                  <div key={field.key}>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">{field.label}</label>
                    {field.type === 'textarea' ? (
                      <textarea value={settings[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} rows={3} placeholder={field.placeholder} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500 resize-none" />
                    ) : (
                      <input type="text" value={settings[field.key] || ''} onChange={(e) => handleChange(field.key, e.target.value)} placeholder={field.placeholder} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-primary-500" />
                    )}
                  </div>
                ))}

                {/* Upload de Imagens - apenas na aba Geral */}
                {activeTab === 'general' && (
                  <div className="space-y-6 pt-6 border-t border-neutral-800">
                    <h3 className="text-lg font-semibold text-white">Imagens do Site</h3>
                    <p className="text-neutral-400 text-sm">Formatos aceitos: JPG, PNG, WebP</p>

                    {/* Logo Principal */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Logo Principal</label>
                      <div className="flex items-start gap-4">
                        <div className="w-48 h-24 bg-white rounded-lg flex items-center justify-center overflow-hidden">
                          {settings.site_logo ? (
                            <img src={getImageSrc(settings.site_logo)} alt="Logo" className="max-h-20 max-w-full object-contain" />
                          ) : (
                            <span className="text-neutral-400 text-sm">Sem logo</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="block">
                            <span className="sr-only">Escolher logo</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) => handleImageUpload(e, 'logo')}
                              disabled={uploading === 'logo'}
                              className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:font-semibold hover:file:bg-primary-500 file:cursor-pointer cursor-pointer disabled:opacity-50"
                            />
                          </label>
                          {uploading === 'logo' && <p className="text-primary-500 text-sm mt-2">Enviando...</p>}
                          <p className="text-neutral-500 text-xs mt-2">Recomendado: fundo transparente (PNG/WebP)</p>
                        </div>
                      </div>
                    </div>

                    {/* Logo Dark */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Logo (Versao Dark)</label>
                      <div className="flex items-start gap-4">
                        <div className="w-48 h-24 bg-neutral-950 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-700">
                          {(settings.site_logo_dark || settings.site_logo) ? (
                            <img src={getImageSrc(settings.site_logo_dark || settings.site_logo)} alt="Logo Dark" className="max-h-20 max-w-full object-contain" />
                          ) : (
                            <span className="text-neutral-500 text-sm">Sem logo</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="block">
                            <span className="sr-only">Escolher logo dark</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) => handleImageUpload(e, 'logo_dark')}
                              disabled={uploading === 'logo_dark'}
                              className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:font-semibold hover:file:bg-primary-500 file:cursor-pointer cursor-pointer disabled:opacity-50"
                            />
                          </label>
                          {uploading === 'logo_dark' && <p className="text-primary-500 text-sm mt-2">Enviando...</p>}
                          <p className="text-neutral-500 text-xs mt-2">Versao clara do logo para fundos escuros</p>
                        </div>
                      </div>
                    </div>

                    {/* Favicon */}
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Favicon</label>
                      <div className="flex items-start gap-4">
                        <div className="w-16 h-16 bg-neutral-800 rounded-lg flex items-center justify-center overflow-hidden border border-neutral-700">
                          {settings.site_favicon ? (
                            <img src={getImageSrc(settings.site_favicon)} alt="Favicon" className="w-8 h-8 object-contain" />
                          ) : (
                            <span className="text-neutral-500 text-xs">Sem icone</span>
                          )}
                        </div>
                        <div className="flex-1">
                          <label className="block">
                            <span className="sr-only">Escolher favicon</span>
                            <input
                              type="file"
                              accept="image/jpeg,image/png,image/webp"
                              onChange={(e) => handleImageUpload(e, 'favicon')}
                              disabled={uploading === 'favicon'}
                              className="block w-full text-sm text-neutral-400 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-primary-600 file:text-white file:font-semibold hover:file:bg-primary-500 file:cursor-pointer cursor-pointer disabled:opacity-50"
                            />
                          </label>
                          {uploading === 'favicon' && <p className="text-primary-500 text-sm mt-2">Enviando...</p>}
                          <p className="text-neutral-500 text-xs mt-2">Icone exibido na aba do navegador (recomendado: 32x32 ou 64x64)</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Componente de icones para as tabs
function TabIcon({ name }: { name: string }) {
  const icons: Record<string, React.ReactNode> = {
    cog: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    palette: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
      </svg>
    ),
    phone: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
      </svg>
    ),
    globe: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
      </svg>
    ),
    search: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
      </svg>
    ),
  };
  return icons[name] || null;
}
