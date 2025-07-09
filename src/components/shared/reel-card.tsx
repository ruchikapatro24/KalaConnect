
'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Heart, MessageCircle, Send, ShoppingBag } from 'lucide-react';
import type { Reel } from '@/lib/types';
import { mockSellers } from '@/lib/mock-data';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useProductStore } from '@/hooks/use-product-store';
import { Badge } from '../ui/badge';

interface ReelCardProps {
  reel: Reel;
}

export function ReelCard({ reel }: ReelCardProps) {
  const seller = mockSellers.find((s) => s.id === reel.sellerId);
  const { products } = useProductStore();
  const taggedProducts = products.filter((p) =>
    reel.taggedProductIds.includes(p.id)
  );
  const [isLiked, setIsLiked] = useState(false);

  // Check if the URL is for a video or an image
  const isVideo = reel.videoUrl.startsWith('data:video') || reel.videoUrl.endsWith('.mp4');

  return (
    <div className="w-full max-w-sm bg-card border rounded-2xl overflow-hidden shadow-lg">
      <div className="p-4 flex items-center gap-3">
        {seller && (
          <>
            <Avatar className="h-10 w-10 border">
              <AvatarImage src={seller.logo} alt={seller.name} />
              <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-bold font-headline">{seller.name}</p>
              <p className="text-xs text-muted-foreground">Original video</p>
            </div>
          </>
        )}
        {reel.aiGenerated && (
          <Badge variant="secondary" className="ml-auto">AI Generated</Badge>
        )}
      </div>

      <div className="relative aspect-[9/16] bg-muted">
        {isVideo ? (
            <video
                src={reel.videoUrl}
                loop
                autoPlay
                muted
                playsInline
                className="w-full h-full object-cover"
            />
        ) : (
            <Image
                src={reel.videoUrl}
                alt={reel.caption}
                fill
                className="w-full h-full object-cover"
            />
        )}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="secondary"
              className="absolute bottom-4 left-4 rounded-full"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              View products
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80">
            <div className="grid gap-4">
              <div className="space-y-2">
                <h4 className="font-medium leading-none font-headline">Tagged Products</h4>
                <p className="text-sm text-muted-foreground">
                  Products featured in this reel.
                </p>
              </div>
              <div className="grid gap-2">
                {taggedProducts.map((product) => (
                  <Link href={`/product/${product.id}`} key={product.id}>
                    <div className="flex items-center gap-4 hover:bg-accent p-2 rounded-md">
                        <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md" />
                        <div className="text-sm">
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-muted-foreground">₹{product.price}</p>
                        </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>
      <div className="p-4">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" onClick={() => setIsLiked(!isLiked)}>
            <Heart className={`h-6 w-6 ${isLiked ? 'text-red-500 fill-current' : ''}`} />
          </Button>
          <Button variant="ghost" size="icon">
            <MessageCircle className="h-6 w-6" />
          </Button>
          <Button variant="ghost" size="icon">
            <Send className="h-6 w-6" />
          </Button>
        </div>
        <p className="text-sm mt-3">
          <span className="font-bold font-headline">{seller?.name}</span> {reel.caption}
        </p>
         {reel.script && (
            <div className="mt-3 text-xs text-muted-foreground bg-muted p-2 rounded-md">
                <p className="font-bold text-foreground mb-1">Promo Script:</p>
                <p className="whitespace-pre-wrap">{reel.script}</p>
            </div>
        )}
         <p className="text-xs text-muted-foreground mt-2">View all 12 comments</p>
      </div>
    </div>
  );
}
