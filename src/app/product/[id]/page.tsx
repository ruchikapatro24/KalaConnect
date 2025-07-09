'use client';

import Image from 'next/image';
import Link from 'next/link';
import { notFound, useParams } from 'next/navigation';
import { Heart, ShoppingCart, Sparkles, Star, Gem } from 'lucide-react';
import { useState, useMemo } from 'react';
import { mockSellers } from '@/lib/mock-data';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useWishlist } from '@/hooks/use-wishlist';
import { cn } from '@/lib/utils';
import { ProductCard } from '@/components/shared/product-card';
import { useProductStore } from '@/hooks/use-product-store';
import { VirtualTryOn } from '@/components/shared/virtual-try-on';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { useAuth } from '@/hooks/use-auth';
import { ReviewDialog } from '@/components/product/review-dialog';

const renderStars = (rating: number) => {
  const stars = [];
  const roundedRating = Math.round(rating);
  for (let i = 1; i <= 5; i++) {
    stars.push(
      <Star
        key={i}
        className={cn(
          'w-5 h-5',
          i <= roundedRating ? 'fill-primary text-primary' : 'fill-muted stroke-muted-foreground'
        )}
      />
    );
  }
  return stars;
};

export default function ProductPage() {
  const params = useParams<{ id: string }>();
  const { products } = useProductStore();
  const product = products.find((p) => p.id === params.id);
  const { wishlist, toggleWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { toast } = useToast();
  const { user, isAuthenticated } = useAuth();
  const [isTryingOn, setIsTryingOn] = useState(false);
  const [isReviewDialogOpen, setIsReviewDialogOpen] = useState(false);

  const userHasPurchased = useMemo(() => {
    if (!isAuthenticated || !user?.orders || !product) return false;
    // Check if any 'Delivered' order contains this product
    return user.orders.some(order => 
      order.status === 'Delivered' && order.items.some(item => item.id === product.id)
    );
  }, [user, isAuthenticated, product]);

  if (!product) {
    notFound();
  }

  const handleAddToCart = () => {
    addToCart(product);
    toast({
      title: 'Added to cart!',
      description: `${product.name} is now in your shopping cart.`,
    });
  };

  const handleWriteReviewClick = () => {
    if (userHasPurchased) {
      setIsReviewDialogOpen(true);
    } else {
      toast({
        title: "Can't write a review",
        description: "You must purchase and receive this item to leave a review.",
        variant: "destructive",
      });
    }
  };

  const seller = mockSellers.find((s) => s.id === product.sellerId);
  const isWishlisted = wishlist.has(product.id);
  const relatedProducts = products.filter(p => p.id !== product.id && p.tags?.some(t => product.tags?.includes(t))).slice(0, 5);

  const totalReviews = product.reviews?.length || 0;
  const averageRating = totalReviews > 0
    ? product.reviews!.reduce((acc, review) => acc + review.rating, 0) / totalReviews
    : 0;

  return (
    <>
      <div className="container mx-auto max-w-6xl px-4 py-8 md:px-6 lg:py-12">
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
          <div className="grid gap-4">
            <Image
              src={product.image}
              alt={product.name}
              width={600}
              height={600}
              className="aspect-square w-full rounded-lg border object-cover"
              data-ai-hint={product.dataAiHint}
            />
          </div>
          <div className="grid gap-6">
            <div>
              <h1 className="text-3xl lg:text-4xl font-bold font-headline">{product.name}</h1>
              <div className="flex items-center gap-4 mt-2">
                {totalReviews > 0 && (
                   <div className="flex items-center gap-2">
                    <div className="flex items-center gap-0.5">
                      {renderStars(averageRating)}
                    </div>
                    <a href="#reviews" className="text-sm text-muted-foreground hover:underline">({totalReviews} reviews)</a>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-baseline gap-4">
                <p className="text-3xl font-bold">₹{product.price.toLocaleString('en-IN')}</p>
                {product.sustainabilityCoins && (
                    <Badge variant="outline" className="border-green-500 text-green-600">
                        <Gem className="mr-2 h-4 w-4" /> +{product.sustainabilityCoins} Coins
                    </Badge>
                )}
            </div>
            <Separator />
            <div className="grid gap-4 text-sm leading-loose">
              <h2 className="text-lg font-bold font-headline">Description</h2>
              <p className="text-muted-foreground">{product.description}</p>
            </div>
            {product.culturalContext && (
              <div className="grid gap-4 text-sm leading-loose">
                <h2 className="text-lg font-bold font-headline">Cultural Context</h2>
                <p className="text-muted-foreground">{product.culturalContext}</p>
              </div>
            )}
            <div className="flex items-center gap-4">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                <ShoppingCart className="mr-2 h-5 w-5" />
                Add to Cart
              </Button>
              {product.color && product.tags?.includes('lipstick') && (
                  <Button size="lg" variant="outline" className="flex-1" onClick={() => setIsTryingOn(true)}>
                      <Sparkles className="mr-2 h-5 w-5" />
                      Virtual Try-On
                  </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="p-3"
                onClick={() => toggleWishlist(product.id)}
                aria-label={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
              >
                <Heart
                  className={cn(
                    'h-6 w-6',
                    isWishlisted ? 'fill-red-500 text-red-500' : 'text-muted-foreground'
                  )}
                />
              </Button>
            </div>
            <Separator />
            {seller && (
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16 border">
                  <AvatarImage src={seller.logo} alt={seller.name} />
                  <AvatarFallback>{seller.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-sm text-muted-foreground">Sold by</p>
                  <p className="font-bold font-headline text-lg">{seller.name}</p>
                </div>
              </div>
            )}
          </div>
        </div>
        
        <div id="reviews" className="mt-16">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-2xl font-bold font-headline">Customer Reviews</h2>
              {isAuthenticated ? (
                <Button variant="outline" onClick={handleWriteReviewClick}>
                  Write a review
                </Button>
              ) : (
                <Button variant="outline" asChild>
                  <Link href={`/login?redirect=/product/${product.id}`}>Write a review</Link>
                </Button>
              )}
            </div>
            {totalReviews > 0 && product.reviews ? (
                <Card>
                    <CardHeader>
                        <div className="flex items-center gap-4">
                            <p className="text-4xl font-bold">{averageRating.toFixed(1)}</p>
                            <div>
                                <div className="flex">{renderStars(averageRating)}</div>
                                <p className="text-sm text-muted-foreground">Based on {totalReviews} reviews</p>
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent className="space-y-6 divide-y">
                        {product.reviews.map(review => (
                        <div key={review.id} className="grid gap-2 pt-6 first:pt-0">
                            <div className="flex items-center gap-2">
                            <div className="flex">{renderStars(review.rating)}</div>
                            <p className="font-semibold">{review.author}</p>
                            <p className="text-sm text-muted-foreground ml-auto">{new Date(review.date).toLocaleDateString()}</p>
                            </div>
                            <p className="text-muted-foreground">{review.comment}</p>
                        </div>
                        ))}
                    </CardContent>
                </Card>
            ) : (
                <div className="text-center py-16 text-muted-foreground border-2 border-dashed rounded-lg">
                    <p>No reviews yet for this product.</p>
                    <p className="text-sm">Be the first to share your thoughts!</p>
                </div>
            )}
        </div>
        
        {relatedProducts.length > 0 && (
            <div className="mt-16">
            <h2 className="text-2xl font-bold font-headline mb-6">You Might Also Like</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6">
                {relatedProducts.map(p => <ProductCard key={p.id} product={p} />)}
            </div>
            </div>
        )}
      </div>
      {isTryingOn && product && <VirtualTryOn product={product} onClose={() => setIsTryingOn(false)} />}
      <ReviewDialog 
        productId={product.id}
        productName={product.name}
        open={isReviewDialogOpen}
        onOpenChange={setIsReviewDialogOpen}
      />
    </>
  );
}
