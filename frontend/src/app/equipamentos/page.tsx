'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/site/ProductCard';
import CategoryCard from '@/components/site/CategoryCard';
import CartDrawer from '@/components/site/CartDrawer';
import { api } from '@/lib/api';
import { Product, Category } from '@/types';
import { useCart } from '@/hooks/useCart';

export default function EquipamentosPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { getTotalItems, openCart } = useCart();

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prodRes] = await Promise.all([
          api.get('/categories?active=true'),
          api.get('/products?active=true&limit=100')
        ]);
        setCategories(catRes.data || []);
        setProducts(prodRes.data?.products || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const filteredProducts = products.filter(product => {
    const matchesCategory = !selectedCategory || product.category_slug === selectedCategory;
    const matchesSearch = !searchTerm || 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      product.short_description?.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const totalItems = getTotalItems();

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      
      {/* Hero */}
      <section className="relative py-20 bg-gradient-to-b from-neutral-900 to-neutral-950">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Catálogo de Equipamentos</h1>
            <p className="text-xl text-neutral-400 mb-8">Explore nossa linha completa de equipamentos profissionais para musculação</p>
            
            {/* Search */}
            <div className="relative max-w-xl mx-auto">
              <input
                type="text"
                placeholder="Buscar equipamentos..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-6 py-4 pl-14 bg-neutral-800 border border-neutral-700 rounded-xl text-white placeholder-neutral-500 focus:outline-none focus:border-amber-500 transition-colors"
              />
              <svg className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Main Content */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col lg:flex-row gap-8">
            {/* Sidebar - Categories */}
            <aside className="lg:w-64 flex-shrink-0">
              <div className="sticky top-24 bg-neutral-900 rounded-2xl p-6 border border-neutral-800">
                <h2 className="text-lg font-bold text-white mb-4">Categorias</h2>
                <ul className="space-y-2">
                  <li>
                    <button
                      onClick={() => setSelectedCategory(null)}
                      className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                        !selectedCategory ? 'bg-amber-500 text-neutral-900 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                      }`}
                    >
                      Todos os Equipamentos
                    </button>
                  </li>
                  {categories.map((cat) => (
                    <li key={cat.id}>
                      <button
                        onClick={() => setSelectedCategory(cat.slug)}
                        className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                          selectedCategory === cat.slug ? 'bg-amber-500 text-neutral-900 font-semibold' : 'text-neutral-400 hover:bg-neutral-800 hover:text-white'
                        }`}
                      >
                        {cat.name}
                        {cat.product_count !== undefined && (
                          <span className="ml-2 text-xs opacity-70">({cat.product_count})</span>
                        )}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </aside>

            {/* Products Grid */}
            <main className="flex-1">
              {/* Results Header */}
              <div className="flex items-center justify-between mb-6">
                <p className="text-neutral-400">
                  {filteredProducts.length} equipamento{filteredProducts.length !== 1 ? 's' : ''} encontrado{filteredProducts.length !== 1 ? 's' : ''}
                </p>
                {totalItems > 0 && (
                  <button onClick={openCart} className="flex items-center gap-2 px-4 py-2 bg-amber-500 text-neutral-900 rounded-lg font-semibold hover:bg-amber-400 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                    </svg>
                    Ver Cotação ({totalItems})
                  </button>
                )}
              </div>

              {/* Loading */}
              {loading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="bg-neutral-900 rounded-2xl overflow-hidden animate-pulse">
                      <div className="aspect-square bg-neutral-800" />
                      <div className="p-5 space-y-3">
                        <div className="h-4 bg-neutral-800 rounded w-1/3" />
                        <div className="h-6 bg-neutral-800 rounded w-2/3" />
                        <div className="h-4 bg-neutral-800 rounded w-full" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredProducts.map((product, index) => (
                    <motion.div key={product.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.05 }}>
                      <ProductCard product={product} />
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-20">
                  <svg className="w-16 h-16 text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-xl font-bold text-white mb-2">Nenhum equipamento encontrado</h3>
                  <p className="text-neutral-400">Tente ajustar os filtros ou termo de busca</p>
                </div>
              )}
            </main>
          </div>
        </div>
      </section>

      <CartDrawer />
      <Footer />
    </div>
  );
}
