
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { Product, Review } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';

interface ProductContextType {
  products: Product[];
  addProduct: (productData: Omit<Product, 'id' | 'sellerId' | 'image' | 'dataAiHint'>, image: string, sellerId: string) => void;
  addReviewToProduct: (productId: string, reviewData: Omit<Review, 'id' | 'date'>) => void;
}

const ProductContext = createContext<ProductContextType | undefined>(undefined);
const PRODUCTS_STORAGE_KEY = 'products';

export function ProductProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    try {
      const item = window.localStorage.getItem(PRODUCTS_STORAGE_KEY);
      if (item) {
        const storedProducts: Product[] = JSON.parse(item);
        const mockProductMap = new Map(mockProducts.map(p => [p.id, p]));

        const allProductIds = new Set([...storedProducts.map(p => p.id), ...mockProducts.map(p => p.id)]);

        const updatedProducts = Array.from(allProductIds).map(id => {
          const storedProduct = storedProducts.find(p => p.id === id);
          const mockProduct = mockProductMap.get(id);

          let finalProduct: Product | null = null;
          if (storedProduct && mockProduct) {
            finalProduct = { ...mockProduct, ...storedProduct };
          } else if (storedProduct) {
            finalProduct = storedProduct;
          } else if (mockProduct) {
            finalProduct = mockProduct;
          }
          
          if (finalProduct) {
            finalProduct.stock = finalProduct.stock ?? 0;
          }

          return finalProduct;
        }).filter((p): p is Product => p !== null);

        setProducts(updatedProducts);
      } else {
        setProducts(mockProducts);
      }
    } catch (error) {
      console.warn('Error reading products from localStorage, falling back to mock data', error);
      setProducts(mockProducts);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (isLoaded) {
      try {
        window.localStorage.setItem(PRODUCTS_STORAGE_KEY, JSON.stringify(products));
      } catch (error) {
        console.warn('Error saving products to localStorage', error);
      }
    }
  }, [products, isLoaded]);

  const addProduct = useCallback((productData: Omit<Product, 'id' | 'sellerId' | 'image' | 'dataAiHint'>, image: string, sellerId: string) => {
    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}`,
      sellerId: sellerId,
      image: image,
      aiGenerated: true,
      dataAiHint: productData.name.toLowerCase().split(' ').slice(0, 2).join(' '),
      stock: productData.stock ?? 0,
    };
    setProducts((prev) => [newProduct, ...prev]);
  }, []);

  const addReviewToProduct = useCallback((productId: string, reviewData: Omit<Review, 'id' | 'date'>) => {
    const newReview: Review = {
        ...reviewData,
        id: `rev-${Date.now()}`,
        date: new Date().toISOString(),
    };

    setProducts(prevProducts => {
        return prevProducts.map(product => {
            if (product.id === productId) {
                const updatedReviews = product.reviews ? [...product.reviews, newReview] : [newReview];
                return { ...product, reviews: updatedReviews };
            }
            return product;
        });
    });
  }, []);

  return React.createElement(ProductContext.Provider, {
    value: { products, addProduct, addReviewToProduct }
  }, children);
}

export function useProductStore() {
  const context = useContext(ProductContext);
  if (context === undefined) {
    throw new Error('useProductStore must be used within a ProductProvider');
  }
  return context;
}
