/**
 * Store do Carrinho de Cotação
 * 
 * @module hooks/useCart
 * @description Gerenciamento de estado do carrinho com Zustand
 */

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { Product, CartItem } from '@/types';

interface CartStore {
  // Estado
  items: CartItem[];
  isOpen: boolean;
  
  // Ações
  addItem: (product: Product, quantity?: number) => void;
  removeItem: (productId: number) => void;
  updateQuantity: (productId: number, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  openCart: () => void;
  closeCart: () => void;
  
  // Getters computados
  getTotalItems: () => number;
  getItemCount: () => number;
  getCartItems: () => CartItem[];
  getItem: (productId: number) => CartItem | undefined;
  isInCart: (productId: number) => boolean;
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      // Estado inicial
      items: [],
      isOpen: false,

      // Adicionar item ao carrinho
      addItem: (product: Product, quantity: number = 1) => {
        set((state) => {
          const existingItem = state.items.find(
            (item) => item.product.id === product.id
          );

          if (existingItem) {
            // Incrementar quantidade se já existe
            return {
              items: state.items.map((item) =>
                item.product.id === product.id
                  ? { ...item, quantity: item.quantity + quantity }
                  : item
              ),
              isOpen: true, // Abrir carrinho ao adicionar
            };
          }

          // Adicionar novo item
          return {
            items: [...state.items, { product, quantity }],
            isOpen: true,
          };
        });
      },

      // Remover item do carrinho
      removeItem: (productId: number) => {
        set((state) => ({
          items: state.items.filter((item) => item.product.id !== productId),
        }));
      },

      // Atualizar quantidade
      updateQuantity: (productId: number, quantity: number) => {
        if (quantity <= 0) {
          get().removeItem(productId);
          return;
        }

        set((state) => ({
          items: state.items.map((item) =>
            item.product.id === productId ? { ...item, quantity } : item
          ),
        }));
      },

      // Limpar carrinho
      clearCart: () => {
        set({ items: [], isOpen: false });
      },

      // Toggle do drawer
      toggleCart: () => {
        set((state) => ({ isOpen: !state.isOpen }));
      },

      openCart: () => {
        set({ isOpen: true });
      },

      closeCart: () => {
        set({ isOpen: false });
      },

      // Obter total de itens (soma das quantidades)
      getTotalItems: () => {
        return get().items.reduce((total, item) => total + item.quantity, 0);
      },

      // Obter número de produtos diferentes
      getItemCount: () => {
        return get().items.length;
      },

      // Obter todos os itens
      getCartItems: () => {
        return get().items;
      },

      // Obter item específico
      getItem: (productId: number) => {
        return get().items.find((item) => item.product.id === productId);
      },

      // Verificar se produto está no carrinho
      isInCart: (productId: number) => {
        return get().items.some((item) => item.product.id === productId);
      },
    }),
    {
      name: 'ipiranga-cart', // Nome no localStorage
      partialize: (state) => ({ items: state.items }), // Persistir apenas items
    }
  )
);

/**
 * Hook auxiliar para acessar dados do carrinho
 */
export function useCartData() {
  const items = useCart((state) => state.items);
  const totalItems = items.reduce((total, item) => total + item.quantity, 0);
  const itemCount = items.length;

  return {
    items,
    totalItems,
    itemCount,
    isEmpty: itemCount === 0,
  };
}

export default useCart;
