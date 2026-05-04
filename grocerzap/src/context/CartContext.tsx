'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

export interface CartItem {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: string;
  qty: number;
}

interface AddableItem {
  id: string;
  name: string;
  price: number;
  image: string;
  weight: string;
}

interface CartContextType {
  items: CartItem[];
  addItem: (item: AddableItem) => void;
  removeItem: (id: string) => void;
  removeAllOfItem: (id: string) => void;
  getItemQty: (id: string) => number;
  getTotalItems: () => number;
  getTotalPrice: () => number;
  clearCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);

  const addItem = useCallback((item: AddableItem) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === item.id);
      if (existing) {
        return prev.map((i) => i.id === item.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...item, qty: 1 }];
    });
  }, []);

  const removeItem = useCallback((id: string) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing && existing.qty > 1) {
        return prev.map((i) => i.id === id ? { ...i, qty: i.qty - 1 } : i);
      }
      return prev.filter((i) => i.id !== id);
    });
  }, []);

  const removeAllOfItem = useCallback((id: string) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const getItemQty = useCallback((id: string) => {
    return items.find((i) => i.id === id)?.qty ?? 0;
  }, [items]);

  const getTotalItems = useCallback(() => {
    return items.reduce((acc, i) => acc + i.qty, 0);
  }, [items]);

  const getTotalPrice = useCallback(() => {
    return items.reduce((acc, i) => acc + i.price * i.qty, 0);
  }, [items]);

  const clearCart = useCallback(() => setItems([]), []);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, removeAllOfItem, getItemQty, getTotalItems, getTotalPrice, clearCart }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}