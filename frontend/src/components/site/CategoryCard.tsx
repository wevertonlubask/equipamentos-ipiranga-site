'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { Category } from '@/types';

interface CategoryCardProps {
  category: Category;
}

export default function CategoryCard({ category }: CategoryCardProps) {
  return (
    <Link href={`/equipamentos/${category.slug}`}>
      <motion.div
        whileHover={{ y: -5 }}
        className="group relative h-64 rounded-2xl overflow-hidden bg-neutral-800 border border-neutral-700 hover:border-amber-500/50 transition-all duration-300"
      >
        {category.image ? (
          <Image src={category.image} alt={category.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-neutral-800 to-neutral-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-neutral-900 via-neutral-900/60 to-transparent" />
        <div className="absolute inset-0 p-6 flex flex-col justify-end">
          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-amber-400 transition-colors">{category.name}</h3>
          {category.description && <p className="text-neutral-400 text-sm line-clamp-2 mb-3">{category.description}</p>}
          <div className="flex items-center justify-between">
            {category.product_count !== undefined && (
              <span className="text-sm text-neutral-500">{category.product_count} equipamento{category.product_count !== 1 ? 's' : ''}</span>
            )}
            <span className="flex items-center gap-1 text-amber-500 text-sm font-semibold group-hover:gap-2 transition-all">
              Ver produtos
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" /></svg>
            </span>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
