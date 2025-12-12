'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { motion } from 'framer-motion';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';
import ProductCard from '@/components/site/ProductCard';
import CartDrawer from '@/components/site/CartDrawer';
import { api } from '@/lib/api';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';

export default function ProductPage() {
  const params = useParams();
  const productSlug = params.produto as string;
  
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);

  const { addItem, isInCart, openCart } = useCart();
  const inCart = product ? isInCart(product.id) : false;

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get(`/products/${productSlug}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      } finally {
        setLoading(false);
      }
    }
    if (productSlug) loadProduct();
  }, [productSlug]);

  const handleAddToCart = () => {
    if (product) {
      addItem(product, quantity);
      openCart();
    }
  };

  const images = product?.images?.length ? product.images : product?.featured_image ? [{ id: 0, image_url: product.featured_image, alt_text: product.name }] : [];

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="container mx-auto px-4 py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 animate-pulse">
            <div className="aspect-square bg-neutral-800 rounded-2xl" />
            <div className="space-y-6">
              <div className="h-8 bg-neutral-800 rounded w-1/4" />
              <div className="h-12 bg-neutral-800 rounded w-3/4" />
              <div className="h-24 bg-neutral-800 rounded" />
            </div>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-neutral-950">
        <Header />
        <div className="container mx-auto px-4 py-20 text-center">
          <h1 className="text-3xl font-bold text-white mb-4">Produto não encontrado</h1>
          <p className="text-neutral-400 mb-8">O produto que você procura não existe ou foi removido.</p>
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

      <section className="py-8">
        <div className="container mx-auto px-4">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-sm text-neutral-500 mb-8">
            <Link href="/" className="hover:text-amber-400 transition-colors">Home</Link>
            <span>/</span>
            <Link href="/equipamentos" className="hover:text-amber-400 transition-colors">Equipamentos</Link>
            {product.category_slug && (
              <>
                <span>/</span>
                <Link href={`/equipamentos/${product.category_slug}`} className="hover:text-amber-400 transition-colors">{product.category_name}</Link>
              </>
            )}
            <span>/</span>
            <span className="text-amber-400 truncate max-w-[200px]">{product.name}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Gallery */}
            <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-4">
              {/* Main Image */}
              <div className="relative aspect-square rounded-2xl overflow-hidden bg-neutral-800">
                {images.length > 0 ? (
                  <Image src={images[selectedImage]?.image_url || ''} alt={images[selectedImage]?.alt_text || product.name} fill className="object-cover" priority />
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <svg className="w-24 h-24 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                )}
              </div>

              {/* Thumbnails */}
              {images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img, index) => (
                    <button key={img.id} onClick={() => setSelectedImage(index)} className={`relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 border-2 transition-colors ${selectedImage === index ? 'border-amber-500' : 'border-transparent hover:border-neutral-600'}`}>
                      <Image src={img.image_url} alt={img.alt_text || ''} fill className="object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </motion.div>

            {/* Info */}
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
              {product.category_name && <span className="inline-block px-3 py-1 text-sm font-semibold text-amber-400 bg-amber-400/10 rounded-full">{product.category_name}</span>}
              <h1 className="text-3xl md:text-4xl font-bold text-white">{product.name}</h1>
              {product.sku && <p className="text-neutral-500">Código: {product.sku}</p>}
              {product.short_description && <p className="text-lg text-neutral-400">{product.short_description}</p>}

              {/* Add to Cart */}
              <div className="flex items-center gap-4 py-6 border-y border-neutral-800">
                <div className="flex items-center border border-neutral-700 rounded-lg">
                  <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="px-4 py-3 text-white hover:bg-neutral-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" /></svg>
                  </button>
                  <span className="px-4 py-3 text-white font-semibold min-w-[60px] text-center">{quantity}</span>
                  <button onClick={() => setQuantity(quantity + 1)} className="px-4 py-3 text-white hover:bg-neutral-800 transition-colors">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" /></svg>
                  </button>
                </div>
                <button onClick={handleAddToCart} className={`flex-1 py-4 px-6 rounded-xl font-bold transition-colors flex items-center justify-center gap-2 ${inCart ? 'bg-green-500 text-white' : 'bg-amber-500 hover:bg-amber-400 text-neutral-900'}`}>
                  {inCart ? (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>Adicionado à Cotação</>
                  ) : (
                    <><svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" /></svg>Adicionar à Cotação</>
                  )}
                </button>
              </div>

              {/* Description */}
              {product.description && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">Descrição</h2>
                  <div className="text-neutral-400 prose prose-invert max-w-none" dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
                </div>
              )}

              {/* Specifications */}
              {product.specifications && Object.keys(product.specifications).length > 0 && (
                <div>
                  <h2 className="text-xl font-bold text-white mb-3">Especificações</h2>
                  <dl className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {Object.entries(product.specifications).map(([key, value]) => (
                      <div key={key} className="bg-neutral-800/50 rounded-lg p-4">
                        <dt className="text-sm text-neutral-500">{key}</dt>
                        <dd className="text-white font-medium">{value}</dd>
                      </div>
                    ))}
                  </dl>
                </div>
              )}
            </motion.div>
          </div>

          {/* Related Products */}
          {product.related && product.related.length > 0 && (
            <div className="mt-20">
              <h2 className="text-2xl font-bold text-white mb-8">Produtos Relacionados</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {product.related.map((relatedProduct) => (
                  <ProductCard key={relatedProduct.id} product={relatedProduct} />
                ))}
              </div>
            </div>
          )}
        </div>
      </section>

      <CartDrawer />
      <Footer />
    </div>
  );
}
