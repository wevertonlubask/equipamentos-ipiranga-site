'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Quotation, QuotationStatus, Pagination } from '@/types';
import { formatCurrency } from '@/utils';

const statusColors: Record<QuotationStatus, string> = {
  pending: 'bg-yellow-500/20 text-yellow-500',
  contacted: 'bg-blue-500/20 text-blue-500',
  quoted: 'bg-purple-500/20 text-purple-500',
  converted: 'bg-green-500/20 text-green-500',
  cancelled: 'bg-red-500/20 text-red-500',
};

const statusLabels: Record<QuotationStatus, string> = {
  pending: 'Pendente',
  contacted: 'Contatado',
  quoted: 'Cotado',
  converted: 'Convertido',
  cancelled: 'Cancelado',
};

const installationLabels: Record<string, string> = {
  academia: 'Academia',
  condominio: 'Condomínio',
  hotel: 'Hotel',
  empresa: 'Empresa',
  residencia: 'Residência',
  ct_esportivo: 'CT Esportivo',
  outro: 'Outro',
};

interface QuotationItem {
  product_id: number;
  product_name: string;
  product_sku?: string;
  quantity: number;
  unit_price?: number;
  total_price?: number;
}

interface QuotationPricing {
  items: QuotationItem[];
  subtotal: number;
  discount: number;
  discountType: 'percent' | 'fixed';
  shipping: number;
  total: number;
  notes: string;
  validityDays: number;
  paymentTerms: string;
}

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [showPricingModal, setShowPricingModal] = useState(false);
  const [pricing, setPricing] = useState<QuotationPricing>({
    items: [],
    subtotal: 0,
    discount: 0,
    discountType: 'percent',
    shipping: 0,
    total: 0,
    notes: '',
    validityDays: 15,
    paymentTerms: 'À vista ou em até 10x no cartão'
  });
  const [generatingPDF, setGeneratingPDF] = useState(false);

  const loadQuotations = async (currentPage: number, currentStatusFilter: string, currentSearch: string) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', currentPage.toString());
      params.append('limit', '20');
      if (currentStatusFilter) params.append('status', currentStatusFilter);
      if (currentSearch) params.append('search', currentSearch);

      const res = await api.get(`/quotations?${params.toString()}`);
      setQuotations(res.data?.quotations || []);
      setPagination(res.data?.pagination || null);
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations(page, statusFilter, search);
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQuotations(1, statusFilter, search);
  };

  const handleStatusChange = async (id: number, newStatus: QuotationStatus) => {
    // Atualizar localmente primeiro para feedback imediato
    setQuotations(prev => prev.map(q => 
      q.id === id ? { ...q, status: newStatus } : q
    ));
    
    if (selectedQuotation?.id === id) {
      setSelectedQuotation(prev => prev ? { ...prev, status: newStatus } : null);
    }

    try {
      await api.put(`/quotations/${id}/status`, { status: newStatus });
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
      alert('Erro ao atualizar status. Recarregando lista...');
      // Recarregar em caso de erro para sincronizar
      loadQuotations(page, statusFilter, search);
    }
  };

  const handleExport = async () => {
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.append('status', statusFilter);
      
      const res = await api.get(`/quotations/export?${params.toString()}`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.download = `cotacoes-${Date.now()}.csv`;
      link.click();
    } catch (error) {
      console.error('Erro ao exportar:', error);
    }
  };

  const viewQuotation = async (id: number) => {
    try {
      const res = await api.get(`/quotations/${id}`);
      setSelectedQuotation(res.data);
    } catch (error) {
      console.error('Erro ao carregar cotação:', error);
    }
  };

  const openPricingModal = () => {
    if (!selectedQuotation?.items) return;
    
    const items = selectedQuotation.items.map(item => ({
      ...item,
      unit_price: item.unit_price || 0,
      total_price: (item.unit_price || 0) * item.quantity
    }));
    
    const subtotal = items.reduce((sum, item) => sum + (item.total_price || 0), 0);
    
    setPricing({
      items,
      subtotal,
      discount: 0,
      discountType: 'percent',
      shipping: 0,
      total: subtotal,
      notes: '',
      validityDays: 15,
      paymentTerms: 'À vista ou em até 10x no cartão'
    });
    setShowPricingModal(true);
  };

  const updateItemPrice = (index: number, price: number) => {
    const newItems = [...pricing.items];
    newItems[index].unit_price = price;
    newItems[index].total_price = price * newItems[index].quantity;
    
    const subtotal = newItems.reduce((sum, item) => sum + (item.total_price || 0), 0);
    const discountValue = pricing.discountType === 'percent' 
      ? subtotal * (pricing.discount / 100)
      : pricing.discount;
    const total = subtotal - discountValue + pricing.shipping;
    
    setPricing({
      ...pricing,
      items: newItems,
      subtotal,
      total: Math.max(0, total)
    });
  };

  const updateDiscount = (value: number, type?: 'percent' | 'fixed') => {
    const discountType = type || pricing.discountType;
    const discountValue = discountType === 'percent'
      ? pricing.subtotal * (value / 100)
      : value;
    const total = pricing.subtotal - discountValue + pricing.shipping;
    
    setPricing({
      ...pricing,
      discount: value,
      discountType,
      total: Math.max(0, total)
    });
  };

  const updateShipping = (value: number) => {
    const discountValue = pricing.discountType === 'percent'
      ? pricing.subtotal * (pricing.discount / 100)
      : pricing.discount;
    const total = pricing.subtotal - discountValue + value;
    
    setPricing({
      ...pricing,
      shipping: value,
      total: Math.max(0, total)
    });
  };

  const generatePDF = async () => {
    setGeneratingPDF(true);
    
    try {
      const printWindow = window.open('', '_blank');
      if (!printWindow) {
        alert('Por favor, permita pop-ups para gerar o PDF');
        return;
      }

      const discountValue = pricing.discountType === 'percent'
        ? pricing.subtotal * (pricing.discount / 100)
        : pricing.discount;

      const validUntil = new Date();
      validUntil.setDate(validUntil.getDate() + pricing.validityDays);

      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Proposta Comercial #${selectedQuotation?.id}</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { font-family: 'Segoe UI', Arial, sans-serif; color: #333; line-height: 1.5; padding: 40px; max-width: 800px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 40px; padding-bottom: 20px; border-bottom: 3px solid #f59e0b; }
    .logo { font-size: 24px; font-weight: bold; color: #1a1a1a; }
    .logo span { color: #f59e0b; }
    .doc-info { text-align: right; }
    .doc-info h1 { font-size: 20px; color: #1a1a1a; margin-bottom: 5px; }
    .doc-info p { color: #666; font-size: 14px; }
    .section { margin-bottom: 30px; }
    .section-title { font-size: 14px; font-weight: 600; color: #f59e0b; text-transform: uppercase; letter-spacing: 1px; margin-bottom: 15px; }
    .client-info { background: #f9f9f9; padding: 20px; border-radius: 8px; }
    .client-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 15px; }
    .client-grid label { font-size: 12px; color: #666; display: block; }
    .client-grid p { font-size: 14px; color: #333; font-weight: 500; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
    th { background: #1a1a1a; color: white; padding: 12px; text-align: left; font-size: 13px; font-weight: 600; }
    th:last-child, td:last-child { text-align: right; }
    td { padding: 12px; border-bottom: 1px solid #eee; font-size: 14px; }
    tr:hover { background: #fafafa; }
    .totals { margin-left: auto; width: 300px; }
    .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
    .totals-row.total { border-bottom: none; border-top: 2px solid #1a1a1a; padding-top: 15px; margin-top: 10px; font-size: 18px; font-weight: bold; }
    .totals-row.total .value { color: #f59e0b; }
    .notes { background: #fffbeb; padding: 20px; border-radius: 8px; border-left: 4px solid #f59e0b; }
    .notes p { font-size: 14px; color: #666; }
    .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #eee; display: flex; justify-content: space-between; }
    .validity { background: #f0fdf4; padding: 15px 20px; border-radius: 8px; }
    .validity label { font-size: 12px; color: #666; }
    .validity p { font-size: 14px; font-weight: 600; color: #166534; }
    .contact { text-align: right; }
    .contact p { font-size: 13px; color: #666; }
    .contact strong { color: #333; }
    @media print { body { padding: 20px; } .no-print { display: none; } }
    .print-btn { position: fixed; bottom: 20px; right: 20px; background: #f59e0b; color: #1a1a1a; border: none; padding: 15px 30px; font-size: 16px; font-weight: bold; border-radius: 8px; cursor: pointer; }
    .print-btn:hover { background: #d97706; }
  </style>
</head>
<body>
  <button class="print-btn no-print" onclick="window.print()">Imprimir / Salvar PDF</button>
  
  <div class="header">
    <div class="logo">IPIRANGA<span>FITNESS</span></div>
    <div class="doc-info">
      <h1>Proposta Comercial</h1>
      <p>#${String(selectedQuotation?.id).padStart(5, '0')} | ${new Date().toLocaleDateString('pt-BR')}</p>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Dados do Cliente</div>
    <div class="client-info">
      <div class="client-grid">
        <div><label>Nome</label><p>${selectedQuotation?.first_name} ${selectedQuotation?.last_name}</p></div>
        <div><label>Empresa</label><p>${selectedQuotation?.company_name || '-'}</p></div>
        <div><label>E-mail</label><p>${selectedQuotation?.email}</p></div>
        <div><label>Telefone</label><p>${selectedQuotation?.phone}</p></div>
        <div><label>CNPJ</label><p>${selectedQuotation?.cnpj || '-'}</p></div>
        <div><label>Tipo</label><p>${installationLabels[selectedQuotation?.installation_type || ''] || '-'}</p></div>
        <div><label>Cidade/UF</label><p>${selectedQuotation?.city || '-'}${selectedQuotation?.state ? ' - ' + selectedQuotation.state : ''}</p></div>
      </div>
    </div>
  </div>

  <div class="section">
    <div class="section-title">Equipamentos</div>
    <table>
      <thead>
        <tr>
          <th>Produto</th>
          <th>Qtd</th>
          <th>Valor Unit.</th>
          <th>Total</th>
        </tr>
      </thead>
      <tbody>
        ${pricing.items.map(item => `
          <tr>
            <td><strong>${item.product_name}</strong>${item.product_sku ? '<br><small style="color:#666">Cód: ' + item.product_sku + '</small>' : ''}</td>
            <td>${item.quantity}</td>
            <td>${formatCurrency(item.unit_price || 0)}</td>
            <td>${formatCurrency(item.total_price || 0)}</td>
          </tr>
        `).join('')}
      </tbody>
    </table>

    <div class="totals">
      <div class="totals-row">
        <span>Subtotal</span>
        <span>${formatCurrency(pricing.subtotal)}</span>
      </div>
      ${pricing.discount > 0 ? `
      <div class="totals-row">
        <span>Desconto ${pricing.discountType === 'percent' ? '(' + pricing.discount + '%)' : ''}</span>
        <span style="color: #dc2626">- ${formatCurrency(discountValue)}</span>
      </div>
      ` : ''}
      ${pricing.shipping > 0 ? `
      <div class="totals-row">
        <span>Frete</span>
        <span>${formatCurrency(pricing.shipping)}</span>
      </div>
      ` : ''}
      <div class="totals-row total">
        <span>TOTAL</span>
        <span class="value">${formatCurrency(pricing.total)}</span>
      </div>
    </div>
  </div>

  ${pricing.paymentTerms ? `
  <div class="section">
    <div class="section-title">Condições de Pagamento</div>
    <p style="font-size: 14px; color: #333;">${pricing.paymentTerms}</p>
  </div>
  ` : ''}

  ${pricing.notes ? `
  <div class="section">
    <div class="section-title">Observações</div>
    <div class="notes">
      <p>${pricing.notes.replace(/\n/g, '<br>')}</p>
    </div>
  </div>
  ` : ''}

  <div class="footer">
    <div class="validity">
      <label>Proposta válida até</label>
      <p>${validUntil.toLocaleDateString('pt-BR')}</p>
    </div>
    <div class="contact">
      <p><strong>Ipiranga Fitness</strong></p>
      <p>contato@equipamentosipiranga.com.br</p>
      <p>(18) 3222-1234</p>
    </div>
  </div>
</body>
</html>
      `;

      printWindow.document.write(html);
      printWindow.document.close();

      if (selectedQuotation && selectedQuotation.status !== 'quoted') {
        await handleStatusChange(selectedQuotation.id, 'quoted');
      }

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF');
    } finally {
      setGeneratingPDF(false);
    }
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Cotações</h1>
          <p className="text-neutral-400 mt-1">Gerencie as solicitações de cotação</p>
        </div>
        <button onClick={handleExport} className="px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors flex items-center gap-2">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" /></svg>
          Exportar CSV
        </button>
      </div>

      {/* Filters */}
      <div className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 mb-6">
        <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nome, email ou empresa..." className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500" />
          </div>
          <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }} className="px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
            <option value="">Todos os status</option>
            {Object.entries(statusLabels).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
          <button type="submit" className="px-6 py-3 bg-neutral-700 hover:bg-neutral-600 text-white rounded-lg transition-colors">Buscar</button>
        </form>
      </div>

      {/* Table */}
      <div className="bg-neutral-900 rounded-xl border border-neutral-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-neutral-400 text-sm border-b border-neutral-800">
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">Contato</th>
                <th className="px-6 py-4 font-medium">Tipo</th>
                <th className="px-6 py-4 font-medium">Itens</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Data</th>
                <th className="px-6 py-4 font-medium text-right">Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-500">Carregando...</td></tr>
              ) : quotations.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-neutral-500">Nenhuma cotação encontrada</td></tr>
              ) : (
                quotations.map((q) => (
                  <tr key={q.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">{q.first_name} {q.last_name}</p>
                        {q.company_name && <p className="text-neutral-500 text-sm">{q.company_name}</p>}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-neutral-400">{q.email}</p>
                        <p className="text-neutral-500 text-sm">{q.phone}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">{installationLabels[q.installation_type] || q.installation_type}</td>
                    <td className="px-6 py-4 text-neutral-400">{q.total_items || q.items?.length || 0}</td>
                    <td className="px-6 py-4">
                      <select value={q.status} onChange={(e) => handleStatusChange(q.id, e.target.value as QuotationStatus)} className={`px-3 py-1 rounded-full text-xs font-medium border-0 cursor-pointer ${statusColors[q.status]}`}>
                        {Object.entries(statusLabels).map(([value, label]) => (
                          <option key={value} value={value} className="bg-neutral-800 text-white">{label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">{new Date(q.created_at).toLocaleDateString('pt-BR')}</td>
                    <td className="px-6 py-4">
                      <button onClick={() => viewQuotation(q.id)} className="p-2 rounded-lg hover:bg-neutral-700 text-neutral-400 hover:text-white transition-colors" title="Ver detalhes">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {pagination && pagination.totalPages > 1 && (
          <div className="px-6 py-4 border-t border-neutral-800 flex items-center justify-between">
            <p className="text-neutral-400 text-sm">Mostrando {((page - 1) * pagination.limit) + 1} - {Math.min(page * pagination.limit, pagination.total)} de {pagination.total}</p>
            <div className="flex gap-2">
              <button onClick={() => setPage(page - 1)} disabled={page === 1} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-lg transition-colors">Anterior</button>
              <button onClick={() => setPage(page + 1)} disabled={page >= pagination.totalPages} className="px-4 py-2 bg-neutral-800 hover:bg-neutral-700 disabled:opacity-50 text-white rounded-lg transition-colors">Próximo</button>
            </div>
          </div>
        )}
      </div>

      {/* Detail Modal */}
      <AnimatePresence>
        {selectedQuotation && !showPricingModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedQuotation(null)} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl">
              <div className="sticky top-0 bg-neutral-900 p-6 border-b border-neutral-800 flex items-center justify-between z-10">
                <h2 className="text-xl font-bold text-white">Cotação #{selectedQuotation.id}</h2>
                <button onClick={() => setSelectedQuotation(null)} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div><span className="text-neutral-500 text-sm">Nome</span><p className="text-white">{selectedQuotation.first_name} {selectedQuotation.last_name}</p></div>
                  <div><span className="text-neutral-500 text-sm">E-mail</span><p className="text-white">{selectedQuotation.email}</p></div>
                  <div><span className="text-neutral-500 text-sm">Telefone</span><p className="text-white">{selectedQuotation.phone}</p></div>
                  <div><span className="text-neutral-500 text-sm">Empresa</span><p className="text-white">{selectedQuotation.company_name || '-'}</p></div>
                  <div><span className="text-neutral-500 text-sm">CNPJ</span><p className="text-white">{selectedQuotation.cnpj || '-'}</p></div>
                  <div><span className="text-neutral-500 text-sm">Tipo de Instalação</span><p className="text-white">{installationLabels[selectedQuotation.installation_type]}</p></div>
                  <div><span className="text-neutral-500 text-sm">Cidade/Estado</span><p className="text-white">{selectedQuotation.city || '-'} {selectedQuotation.state ? `- ${selectedQuotation.state}` : ''}</p></div>
                  <div><span className="text-neutral-500 text-sm">Data</span><p className="text-white">{new Date(selectedQuotation.created_at).toLocaleString('pt-BR')}</p></div>
                </div>

                {selectedQuotation.message && (
                  <div><span className="text-neutral-500 text-sm">Mensagem</span><p className="text-white mt-1 p-4 bg-neutral-800 rounded-lg">{selectedQuotation.message}</p></div>
                )}

                <div>
                  <span className="text-neutral-500 text-sm">Equipamentos Solicitados</span>
                  <div className="mt-2 space-y-2">
                    {selectedQuotation.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <div>
                          <span className="text-white">{item.product_name}</span>
                          {item.product_sku && <span className="text-neutral-500 text-sm ml-2">Cód: {item.product_sku}</span>}
                        </div>
                        <span className="text-amber-500 font-semibold">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <span className="text-neutral-500 text-sm">Status</span>
                  <select value={selectedQuotation.status} onChange={(e) => handleStatusChange(selectedQuotation.id, e.target.value as QuotationStatus)} className="mt-2 w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex gap-3 pt-4 border-t border-neutral-800">
                  <button onClick={openPricingModal} className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Criar Proposta com Valores
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Pricing Modal */}
      <AnimatePresence>
        {showPricingModal && selectedQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setShowPricingModal(false)} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl">
              <div className="sticky top-0 bg-neutral-900 p-6 border-b border-neutral-800 flex items-center justify-between z-10">
                <div>
                  <h2 className="text-xl font-bold text-white">Criar Proposta Comercial</h2>
                  <p className="text-neutral-400 text-sm">Cotação #{selectedQuotation.id} - {selectedQuotation.first_name} {selectedQuotation.last_name}</p>
                </div>
                <button onClick={() => setShowPricingModal(false)} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              
              <div className="p-6 space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4">Equipamentos e Valores</h3>
                  <div className="bg-neutral-800 rounded-xl overflow-hidden">
                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-neutral-400 text-sm border-b border-neutral-700">
                          <th className="px-4 py-3 font-medium">Produto</th>
                          <th className="px-4 py-3 font-medium w-20 text-center">Qtd</th>
                          <th className="px-4 py-3 font-medium w-40">Valor Unitário</th>
                          <th className="px-4 py-3 font-medium w-32 text-right">Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pricing.items.map((item, index) => (
                          <tr key={index} className="border-b border-neutral-700">
                            <td className="px-4 py-3">
                              <div>
                                <p className="text-white font-medium">{item.product_name}</p>
                                {item.product_sku && <p className="text-neutral-500 text-xs">Cód: {item.product_sku}</p>}
                              </div>
                            </td>
                            <td className="px-4 py-3 text-center text-white">{item.quantity}</td>
                            <td className="px-4 py-3">
                              <div className="relative">
                                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                                <input type="number" value={item.unit_price || ''} onChange={(e) => updateItemPrice(index, parseFloat(e.target.value) || 0)} placeholder="0,00" step="0.01" min="0" className="w-full pl-10 pr-3 py-2 bg-neutral-700 border border-neutral-600 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500" />
                              </div>
                            </td>
                            <td className="px-4 py-3 text-right text-white font-medium">{formatCurrency(item.total_price || 0)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Desconto</label>
                    <div className="flex gap-2">
                      <input type="number" value={pricing.discount || ''} onChange={(e) => updateDiscount(parseFloat(e.target.value) || 0)} placeholder="0" min="0" className="flex-1 min-w-0 px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500" />
                      <select value={pricing.discountType} onChange={(e) => updateDiscount(pricing.discount, e.target.value as 'percent' | 'fixed')} className="w-20 shrink-0 px-3 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500">
                        <option value="percent">%</option>
                        <option value="fixed">R$</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Frete</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-neutral-500">R$</span>
                      <input type="number" value={pricing.shipping || ''} onChange={(e) => updateShipping(parseFloat(e.target.value) || 0)} placeholder="0,00" step="0.01" min="0" className="w-full pl-10 pr-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-300 mb-2">Validade (dias)</label>
                    <input type="number" value={pricing.validityDays} onChange={(e) => setPricing({ ...pricing, validityDays: parseInt(e.target.value) || 15 })} min="1" className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white focus:outline-none focus:border-amber-500" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Condições de Pagamento</label>
                  <input type="text" value={pricing.paymentTerms} onChange={(e) => setPricing({ ...pricing, paymentTerms: e.target.value })} placeholder="Ex: À vista ou em até 10x no cartão" className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-300 mb-2">Observações</label>
                  <textarea value={pricing.notes} onChange={(e) => setPricing({ ...pricing, notes: e.target.value })} placeholder="Informações adicionais, prazos de entrega, garantias..." rows={3} className="w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 resize-none" />
                </div>

                <div className="bg-neutral-800 rounded-xl p-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-neutral-400">
                      <span>Subtotal</span>
                      <span>{formatCurrency(pricing.subtotal)}</span>
                    </div>
                    {pricing.discount > 0 && (
                      <div className="flex justify-between text-red-400">
                        <span>Desconto {pricing.discountType === 'percent' ? `(${pricing.discount}%)` : ''}</span>
                        <span>- {formatCurrency(pricing.discountType === 'percent' ? pricing.subtotal * (pricing.discount / 100) : pricing.discount)}</span>
                      </div>
                    )}
                    {pricing.shipping > 0 && (
                      <div className="flex justify-between text-neutral-400">
                        <span>Frete</span>
                        <span>{formatCurrency(pricing.shipping)}</span>
                      </div>
                    )}
                    <div className="flex justify-between text-xl font-bold text-white pt-3 border-t border-neutral-700">
                      <span>TOTAL</span>
                      <span className="text-amber-500">{formatCurrency(pricing.total)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button onClick={() => setShowPricingModal(false)} className="flex-1 px-6 py-3 bg-neutral-800 hover:bg-neutral-700 text-white rounded-lg transition-colors">Cancelar</button>
                  <button onClick={generatePDF} disabled={generatingPDF || pricing.subtotal === 0} className="flex-1 px-6 py-3 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-neutral-900 font-bold rounded-lg flex items-center justify-center gap-2 transition-colors">
                    {generatingPDF ? (
                      <><svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" /><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" /></svg>Gerando...</>
                    ) : (
                      <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" /></svg>Gerar PDF da Proposta</>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
