'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import ProductForm from '@/components/admin/ProductForm';
import { api } from '@/lib/api';
import { Product } from '@/types';

export default function EditProductPage() {
  const params = useParams();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadProduct() {
      try {
        const res = await api.get(`/products/${params.id}`);
        setProduct(res.data.data);
      } catch (error) {
        console.error('Erro ao carregar produto:', error);
      } finally {
        setLoading(false);
      }
    }
    if (params.id) loadProduct();
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="animate-pulse space-y-8">
          <div className="h-10 bg-neutral-800 rounded w-1/3" />
          <div className="h-6 bg-neutral-800 rounded w-1/4" />
          <div className="bg-neutral-900 rounded-xl p-6 space-y-4">
            <div className="h-10 bg-neutral-800 rounded" />
            <div className="h-10 bg-neutral-800 rounded" />
            <div className="h-32 bg-neutral-800 rounded" />
          </div>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="p-8">
        <div className="bg-neutral-900 rounded-xl p-12 text-center border border-neutral-800">
          <h1 className="text-2xl font-bold text-white mb-2">Produto não encontrado</h1>
          <p className="text-neutral-400">O produto solicitado não existe ou foi removido.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Editar Produto</h1>
        <p className="text-neutral-400 mt-1">{product.name}</p>
      </div>
      <ProductForm product={product} isEdit />
    </div>
  );
}
