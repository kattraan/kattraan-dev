import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useSelector } from 'react-redux';
import * as cartService from '@/features/cart/services/cartService';

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const isAuthenticated = useSelector((state) => state.auth?.isAuthenticated);
  const [items, setItems] = useState([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);

  const fetchCart = useCallback(async () => {
    if (!isAuthenticated) {
      setItems([]);
      setCount(0);
      return;
    }
    setLoading(true);
    try {
      const { items: nextItems, count: nextCount } = await cartService.getCart();
      setItems(nextItems);
      setCount(nextCount);
    } catch {
      setItems([]);
      setCount(0);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const addItem = useCallback(async (courseId) => {
    const { items: nextItems, count: nextCount } = await cartService.addToCart(courseId);
    setItems(nextItems);
    setCount(nextCount);
    return { items: nextItems, count: nextCount };
  }, []);

  const removeItem = useCallback(async (courseId) => {
    const { items: nextItems, count: nextCount } = await cartService.removeFromCart(courseId);
    setItems(nextItems);
    setCount(nextCount);
    return { items: nextItems, count: nextCount };
  }, []);

  const value = {
    items,
    count,
    loading,
    fetchCart,
    addItem,
    removeItem,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within CartProvider');
  return ctx;
}
