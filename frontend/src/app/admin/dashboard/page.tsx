'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { api } from '@/lib/api';
import { QuotationStats } from '@/types';

interface DashboardStats {
  products: number;
  categories: number;
  banners: number;
  quotations: QuotationStats;
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentQuotations, setRecentQuotations] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        const [productsRes, categoriesRes, bannersRes, quotationsRes, recentRes] = await Promise.all([
          api.get('/products?limit=1'),
          api.get('/categories'),
          api.get('/banners'),
          api.get('/quotations/stats'),
          api.get('/quotations?limit=5&orderBy=created_at&order=desc')
        ]);

        setStats({
          products: productsRes.data.data?.pagination?.total || 0,
          categories: categoriesRes.data.data?.length || 0,
          banners: bannersRes.data.data?.length || 0,
          quotations: quotationsRes.data.data || {}
        });

        setRecentQuotations(recentRes.data.data?.quotations || []);
      } catch (error) {
        console.error('Erro ao carregar estatísticas:', error);
      } finally {
        setLoading(false);
      }
    }

    loadStats();
  }, []);

  const statCards = [
    { label: 'Produtos', value: stats?.products || 0, href: '/admin/produtos', color: 'bg-blue-500', icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" /></svg>
    )},
    { label: 'Categorias', value: stats?.categories || 0, href: '/admin/categorias', color: 'bg-purple-500', icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" /></svg>
    )},
    { label: 'Banners', value: stats?.banners || 0, href: '/admin/banners', color: 'bg-green-500', icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
    )},
    { label: 'Cotações Pendentes', value: stats?.quotations?.pending || 0, href: '/admin/cotacoes', color: 'bg-amber-500', icon: (
      <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
    )},
  ];

  const statusColors: Record<string, string> = {
    pending: 'bg-yellow-500/20 text-yellow-500',
    contacted: 'bg-blue-500/20 text-blue-500',
    quoted: 'bg-purple-500/20 text-purple-500',
    converted: 'bg-green-500/20 text-green-500',
    cancelled: 'bg-red-500/20 text-red-500',
  };

  const statusLabels: Record<string, string> = {
    pending: 'Pendente',
    contacted: 'Contatado',
    quoted: 'Cotado',
    converted: 'Convertido',
    cancelled: 'Cancelado',
  };

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-neutral-400 mt-1">Visão geral do sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card, index) => (
          <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.1 }}>
            <Link href={card.href} className="block bg-neutral-900 rounded-xl p-6 border border-neutral-800 hover:border-neutral-700 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-neutral-400 text-sm">{card.label}</p>
                  <p className="text-3xl font-bold text-white mt-1">{loading ? '...' : card.value}</p>
                </div>
                <div className={`${card.color} p-3 rounded-xl text-white`}>{card.icon}</div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Quotation Stats */}
      {stats?.quotations && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-neutral-900 rounded-xl p-6 border border-neutral-800 mb-8">
          <h2 className="text-xl font-bold text-white mb-4">Resumo de Cotações</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
            {[
              { label: 'Total', value: stats.quotations.total },
              { label: 'Hoje', value: stats.quotations.today },
              { label: 'Últimos 7 dias', value: stats.quotations.last_7_days },
              { label: 'Últimos 30 dias', value: stats.quotations.last_30_days },
              { label: 'Convertidas', value: stats.quotations.converted },
              { label: 'Canceladas', value: stats.quotations.cancelled },
            ].map((item) => (
              <div key={item.label} className="text-center p-4 bg-neutral-800/50 rounded-lg">
                <p className="text-2xl font-bold text-white">{item.value}</p>
                <p className="text-neutral-400 text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      {/* Recent Quotations */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} className="bg-neutral-900 rounded-xl border border-neutral-800">
        <div className="p-6 border-b border-neutral-800 flex items-center justify-between">
          <h2 className="text-xl font-bold text-white">Cotações Recentes</h2>
          <Link href="/admin/cotacoes" className="text-amber-500 hover:text-amber-400 text-sm font-medium">Ver todas →</Link>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-neutral-400 text-sm border-b border-neutral-800">
                <th className="px-6 py-4 font-medium">Cliente</th>
                <th className="px-6 py-4 font-medium">E-mail</th>
                <th className="px-6 py-4 font-medium">Itens</th>
                <th className="px-6 py-4 font-medium">Status</th>
                <th className="px-6 py-4 font-medium">Data</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Carregando...</td></tr>
              ) : recentQuotations.length === 0 ? (
                <tr><td colSpan={5} className="px-6 py-8 text-center text-neutral-500">Nenhuma cotação encontrada</td></tr>
              ) : (
                recentQuotations.map((q) => (
                  <tr key={q.id} className="border-b border-neutral-800 hover:bg-neutral-800/50 transition-colors">
                    <td className="px-6 py-4 text-white">{q.first_name} {q.last_name}</td>
                    <td className="px-6 py-4 text-neutral-400">{q.email}</td>
                    <td className="px-6 py-4 text-neutral-400">{q.total_items || '-'}</td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[q.status]}`}>
                        {statusLabels[q.status]}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-neutral-400">
                      {new Date(q.created_at).toLocaleDateString('pt-BR')}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </div>
  );
}
