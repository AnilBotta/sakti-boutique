'use client';

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import type { CartLineItem } from './types';
import { subtotal as calcSubtotal, itemCount as calcCount } from './totals';

interface CartState {
  items: CartLineItem[];
  isOpen: boolean;
  hydrated: boolean;

  open: () => void;
  close: () => void;
  toggle: () => void;

  add: (item: CartLineItem) => void;
  remove: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  clear: () => void;
}

export const useCart = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,
      hydrated: false,

      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set({ isOpen: !get().isOpen }),

      add: (item) =>
        set((state) => {
          const existing = state.items.find((i) => i.id === item.id);
          if (existing) {
            return {
              items: state.items.map((i) =>
                i.id === item.id
                  ? { ...i, quantity: Math.min(99, i.quantity + item.quantity) }
                  : i,
              ),
            };
          }
          return { items: [...state.items, item] };
        }),

      remove: (id) =>
        set((state) => ({ items: state.items.filter((i) => i.id !== id) })),

      updateQty: (id, qty) =>
        set((state) => ({
          items: state.items.map((i) =>
            i.id === id ? { ...i, quantity: Math.max(1, Math.min(99, qty)) } : i,
          ),
        })),

      clear: () => set({ items: [] }),
    }),
    {
      name: 'sakti-cart',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items, hydrated: state.hydrated }),
    },
  ),
);

// Selectors
export const selectSubtotal = (s: CartState) => calcSubtotal(s.items);
export const selectItemCount = (s: CartState) => calcCount(s.items);
