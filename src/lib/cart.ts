"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { Product } from "./data";

export type CartLine = { product: Product; quantity: number; packSize: string };
type CartState = {
  items: CartLine[];
  add: (product: Product, packSize?: string) => void;
  remove: (slug: string) => void;
  setQuantity: (slug: string, quantity: number) => void;
  clear: () => void;
};

export const useCart = create<CartState>()(persist((set) => ({
  items: [],
  add: (product, packSize = product.packSize) => set((state) => {
    const found = state.items.find((item) => item.product.slug === product.slug && item.packSize === packSize);
    return { items: found ? state.items.map((item) => item === found ? { ...item, quantity: item.quantity + 1 } : item) : [...state.items, { product, quantity: 1, packSize }] };
  }),
  remove: (slug) => set((state) => ({ items: state.items.filter((item) => item.product.slug !== slug) })),
  setQuantity: (slug, quantity) => set((state) => ({ items: quantity < 1 ? state.items.filter((item) => item.product.slug !== slug) : state.items.map((item) => item.product.slug === slug ? { ...item, quantity } : item) })),
  clear: () => set({ items: [] }),
}), { name: "naomi_pharmacy_cart", storage: createJSONStorage(() => localStorage) }));
