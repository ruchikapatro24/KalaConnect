
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Reel } from '@/lib/types';
import { mockReels } from '@/lib/mock-data';

interface ReelContextType {
  reels: Reel[];
  addReel: (reelData: Omit<Reel, 'id' | 'sellerId' | 'videoUrl'>, videoUrl: string, sellerId: string) => void;
}

const ReelContext = createContext<ReelContextType | undefined>(undefined);
const REELS_STORAGE_KEY = 'reels';

export function ReelProvider({ children }: { children: ReactNode }) {
  const [reels, setReels] = useState<Reel[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  
  useEffect(() => {
    try {
      const item = window.localStorage.getItem(REELS_STORAGE_KEY);
      if (item) {
        setReels(JSON.parse(item));
      } else {
        setReels(mockReels);
      }
    } catch (error) {
      console.warn('Error reading reels from localStorage, falling back to mocks', error);
      setReels(mockReels);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
          window.localStorage.setItem(REELS_STORAGE_KEY, JSON.stringify(reels));
      } catch (error) {
          console.warn('Error saving reels to localStorage', error);
      }
    }
  }, [reels, isLoaded]);

  const addReel = useCallback((reelData: Omit<Reel, 'id' | 'sellerId' | 'videoUrl'>, videoUrl: string, sellerId: string) => {
    const newReel: Reel = {
      ...reelData,
      id: `reel-${Date.now()}`,
      sellerId,
      videoUrl,
    };
    setReels((prev) => [newReel, ...prev]);
  }, []);

  return React.createElement(ReelContext.Provider, {
    value: { reels, addReel }
  }, children);
}

export function useReelStore() {
  const context = useContext(ReelContext);
  if (context === undefined) {
    throw new Error('useReelStore must be used within a ReelProvider');
  }
  return context;
}
