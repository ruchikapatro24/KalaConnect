
'use client';

import { WishlistProvider } from '@/hooks/use-wishlist';
import { ProductProvider } from '@/hooks/use-product-store';
import { ReelProvider } from '@/hooks/use-reel-store';
import { AuthProvider } from '@/hooks/use-auth';
import { CartProvider } from '@/hooks/use-cart';
import { I18nProvider } from '@/hooks/use-i18n';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <I18nProvider>
      <AuthProvider>
        <WishlistProvider>
          <ProductProvider>
            <CartProvider>
              <ReelProvider>{children}</ReelProvider>
            </CartProvider>
          </ProductProvider>
        </WishlistProvider>
      </AuthProvider>
    </I18nProvider>
  );
}
