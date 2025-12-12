'use client';

import ProductForm from '@/components/admin/ProductForm';

export default function NewProductPage() {
  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">Novo Produto</h1>
        <p className="text-neutral-400 mt-1">Adicione um novo equipamento ao catálogo</p>
      </div>
      <ProductForm />
    </div>
  );
}
