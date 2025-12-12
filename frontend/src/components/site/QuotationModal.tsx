'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import { api } from '@/lib/api';
import { InstallationType } from '@/types';

interface QuotationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const INSTALLATION_TYPES: { value: InstallationType; label: string }[] = [
  { value: 'academia', label: 'Academia' },
  { value: 'condominio', label: 'Condomínio' },
  { value: 'hotel', label: 'Hotel' },
  { value: 'empresa', label: 'Empresa' },
  { value: 'residencia', label: 'Residência' },
  { value: 'ct_esportivo', label: 'Centro de Treinamento Esportivo' },
  { value: 'outro', label: 'Outro' },
];

const ESTADOS = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA','MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN','RS','RO','RR','SC','SP','SE','TO'];

export default function QuotationModal({ isOpen, onClose }: QuotationModalProps) {
  const { items, clearCart } = useCart();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone: '',
    company_name: '',
    cnpj: '',
    installation_type: '' as InstallationType | '',
    installation_type_other: '',
    city: '',
    state: '',
    message: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const formatPhone = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length <= 10) {
      return numbers.replace(/(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3').trim();
    }
    return numbers.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3').trim();
  };

  const formatCNPJ = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    return numbers.replace(/(\d{2})(\d{3})(\d{3})(\d{4})(\d{0,2})/, '$1.$2.$3/$4-$5').trim();
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, phone: formatPhone(e.target.value) }));
  };

  const handleCNPJChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData((prev) => ({ ...prev, cnpj: formatCNPJ(e.target.value) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const payload = {
        ...formData,
        items: items.map((item) => ({
          product_id: item.product.id,
          product_name: item.product.name,
          quantity: item.quantity,
          notes: item.notes || '',
        })),
      };

      await api.post('/quotations', payload);
      setSuccess(true);
      clearCart();
    } catch (err: any) {
      setError(err.response?.data?.message || 'Erro ao enviar cotação. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (success) {
      setSuccess(false);
      setFormData({
        first_name: '', last_name: '', email: '', phone: '', company_name: '', cnpj: '',
        installation_type: '', installation_type_other: '', city: '', state: '', message: '',
      });
    }
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={handleClose} className="absolute inset-0 bg-black/70 backdrop-blur-sm" />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl shadow-2xl"
          >
            {/* Header */}
            <div className="sticky top-0 bg-neutral-900 p-6 border-b border-neutral-800 flex items-center justify-between z-10">
              <div>
                <h2 className="text-2xl font-bold text-white">Solicitar Cotação</h2>
                <p className="text-neutral-400 text-sm">{items.length} equipamento(s) selecionado(s)</p>
              </div>
              <button onClick={handleClose} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Content */}
            <div className="p-6">
              {success ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                    <svg className="w-10 h-10 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Cotação Enviada!</h3>
                  <p className="text-neutral-400 mb-8">Entraremos em contato em breve para apresentar sua proposta personalizada.</p>
                  <button onClick={handleClose} className="px-8 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg transition-colors">
                    Fechar
                  </button>
                </div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6">
                  {error && (
                    <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg text-red-400 text-sm">
                      {error}
                    </div>
                  )}

                  {/* Nome */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Nome *</label>
                      <input type="text" name="first_name" value={formData.first_name} onChange={handleChange} required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Sobrenome *</label>
                      <input type="text" name="last_name" value={formData.last_name} onChange={handleChange} required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                    </div>
                  </div>

                  {/* Contato */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">E-mail *</label>
                      <input type="email" name="email" value={formData.email} onChange={handleChange} required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Telefone *</label>
                      <input type="tel" name="phone" value={formData.phone} onChange={handlePhoneChange} required maxLength={15} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" placeholder="(00) 00000-0000" />
                    </div>
                  </div>

                  {/* Empresa */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Empresa</label>
                      <input type="text" name="company_name" value={formData.company_name} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">CNPJ</label>
                      <input type="text" name="cnpj" value={formData.cnpj} onChange={handleCNPJChange} maxLength={18} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" placeholder="00.000.000/0000-00" />
                    </div>
                  </div>

                  {/* Tipo de Instalação */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Tipo de Instalação *</label>
                    <select name="installation_type" value={formData.installation_type} onChange={handleChange} required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                      <option value="">Selecione...</option>
                      {INSTALLATION_TYPES.map((type) => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>

                  {formData.installation_type === 'outro' && (
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Especifique *</label>
                      <input type="text" name="installation_type_other" value={formData.installation_type_other} onChange={handleChange} required className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                    </div>
                  )}

                  {/* Localização */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Cidade</label>
                      <input type="text" name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-neutral-300 mb-2">Estado</label>
                      <select name="state" value={formData.state} onChange={handleChange} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                        <option value="">Selecione...</option>
                        {ESTADOS.map((uf) => (
                          <option key={uf} value={uf}>{uf}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Mensagem */}
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Mensagem Adicional</label>
                    <textarea name="message" value={formData.message} onChange={handleChange} rows={4} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500 resize-none" placeholder="Informações adicionais sobre seu projeto..." />
                  </div>

                  {/* Submit */}
                  <button type="submit" disabled={loading} className="w-full py-4 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/50 text-neutral-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                    {loading ? (
                      <>
                        <svg className="animate-spin w-5 h-5" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Enviando...
                      </>
                    ) : (
                      <>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                        </svg>
                        Enviar Solicitação
                      </>
                    )}
                  </button>
                </form>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
