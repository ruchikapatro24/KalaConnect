
'use client';

import React, { createContext, useContext, useState, ReactNode, useCallback, useMemo, useEffect } from 'react';
import en from '@/lib/translations/en.json';
import hi from '@/lib/translations/hi.json';
import mr from '@/lib/translations/mr.json';
import bn from '@/lib/translations/bn.json';
import kn from '@/lib/translations/kn.json';
import or from '@/lib/translations/or.json';
import pa from '@/lib/translations/pa.json';
import ta from '@/lib/translations/ta.json';
import te from '@/lib/translations/te.json';
import ur from '@/lib/translations/ur.json';

const I18N_STORAGE_KEY = 'kala-connect-i18n-locale';

// Simple deep key access
const get = (obj: any, path: string) => path.split('.').reduce((acc, part) => acc && acc[part], obj);

const translations = {
  en,
  hi,
  mr,
  bn,
  kn,
  or,
  pa,
  ta,
  te,
  ur,
};

type Locale = keyof typeof translations;
const availableLocales: Locale[] = ['en', 'hi', 'mr', 'bn', 'kn', 'or', 'pa', 'ta', 'te', 'ur'];

interface I18nContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
}

const I18nContext = createContext<I18nContextType | undefined>(undefined);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>('en');

  useEffect(() => {
    try {
        const storedLocale = window.localStorage.getItem(I18N_STORAGE_KEY);
        if (storedLocale && availableLocales.includes(storedLocale as Locale)) {
            setLocale(storedLocale as Locale);
        }
    } catch (error) {
        console.warn('Could not load locale from localStorage', error);
    }
  }, []);

  const handleSetLocale = useCallback((newLocale: Locale) => {
    setLocale(newLocale);
    try {
        window.localStorage.setItem(I18N_STORAGE_KEY, newLocale);
    } catch (error) {
        console.warn('Could not save locale to localStorage', error);
    }
  }, []);

  const t = useCallback((key: string): string => {
    const translation = get(translations[locale], key);
    // Fallback to english if translation not found
    return translation || get(translations['en'], key) || key;
  }, [locale]);

  const value = useMemo(() => ({
    locale,
    setLocale: handleSetLocale,
    t,
  }), [locale, handleSetLocale, t]);

  return React.createElement(I18nContext.Provider, { value }, children);
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (context === undefined) {
    throw new Error('useI18n must be used within an I18nProvider');
  }
  return context;
}
