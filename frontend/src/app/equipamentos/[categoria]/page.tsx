'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/site/ProductCard';
import CartDrawer from '@/components/site/CartDrawer';
import { api } from '@/lib/api';
import { Product, Category } from '@/types';

export default function CategoryPage() {
  const params = useParams();
  const categorySlug = params.categoria as string;
  
  const [category, setCategory] = useState<Category | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get(`/categories/${categorySlug}`),
          api.get(`/products?category=${categorySlug}&active=true&limit=100`)
        ]);
        setCategory(catRes.data);
        setProducts(prodRes.data?.products || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    if (categorySlug) loadData();
  }, [categorySlug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-neutral-800 rounded w-1/3" />
            <div className="h-6 bg-neutral-800 rounded w-2/3" />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-neutral-900 rounded-2xl overflow-hidden">
                  <div className="aspect-square bg-neutral-800" />
                  <div className="p-5 space-y-3">
                    <div className="h-4 bg-neutral-800 rounded w-1/3" />
                    <div className="h-6 bg-neutral-800 rounded w-2/3" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!category) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Categoria não encontrada</h1>
          <p className="text-neutral-400 mb-8">A categoria que você procura não existe ou foi removida.</p>
          <Link href="/equipamentos" className="inline-flex items-center gap-2 px-6 py-3 bg-amber-500 text-neutral-900 font-bold rounded-lg hover:bg-amber-400 transition-colors">
            Ver Todos os Equipamentos
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />

      {/* Breadcrumb + Hero */}
      <section className="relative py-16 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-6">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/equipamentos" className="hover:text-amber-400 transition-colors">Equipamentos</Link>
            <span>/</span>
            <span className="text-amber-400">{category.name}</span>
          </nav>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-3xl">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">{category.name}</h1>
            {category.description && <p className="text-xl text-neutral-400">{category.description}</p>}
          </motion.div>
        </div>
      </section>

      {/* Products Grid */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <p className="text-neutral-400">{products.length} equipamento{products.length !== 1 ? 's' : ''}</p>
          </div>

          {products.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product, index) => (
                <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                  <ProductCard product={product} />
                </motion.div>
              ))}
            </div>
          ) : (
            <div className="text-center py-20">
              <svg className="w-16 h-16 text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
              </svg>
              <h3 className="text-xl font-bold text-white mb-2">Nenhum equipamento nesta categoria</h3>
              <p className="text-neutral-400">Em breve teremos novidades!</p>
            </div>
          )}
        </div>
      </section>

      <CartDrawer />
      <Footer />
    </div>
  );
}
