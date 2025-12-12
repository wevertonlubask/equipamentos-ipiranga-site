'use client';

import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '@/lib/api';
import { Quotation, QuotationStatus, Pagination } from '@/types';

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

export default function AdminQuotationsPage() {
  const [quotations, setQuotations] = useState<Quotation[]>([]);
  const [pagination, setPagination] = useState<Pagination | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuotation, setSelectedQuotation] = useState<Quotation | null>(null);
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);

  const loadQuotations = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.append('page', page.toString());
      params.append('limit', '20');
      if (statusFilter) params.append('status', statusFilter);
      if (search) params.append('search', search);

      const res = await api.get(`/quotations?${params.toString()}`);
      setQuotations(res.data?.quotations || []);
      setPagination(res.data?.pagination);
    } catch (error) {
      console.error('Erro ao carregar cotações:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadQuotations();
  }, [page, statusFilter]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    loadQuotations();
  };

  const handleStatusChange = async (id: number, status: QuotationStatus) => {
    try {
      await api.put(`/quotations/${id}/status`, { status });
      loadQuotations();
      if (selectedQuotation?.id === id) {
        setSelectedQuotation(prev => prev ? { ...prev, status } : null);
      }
    } catch (error) {
      console.error('Erro ao atualizar status:', error);
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

      {/* Quotations Table */}
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

        {/* Pagination */}
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
        {selectedQuotation && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setSelectedQuotation(null)} className="absolute inset-0 bg-black/70" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-neutral-900 rounded-2xl">
              <div className="sticky top-0 bg-neutral-900 p-6 border-b border-neutral-800 flex items-center justify-between">
                <h2 className="text-xl font-bold text-white">Cotação #{selectedQuotation.id}</h2>
                <button onClick={() => setSelectedQuotation(null)} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
              </div>
              <div className="p-6 space-y-6">
                {/* Client Info */}
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

                {/* Message */}
                {selectedQuotation.message && (
                  <div><span className="text-neutral-500 text-sm">Mensagem</span><p className="text-white mt-1 p-4 bg-neutral-800 rounded-lg">{selectedQuotation.message}</p></div>
                )}

                {/* Items */}
                <div>
                  <span className="text-neutral-500 text-sm">Equipamentos Solicitados</span>
                  <div className="mt-2 space-y-2">
                    {selectedQuotation.items?.map((item, i) => (
                      <div key={i} className="flex items-center justify-between p-3 bg-neutral-800 rounded-lg">
                        <span className="text-white">{item.product_name}</span>
                        <span className="text-amber-500 font-semibold">x{item.quantity}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Status */}
                <div>
                  <span className="text-neutral-500 text-sm">Status</span>
                  <select value={selectedQuotation.status} onChange={(e) => handleStatusChange(selectedQuotation.id, e.target.value as QuotationStatus)} className="mt-2 w-full px-4 py-3 bg-neutral-800 border border-neutral-700 rounded-lg text-white">
                    {Object.entries(statusLabels).map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
