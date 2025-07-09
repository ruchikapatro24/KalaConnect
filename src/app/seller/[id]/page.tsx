
'use client';

import Image from 'next/image';
import { notFound, useParams } from 'next/navigation';
import { mockSellers } from '@/lib/mock-data';
import { useProductStore } from '@/hooks/use-product-store';
import { ProductCard } from '@/components/shared/product-card';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { MessageSquare } from 'lucide-react';

export default function SellerPage() {
  const params = useParams<{ id: string }>();
  const seller = mockSellers.find((s) => s.id === params.id);
  const { products } = useProductStore();

  if (!seller) {
    notFound();
  }

  const sellerProducts = products.filter((p) => p.sellerId === seller.id);

  return (
    <div>
      <section className="relative h-64 md:h-80 w-full">
        <Image
          src={seller.coverImage}
          alt={`${seller.name} background`}
          fill
          className="object-cover brightness-50"
          data-ai-hint={seller.coverDataAiHint}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="container mx-auto px-4 md:px-6 absolute bottom-0 left-0 right-0">
          <div className="flex flex-col md:flex-row items-center gap-6 py-6">
            <Avatar className="h-32 w-32 border-4 border-background bg-muted">
              <AvatarImage src={seller.logo} alt={seller.name} data-ai-hint={seller.logoDataAiHint} />
              <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center md:text-left">
              <h1 className="font-headline text-4xl md:text-5xl font-bold">{seller.name}</h1>
              <p className="text-xl text-muted-foreground mt-1">
                Featuring Artisan: <span className="font-semibold text-primary">{seller.craftswomanName}</span>
              </p>
              <Button className="mt-4">
                <MessageSquare className="mr-2 h-5 w-5" />
                Contact the Artisan
              </Button>
            </div>
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 md:px-6 py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2">
            <div className="prose prose-lg max-w-none dark:prose-invert prose-headings:font-headline prose-p:text-muted-foreground">
              <h2 className="text-3xl font-bold font-headline">The Story of {seller.name}</h2>
              <blockquote>{seller.background}</blockquote>
              <p>{seller.story}</p>
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="space-y-6 sticky top-24">
               <h3 className="text-2xl font-bold font-headline">From the Artisan</h3>
               <div className="grid grid-cols-2 md:grid-cols-1 gap-4">
                {sellerProducts.slice(0, 2).map((product) => (
                    <ProductCard key={product.id} product={product} />
                ))}
               </div>
            </div>
          </div>
        </div>
        
        <Separator className="my-12" />

        <div>
          <h2 className="text-3xl font-bold font-headline mb-8 text-center">Explore All Products from {seller.name}</h2>
          {sellerProducts.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
              {sellerProducts.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
              <p>No products found for this artisan yet.</p>
            </div>
          )}
        </div>

      </div>
    </div>
  );
}
