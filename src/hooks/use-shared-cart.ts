
'use client';

import { useState, useEffect, useCallback } from 'react';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import type { CartItem, Product } from '@/lib/types';

export function useSharedCart(cartId: string) {
  const [cart, setCart] = useState<CartItem[] | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!cartId) {
      setLoading(false);
      return;
    }

    setLoading(true);
    const cartRef = doc(db, 'sharedCarts', cartId);

    const unsubscribe = onSnapshot(cartRef, (docSnap) => {
      if (docSnap.exists()) {
        const data = docSnap.data();
        setCart(data.items || []);
      } else {
        setCart(null); // Cart not found
        console.error("Shared cart not found");
      }
      setLoading(false);
    }, (error) => {
        console.error("Error fetching shared cart:", error);
        setCart(null);
        setLoading(false);
    });

    return () => unsubscribe();
  }, [cartId]);
  
  const updateFirestoreCart = async (newCart: CartItem[]) => {
      if (!cartId) return;
      try {
        const cartRef = doc(db, 'sharedCarts', cartId);
        // Using setDoc with merge: true is safer to not overwrite other fields like createdAt
        await setDoc(cartRef, { items: newCart }, { merge: true });
      } catch (error) {
          console.error("Failed to update shared cart:", error);
      }
  };

  const updateItemQuantity = useCallback((productId: string, quantity: number) => {
    if (cart === null) return;
    
    let newCart: CartItem[];
    if (quantity > 0) {
        newCart = cart.map((item) =>
            item.id === productId ? { ...item, quantity } : item
        );
    } else {
        newCart = cart.filter((item) => item.id !== productId);
    }
    setCart(newCart); // Optimistic update
    updateFirestoreCart(newCart);
  }, [cart, cartId]);
  
  const removeFromCart = useCallback((productId: string) => {
    if (cart === null) return;
    const newCart = cart.filter((item) => item.id !== productId);
    setCart(newCart); // Optimistic update
    updateFirestoreCart(newCart);
  }, [cart, cartId]);

  const getCartSubtotal = useCallback(() => {
    return cart?.reduce((total, item) => total + item.price * item.quantity, 0) || 0;
  }, [cart]);

  const getCartCoins = useCallback(() => {
    return cart?.reduce((total, item) => total + (item.sustainabilityCoins || 0) * item.quantity, 0) || 0;
  }, [cart]);

  const getCartTotal = useCallback(() => {
    return getCartSubtotal();
  }, [getCartSubtotal]);

  return { cart, loading, updateItemQuantity, removeFromCart, getCartSubtotal, getCartCoins, getCartTotal };
}
