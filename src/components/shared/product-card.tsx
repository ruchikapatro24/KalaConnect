
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { Heart } from 'lucide-react';
import type { Product } from '@/lib/types';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useWishlist } from '@/hooks/use-wishlist';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { wishlist, toggleWishlist } = useWishlist();
  const isWishlisted = wishlist.has(product.id);
  const discount = product.originalPrice
    ? Math.round(((product.originalPrice - product.price) / product.originalPrice) * 100)
    : 0;

  return (
    <Card className="group overflow-hidden relative flex flex-col h-full">
      <CardHeader className="p-0">
        <Link href={`/product/${product.id}`} className="block relative">
           {discount > 0 && (
            <Badge variant="destructive" className="absolute top-2 left-2 z-10">
              {discount}% OFF
            </Badge>
          )}
          <Image
            src={product.image}
            alt={product.name}
            width={300}
            height={300}
            className="object-cover w-full aspect-square group-hover:scale-105 transition-transform duration-300"
            data-ai-hint={product.dataAiHint}
          />
        </Link>
      </CardHeader>
      <CardContent className="p-3 flex-grow">
        <h3 className="font-headline text-base font-semibold leading-tight tracking-tight">
          <Link href={`/product/${product.id}`} className="hover:text-primary transition-colors">
            {product.name}
          </Link>
        </h3>
      </CardContent>
      <CardFooter className="p-3 pt-0 flex justify-between items-center">
        <div className="flex items-baseline gap-2">
            <p className="font-semibold text-lg">
            ₹{product.price.toLocaleString('en-IN')}
            </p>
            {product.originalPrice && (
                <p className="text-sm text-muted-foreground line-through">
                ₹{product.originalPrice.toLocaleString('en-IN')}
                </p>
            )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-full"
          onClick={() => toggleWishlist(product.id)}
          aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
        >
          <Heart
            className={cn(
              'h-5 w-5 transition-all',
              isWishlisted
                ? 'fill-red-500 text-red-500'
                : 'text-muted-foreground'
            )}
          />
        </Button>
      </CardFooter>
    </Card>
  );
}
