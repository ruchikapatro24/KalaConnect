
'use client';

import React, { createContext, useContext, useState, ReactNode, useEffect, useCallback } from 'react';
import type { AuthUser, UserRole, Order, CartItem, Product } from '@/lib/types';
import { mockProducts } from '@/lib/mock-data';

const USERS_STORAGE_KEY = 'kala-connect-users';
const AUTH_STORAGE_KEY = 'kala-connect-auth';

// The full user profile stored in localStorage, keyed by email.
type UserStore = Record<string, Omit<AuthUser, 'email'> & { password: string }>;

const getMockUsers = (): UserStore => {
  if (typeof window === 'undefined') return {};
  try {
    const users = window.localStorage.getItem(USERS_STORAGE_KEY);
    return users ? JSON.parse(users) : {};
  } catch {
    return {};
  }
};

const setMockUsers = (users: UserStore) => {
    if (typeof window === 'undefined') return;
    window.localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
};

interface AuthContextType {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AuthUser>;
  logout: () => void;
  signup: (name: string, email: string, password: string, role: UserRole) => Promise<void>;
  updateUser: (data: Partial<Pick<AuthUser, 'name'>> & { password?: string }) => Promise<void>;
  deleteAccount: () => Promise<void>;
  addOrder: (cart: CartItem[], total: number, address: Omit<Order['shippingAddress'], 'email' | 'phone'>) => Promise<void>;
  updateOrderStatus: (orderId: string, status: Order['status']) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const syncUserFromStorage = useCallback(() => {
    try {
        const item = window.localStorage.getItem(AUTH_STORAGE_KEY);
        if (item) {
            const { email } = JSON.parse(item);
            const users = getMockUsers();
            if (users[email]) {
                const fullUser: AuthUser = { email, ...users[email] };
                setUser(fullUser);
            } else {
                // User in auth key but not in user store, log them out
                logout();
            }
        } else {
            setUser(null);
        }
    } catch (error) {
        console.warn('Could not sync user from storage', error);
        setUser(null);
    } finally {
        setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const users = getMockUsers();
    
    const demoOrders: Order[] = [
      {
          id: 'order-demo-1',
          date: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
              { ...(mockProducts.find(p => p.id === 'prod-1')!), quantity: 1 },
          ],
          total: 999,
          status: 'Processing',
          shippingAddress: { name: 'Demo User', address: '123 Test St', city: 'Testville', state: 'Testland', pincode: '123456' },
          sustainabilityCoinsEarned: 20,
      },
      {
          id: 'order-demo-2',
          date: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
          items: [
              { ...(mockProducts.find(p => p.id === 'prod-6')!), quantity: 1 },
              { ...(mockProducts.find(p => p.id === 'prod-4')!), quantity: 1 },
          ],
          total: 2998,
          status: 'Delivered',
          shippingAddress: { name: 'Demo User', address: '123 Test St', city: 'Testville', state: 'Testland', pincode: '123456' },
          sustainabilityCoinsEarned: 50,
      }
    ];

    const demoUsers: Record<string, Omit<AuthUser, 'email'> & { password: string }> = {
      'user@example.com': { password: 'password', role: 'user', name: 'Demo User', sustainabilityCoins: 120, orders: demoOrders },
      'seller@gmail.com': { password: 'ruchika', role: 'shopper', name: 'Demo Seller', sustainabilityCoins: 0, orders: [] },
    };
    
    let needsUpdate = false;
    for (const email in demoUsers) {
      if (!users[email] || (email === 'user@example.com' && (!users[email].orders || users[email].orders.length === 0))) {
        users[email] = demoUsers[email];
        needsUpdate = true;
      }
    }
    if (needsUpdate) {
        setMockUsers(users);
    }
    syncUserFromStorage();
  }, [syncUserFromStorage]);

  const signup = useCallback(async (name: string, email: string, password: string, role: UserRole): Promise<void> => {
    const users = getMockUsers();
    if (users[email]) {
      throw new Error('User with this email already exists.');
    }
    users[email] = { password, name, role, sustainabilityCoins: 0, orders: [] };
    setMockUsers(users);
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<AuthUser> => {
    const users = getMockUsers();
    const existingUser = users[email];

    if (!existingUser || existingUser.password !== password) {
      throw new Error('Invalid email or password.');
    }
    
    const authUser: AuthUser = { email, ...existingUser };
    window.localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify({ email }));
    setUser(authUser);
    return authUser;
  }, []);

  const logout = useCallback(() => {
    window.localStorage.removeItem(AUTH_STORAGE_KEY);
    setUser(null);
  }, []);
  
  const updateUser = useCallback(async (data: Partial<Pick<AuthUser, 'name'>> & { password?: string }) => {
    if (!user) throw new Error("Not authenticated");
    const users = getMockUsers();
    const currentUserData = users[user.email];
    if (!currentUserData) throw new Error("User not found");

    if (data.name) currentUserData.name = data.name;
    if (data.password) currentUserData.password = data.password;

    users[user.email] = currentUserData;
    setMockUsers(users);
    syncUserFromStorage();
  }, [user, syncUserFromStorage]);

  const deleteAccount = useCallback(async () => {
    if (!user) throw new Error("Not authenticated");
    const users = getMockUsers();
    delete users[user.email];
    setMockUsers(users);
    logout();
  }, [user, logout]);
  
  const addOrder = useCallback(async (cart: CartItem[], total: number, address: any) => {
    if (!user) throw new Error("Not authenticated");
    const users = getMockUsers();
    const currentUserData = users[user.email];
    if (!currentUserData) throw new Error("User not found");

    const coinsEarned = cart.reduce((acc, item) => acc + (item.sustainabilityCoins || 0) * item.quantity, 0);

    const newOrder: Order = {
        id: `order-${Date.now()}`,
        date: new Date().toISOString(),
        items: cart,
        total: total,
        status: 'Processing',
        shippingAddress: address,
        sustainabilityCoinsEarned: coinsEarned
    };
    
    if (!currentUserData.orders) {
        currentUserData.orders = [];
    }
    
    currentUserData.orders.unshift(newOrder);
    currentUserData.sustainabilityCoins += coinsEarned;
    users[user.email] = currentUserData;
    setMockUsers(users);
    syncUserFromStorage();

  }, [user, syncUserFromStorage]);

  const updateOrderStatus = useCallback(async (orderId: string, status: Order['status']) => {
    if (!user) throw new Error("Not authenticated");
    const users = getMockUsers();
    const currentUserData = users[user.email];
    if (!currentUserData) throw new Error("User not found");

    const orderIndex = currentUserData.orders.findIndex(o => o.id === orderId);
    if (orderIndex === -1) throw new Error("Order not found");

    currentUserData.orders[orderIndex].status = status;
    users[user.email] = currentUserData;
    setMockUsers(users);
    syncUserFromStorage();
  }, [user, syncUserFromStorage]);

  const value = {
    user,
    isAuthenticated: !!user,
    isLoading,
    login,
    logout,
    signup,
    updateUser,
    deleteAccount,
    addOrder,
    updateOrderStatus
  };

  return React.createElement(AuthContext.Provider, { value }, children);
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
