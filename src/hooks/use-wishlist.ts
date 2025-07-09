
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';

const WISHLIST_STORAGE_KEY = 'kala-connect-wishlist';

interface WishlistContextType {
  wishlist: Set<string>;
  addToWishlist: (productId: string) => void;
  removeFromWishlist: (productId: string) => void;
  toggleWishlist: (productId: string) => void;
}

const WishlistContext = createContext<WishlistContextType | undefined>(undefined);

export function WishlistProvider({ children }: { children: ReactNode }) {
  const [wishlist, setWishlist] = useState<Set<string>>(new Set());
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(WISHLIST_STORAGE_KEY);
      if (item) {
        setWishlist(new Set(JSON.parse(item)));
      }
    } catch (error) {
      console.warn('Could not load wishlist from localStorage', error);
      setWishlist(new Set());
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(WISHLIST_STORAGE_KEY, JSON.stringify(Array.from(wishlist)));
      } catch (error) {
        console.warn('Could not save wishlist to localStorage', error);
      }
    }
  }, [wishlist, isLoaded]);

  const addToWishlist = useCallback((productId: string) => {
    setWishlist((prev) => new Set(prev).add(productId));
  }, []);

  const removeFromWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      newWishlist.delete(productId);
      return newWishlist;
    });
  }, []);
  
  const toggleWishlist = useCallback((productId: string) => {
    setWishlist((prev) => {
      const newWishlist = new Set(prev);
      if (newWishlist.has(productId)) {
        newWishlist.delete(productId);
      } else {
        newWishlist.add(productId);
      }
      return newWishlist;
    });
  }, []);

  const value = { wishlist, addToWishlist, removeFromWishlist, toggleWishlist };

  return React.createElement(WishlistContext.Provider, { value }, children);
}

export function useWishlist() {
  const context = useContext(WishlistContext);
  if (context === undefined) {
    throw new Error('useWishlist must be used within a WishlistProvider');
  }
  return context;
}
