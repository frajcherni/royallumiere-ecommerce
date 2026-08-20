import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { Article } from '../api';

export interface CartItem {
  article_id: number;
  designation: string;
  reference: string;
  prix_ttc: number;
  prix_ht: number;
  tva: number;
  image: string;
  quantite: number;
}

interface CartContextType {
  items: CartItem[];
  addToCart: (article: Article, qty?: number) => void;
  removeFromCart: (article_id: number) => void;
  updateQty: (article_id: number, qty: number) => void;
  clearCart: () => void;
  totalItems: number;
  totalAmount: number;
  isCartOpen: boolean;
  openCart: () => void;
  closeCart: () => void;
}

const CartContext = createContext<CartContextType | null>(null);

const CART_KEY = 'rl_cart_v1';

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [items, setItems] = useState<CartItem[]>(() => {
    try { return JSON.parse(localStorage.getItem(CART_KEY) || '[]'); }
    catch { return []; }
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  const addToCart = useCallback((article: Article, qty = 1) => {
    setItems(prev => {
      const existing = prev.find(i => i.article_id === article.id);
      if (existing) {
        return prev.map(i =>
          i.article_id === article.id ? { ...i, quantite: i.quantite + qty } : i
        );
      }
      return [...prev, {
        article_id: article.id,
        designation: article.designation,
        reference: article.reference,
        prix_ttc: Number(article.puv_ttc),
        prix_ht: Number(article.puv_ht),
        tva: Number(article.tva) || 0,
        image: article.image,
        quantite: qty,
      }];
    });
  }, []);

  const removeFromCart = useCallback((article_id: number) => {
    setItems(prev => prev.filter(i => i.article_id !== article_id));
  }, []);

  const updateQty = useCallback((article_id: number, qty: number) => {
    if (qty <= 0) {
      setItems(prev => prev.filter(i => i.article_id !== article_id));
    } else {
      setItems(prev => prev.map(i => i.article_id === article_id ? { ...i, quantite: qty } : i));
    }
  }, []);

  const clearCart = useCallback(() => setItems([]), []);
  const openCart = useCallback(() => setIsCartOpen(true), []);
  const closeCart = useCallback(() => setIsCartOpen(false), []);

  const totalItems = items.reduce((s, i) => s + i.quantite, 0);
  const totalAmount = items.reduce((s, i) => s + i.prix_ttc * i.quantite, 0);

  return (
    <CartContext.Provider value={{
      items, addToCart, removeFromCart, updateQty, clearCart,
      totalItems, totalAmount,
      isCartOpen, openCart, closeCart,
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = (): CartContextType => {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
};
