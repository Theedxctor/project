'use client';
import { createContext, useContext, useState, ReactNode } from 'react';

export interface CartItem { id: number; name: string; price: number; quantity: number; restaurantId: number; }

interface CartContextType {
  items: CartItem[];
  restaurantId: number | null;
  addItem: (item: Omit<CartItem,'quantity'>) => void;
  removeItem: (id: number) => void;
  updateQty: (id: number, qty: number) => void;
  clear: () => void;
  total: number;
  count: number;
}

const CartContext = createContext<CartContextType | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [restaurantId, setRestaurantId] = useState<number | null>(null);

  const addItem = (item: Omit<CartItem,'quantity'>) => {
    if (restaurantId && restaurantId !== item.restaurantId) {
      if (!confirm('Adding from a different restaurant clears your cart. Continue?')) return;
      setItems([]); setRestaurantId(null);
    }
    setRestaurantId(item.restaurantId);
    setItems(prev => {
      const exists = prev.find(i => i.id === item.id);
      if (exists) return prev.map(i => i.id === item.id ? {...i, quantity: i.quantity+1} : i);
      return [...prev, {...item, quantity: 1}];
    });
  };

  const removeItem = (id: number) => setItems(prev => { const next = prev.filter(i => i.id !== id); if (!next.length) setRestaurantId(null); return next; });
  const updateQty = (id: number, qty: number) => { if (qty <= 0) { removeItem(id); return; } setItems(prev => prev.map(i => i.id === id ? {...i, quantity: qty} : i)); };
  const clear = () => { setItems([]); setRestaurantId(null); };
  const total = items.reduce((s,i) => s + i.price*i.quantity, 0);
  const count = items.reduce((s,i) => s + i.quantity, 0);

  return <CartContext.Provider value={{ items, restaurantId, addItem, removeItem, updateQty, clear, total, count }}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
