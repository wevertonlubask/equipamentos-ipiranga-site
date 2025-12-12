'use client';

import { Fragment, useState } from 'react';
import Image from 'next/image';
import { motion, AnimatePresence } from 'framer-motion';
import { useCart } from '@/hooks/useCart';
import QuotationModal from './QuotationModal';

export default function CartDrawer() {
  const { items, isOpen, closeCart, removeItem, updateQuantity, getTotalItems, clearCart } = useCart();
  const [showQuotationModal, setShowQuotationModal] = useState(false);

  const handleRequestQuotation = () => {
    closeCart();
    setShowQuotationModal(true);
  };

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={closeCart}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
          />
        )}
      </AnimatePresence>

      {/* Drawer */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 h-full w-full max-w-md bg-neutral-900 shadow-2xl z-50 flex flex-col"
          >
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-800">
              <div>
                <h2 className="text-xl font-bold text-white">Sua Cotação</h2>
                <p className="text-sm text-neutral-400">{getTotalItems()} item(ns)</p>
              </div>
              <button onClick={closeCart} className="p-2 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto p-6">
              {items.length === 0 ? (
                <div className="text-center py-12">
                  <svg className="w-16 h-16 text-neutral-700 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                  <h3 className="text-lg font-semibold text-white mb-2">Sua cotação está vazia</h3>
                  <p className="text-neutral-400 text-sm">Adicione equipamentos para solicitar uma cotação</p>
                </div>
              ) : (
                <ul className="space-y-4">
                  {items.map((item) => (
                    <li key={item.product.id} className="bg-neutral-800/50 rounded-xl p-4 border border-neutral-700">
                      <div className="flex gap-4">
                        {/* Image */}
                        <div className="w-20 h-20 rounded-lg overflow-hidden bg-neutral-700 flex-shrink-0">
                          {item.product.featured_image ? (
                            <Image src={item.product.featured_image} alt={item.product.name} width={80} height={80} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <svg className="w-8 h-8 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                              </svg>
                            </div>
                          )}
                        </div>

                        {/* Info */}
                        <div className="flex-1 min-w-0">
                          <h4 className="font-semibold text-white truncate">{item.product.name}</h4>
                          {item.product.sku && <p className="text-xs text-neutral-500">Cód: {item.product.sku}</p>}

                          {/* Quantity Controls */}
                          <div className="flex items-center gap-2 mt-3">
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                              className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center text-white hover:bg-neutral-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                              </svg>
                            </button>
                            <span className="w-10 text-center font-semibold text-white">{item.quantity}</span>
                            <button
                              onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                              className="w-8 h-8 rounded-lg bg-neutral-700 flex items-center justify-center text-white hover:bg-neutral-600 transition-colors"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                              </svg>
                            </button>
                          </div>
                        </div>

                        {/* Remove */}
                        <button
                          onClick={() => removeItem(item.product.id)}
                          className="p-2 text-neutral-500 hover:text-red-500 transition-colors self-start"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {/* Footer */}
            {items.length > 0 && (
              <div className="p-6 border-t border-neutral-800 space-y-4">
                <button onClick={clearCart} className="w-full py-3 text-neutral-400 hover:text-red-500 transition-colors text-sm">
                  Limpar cotação
                </button>
                <button onClick={handleRequestQuotation} className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-neutral-900 font-bold rounded-xl transition-colors flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Solicitar Cotação
                </button>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Quotation Modal */}
      <QuotationModal isOpen={showQuotationModal} onClose={() => setShowQuotationModal(false)} />
    </>
  );
}
