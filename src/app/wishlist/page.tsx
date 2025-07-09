
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, ShoppingBag } from 'lucide-react';
import Link from 'next/link';

import { useWishlist } from '@/hooks/use-wishlist';
import { ProductCard } from '@/components/shared/product-card';
import { Button } from '@/components/ui/button';
import { useProductStore } from '@/hooks/use-product-store';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';


export default function WishlistPage() {
  const { wishlist } = useWishlist();
  const { products } = useProductStore();
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  
  const wishlistedProducts = products.filter((p) => wishlist.has(p.id));

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/login?redirect=/wishlist');
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading || !isAuthenticated) {
     return (
       <div className="container mx-auto px-4 py-8">
        <div className="flex items-center gap-4 mb-8">
          <Skeleton className="h-8 w-8" />
          <Skeleton className="h-8 w-48" />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
            {[...Array(5)].map((_, i) => <Skeleton key={i} className="h-64 rounded-lg" />)}
        </div>
      </div>
     );
  }


  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center gap-4 mb-8">
        <Heart className="h-8 w-8 text-primary" />
        <h1 className="text-3xl md:text-4xl font-bold font-headline">My Wishlist</h1>
      </div>

      {wishlistedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
          {wishlistedProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg bg-card">
          <div className="p-6 bg-primary/10 rounded-full">
            <Heart className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-bold font-headline">Your Wishlist is Empty</h2>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven't added anything yet. Let's find something special!
          </p>
          <Button asChild className="mt-6">
            <Link href="/">
              <ShoppingBag className="mr-2 h-4 w-4" />
              Start Shopping
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
