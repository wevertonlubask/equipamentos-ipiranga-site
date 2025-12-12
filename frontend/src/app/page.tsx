'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import HeroCarousel from '@/components/site/HeroCarousel';
import ProductCard from '@/components/site/ProductCard';
import CategoryCard from '@/components/site/CategoryCard';
import { api } from '@/lib/api';
import { Product, Category, Banner } from '@/types';

export default function HomePage() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [bannersRes, productsRes, categoriesRes] = await Promise.all([
          api.get('/banners/active'),
          api.get('/products/featured?limit=8'),
          api.get('/categories?active=true')
        ]);
        setBanners(bannersRes.data.data || []);
        setFeaturedProducts(productsRes.data.data || []);
        setCategories(categoriesRes.data.data || []);
      } catch (error) {
        console.error('Erro ao carregar dados:', error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const diferenciais = [
    { icon: '🛡️', title: 'Robustez', desc: 'Estruturas reforçadas para uso intensivo' },
    { icon: '⚙️', title: 'Biomecânica', desc: 'Movimentos naturais e seguros' },
    { icon: '🏭', title: '100% Nacional', desc: 'Fabricação própria em Presidente Prudente' },
    { icon: '🤝', title: 'Suporte', desc: 'Assistência técnica em todo Brasil' },
  ];

  return (
    <div className="min-h-screen bg-neutral-950">
      <Header />
      <HeroCarousel banners={banners} />

      {/* Sobre */}
      <section className="py-20 bg-gradient-to-b from-neutral-950 to-neutral-900">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="max-w-4xl mx-auto text-center"
          >
            <span className="inline-block px-4 py-1 mb-6 text-sm font-semibold text-amber-400 bg-amber-400/10 rounded-full">
              Desde 1969
            </span>
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Tradição e Inovação em
              <span className="text-amber-400"> Equipamentos de Musculação</span>
            </h2>
            <p className="text-xl text-neutral-400 leading-relaxed mb-8">
              Há mais de 55 anos fabricando máquinas de alta performance que equipam as melhores academias do Brasil.
            </p>
            <div className="flex flex-wrap justify-center gap-8 mt-12">
              {[
                { num: '55+', label: 'Anos de História' },
                { num: '5000+', label: 'Academias Equipadas' },
                { num: '100%', label: 'Nacional' },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-5xl font-bold text-amber-400">{stat.num}</div>
                  <div className="text-neutral-400 mt-2">{stat.label}</div>
                </div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Categorias */}
      <section className="py-20 bg-neutral-900">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Nossas Linhas de Equipamentos</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Descubra nossa linha completa de equipamentos profissionais</p>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.slice(0, 6).map((category, index) => (
              <motion.div key={category.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <CategoryCard category={category} />
              </motion.div>
            ))}
          </div>
          <div className="text-center mt-12">
            <Link href="/equipamentos" className="inline-flex items-center gap-2 px-8 py-4 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-lg transition-colors">
              Ver Todos os Equipamentos
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Produtos em Destaque */}
      <section className="py-20 bg-neutral-950">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Equipamentos em Destaque</h2>
            <p className="text-neutral-400 text-lg max-w-2xl mx-auto">Os favoritos dos nossos clientes</p>
          </motion.div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product, index) => (
              <motion.div key={product.id} initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }}>
                <ProductCard product={product} />
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Diferenciais */}
      <section className="py-20 bg-neutral-900">
        <div className="container mx-auto px-4">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">Por que escolher a Ipiranga?</h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {diferenciais.map((item, index) => (
              <motion.div key={item.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: index * 0.1 }} className="text-center p-6 rounded-2xl bg-neutral-800/50 border border-neutral-700 hover:border-amber-500/50 transition-colors">
                <div className="text-5xl mb-4">{item.icon}</div>
                <h3 className="text-xl font-bold text-white mb-2">{item.title}</h3>
                <p className="text-neutral-400">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 bg-gradient-to-r from-amber-600 to-amber-500">
        <div className="container mx-auto px-4 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
            <h2 className="text-3xl md:text-4xl font-bold text-neutral-900 mb-4">Pronto para equipar sua academia?</h2>
            <p className="text-xl text-neutral-800 mb-8 max-w-2xl mx-auto">Solicite uma cotação personalizada e receba o melhor projeto para seu espaço.</p>
            <Link href="/equipamentos" className="inline-flex items-center gap-2 px-8 py-4 bg-neutral-900 hover:bg-neutral-800 text-white font-bold rounded-lg transition-colors">
              Solicitar Cotação
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
            </Link>
          </motion.div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
