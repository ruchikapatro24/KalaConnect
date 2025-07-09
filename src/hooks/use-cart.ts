
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { CartItem, Product } from '@/lib/types';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';

const CART_STORAGE_KEY = 'kala-connect-cart';

interface CartContextType {
  cart: CartItem[];
  setCart: React.Dispatch<React.SetStateAction<CartItem[]>>;
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateItemQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCartSubtotal: () => number;
  getCartTotal: () => number;
  getCartItemCount: () => number;
  getCartCoins: () => number;
  createSharedCart: () => Promise<string>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export function CartProvider({ children }: { children: ReactNode }) {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(CART_STORAGE_KEY);
      if (item) {
        setCart(JSON.parse(item));
      }
    } catch (error) {
      console.warn('Could not load cart from localStorage', error);
      setCart([]);
    } finally {
        setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if(isLoaded) {
        try {
            window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
        } catch (error) {
            console.warn('Could not save cart to localStorage', error);
        }
    }
  }, [cart, isLoaded]);

  const addToCart = useCallback((product: Product, quantity = 1) => {
    setCart((prevCart) => {
      const existingItem = prevCart.find((item) => item.id === product.id);
      if (existingItem) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, quantity: item.quantity + quantity } : item
        );
      }
      return [...prevCart, { ...product, quantity }];
    });
  }, []);

  const removeFromCart = useCallback((productId: string) => {
    setCart((prevCart) => {
      return prevCart.filter((item) => item.id !== productId);
    });
  }, []);

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    setCart((prevCart) => {
      if (quantity <= 0) {
        return prevCart.filter((item) => item.id !== productId);
      }
      return prevCart.map((item) =>
        item.id === productId ? { ...item, quantity } : item
      );
    });
  }, []);

  const clearCart = useCallback(() => {
    setCart([]);
  }, []);
  
  const getCartSubtotal = useCallback(() => {
    return cart.reduce((total, item) => total + item.price * item.quantity, 0);
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return getCartSubtotal(); // Add shipping, taxes etc. here if needed in future
  }, [cart]);
  
  const getCartItemCount = useCallback(() => {
    return cart.reduce((total, item) => total + item.quantity, 0);
  }, [cart]);

  const getCartCoins = useCallback(() => {
    return cart.reduce((total, item) => total + (item.sustainabilityCoins || 0) * item.quantity, 0);
  }, [cart]);

  const createSharedCart = useCallback(async (): Promise<string> => {
    if (cart.length === 0) {
      throw new Error("Cannot share an empty cart.");
    }
    try {
      const docRef = await addDoc(collection(db, "sharedCarts"), {
        items: cart,
        createdAt: new Date(),
      });
      return docRef.id;
    } catch (error) {
      console.error("Error creating shared cart: ", error);
      throw new Error("Could not create a shareable cart link.");
    }
  }, [cart]);


  const value = { cart, setCart, addToCart, removeFromCart, clearCart, getCartSubtotal, getCartTotal, getCartItemCount, getCartCoins, updateItemQuantity, createSharedCart };

  return React.createElement(CartContext.Provider, { value }, children);
}

export function useCart() {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
}
