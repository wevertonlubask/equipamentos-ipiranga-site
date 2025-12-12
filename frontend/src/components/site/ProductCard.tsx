'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Product } from '@/types';
import { useCart } from '@/hooks/useCart';

interface ProductCardProps {
  product: Product;
  showAddToCart?: boolean;
}

export default function ProductCard({ product, showAddToCart = true }: ProductCardProps) {
  const { addItem, isInCart } = useCart();
  const inCart = isInCart(product.id);

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    addItem(product);
  };

  const productUrl = `/equipamentos/${product.category_slug}/${product.slug}`;

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="group bg-neutral-900 rounded-2xl overflow-hidden border border-neutral-800 hover:border-amber-500/50 transition-all duration-300"
    >
      <Link href={productUrl}>
        {/* Image */}
        <div className="relative aspect-square overflow-hidden bg-neutral-800">
          {product.featured_image ? (
            <Image
              src={product.featured_image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-110 transition-transform duration-500"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <svg className="w-16 h-16 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badge Destaque */}
          {product.is_featured && (
            <div className="absolute top-3 left-3 px-3 py-1 bg-amber-500 text-neutral-900 text-xs font-bold rounded-full">
              Destaque
            </div>
          )}

          {/* Quick Add */}
          {showAddToCart && (
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              whileHover={{ scale: 1.05 }}
              onClick={handleAddToCart}
              className={`absolute bottom-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 ${
                inCart 
                  ? 'bg-green-500 text-white' 
                  : 'bg-amber-500 text-neutral-900 hover:bg-amber-400'
              }`}
            >
              {inCart ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
              )}
            </motion.button>
          )}
        </div>

        {/* Content */}
        <div className="p-5">
          {/* Category */}
          {product.category_name && (
            <span className="text-xs font-semibold text-amber-500 uppercase tracking-wider">
              {product.category_name}
            </span>
          )}

          {/* Name */}
          <h3 className="text-lg font-bold text-white mt-1 mb-2 line-clamp-2 group-hover:text-amber-400 transition-colors">
            {product.name}
          </h3>

          {/* Description */}
          {product.short_description && (
            <p className="text-sm text-neutral-400 line-clamp-2">
              {product.short_description}
            </p>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="text-xs text-neutral-500 mt-3">
              Cód: {product.sku}
            </p>
          )}
        </div>
      </Link>

      {/* Footer Actions */}
      {showAddToCart && (
        <div className="px-5 pb-5 pt-0">
          <button
            onClick={handleAddToCart}
            className={`w-full py-3 rounded-lg font-semibold transition-colors ${
              inCart
                ? 'bg-green-500/10 text-green-500 border border-green-500/30'
                : 'bg-amber-500/10 text-amber-500 hover:bg-amber-500 hover:text-neutral-900 border border-amber-500/30'
            }`}
          >
            {inCart ? (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                Adicionado
              </span>
            ) : (
              <span className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
                Adicionar à Cotação
              </span>
            )}
          </button>
        </div>
      )}
    </motion.div>
  );
}
