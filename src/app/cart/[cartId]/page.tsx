'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Plus, Minus, Gem, Share2, Copy } from 'lucide-react';
import QRCode from 'qrcode.react';
import { useRouter, useParams } from 'next/navigation';

import { useSharedCart } from '@/hooks/use-shared-cart';
import { useCart } from '@/hooks/use-cart';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { useToast } from '@/hooks/use-toast';
import { Skeleton } from '@/components/ui/skeleton';

export default function SharedCartPage() {
  const params = useParams<{ cartId: string }>();
  const { cartId } = params;
  const { cart, loading, updateItemQuantity, removeFromCart, getCartSubtotal, getCartCoins, getCartTotal } = useSharedCart(cartId);
  const { setCart: setLocalCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    updateItemQuantity(productId, newQuantity);
  };
  
  const shareUrl = typeof window !== 'undefined' ? window.location.href : '';

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied to clipboard!' });
  };
  
  const handleCheckout = () => {
    if (cart && cart.length > 0) {
      setLocalCart(cart);
      router.push('/checkout');
    } else {
      toast({
        title: "Cannot checkout",
        description: "The shared cart is empty.",
        variant: "destructive",
      });
    }
  };

  if (loading) {
    return (
        <div className="container mx-auto px-4 py-8">
            <div className="flex items-center gap-4 mb-8">
                <Skeleton className="h-8 w-8" />
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid lg:grid-cols-3 gap-8 items-start">
                <div className="lg:col-span-2 space-y-4">
                    <Skeleton className="h-28 w-full" />
                    <Skeleton className="h-28 w-full" />
                </div>
                <div className="lg:col-span-1">
                    <Skeleton className="h-80 w-full" />
                </div>
            </div>
        </div>
    );
  }

  if (!cart) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg bg-card">
          <div className="p-6 bg-primary/10 rounded-full">
            <ShoppingCart className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-bold font-headline">Cart Not Found</h2>
          <p className="mt-2 text-muted-foreground">
            This shared cart might have expired or the link is incorrect.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">
              Go to Homepage
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const subtotal = getCartSubtotal();
  const totalCoins = getCartCoins();
  const total = getCartTotal();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <Share2 className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Shared Shopping Cart</h1>
        </div>
        <Card className="p-4 flex flex-col md:flex-row items-center gap-4">
            <div className="p-2 bg-white rounded-md">
                <QRCode value={shareUrl} size={64} />
            </div>
            <div className="flex-grow">
                <p className="font-semibold text-sm">Share this cart with others!</p>
                <p className="text-xs text-muted-foreground break-all">{shareUrl}</p>
            </div>
            <Button onClick={copyLink} size="sm"><Copy className="mr-2" /> Copy Link</Button>
        </Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cart.length === 0 ? (
             <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg bg-card">
                <div className="p-6 bg-primary/10 rounded-full">
                    <ShoppingCart className="h-12 w-12 text-primary" />
                </div>
                <h2 className="mt-6 text-2xl font-bold font-headline">This Shared Cart is Empty</h2>
                <p className="mt-2 text-muted-foreground">
                    Add some items to get started!
                </p>
             </div>
          ) : cart.map((item) => (
            <Card key={item.id} className="flex flex-col md:flex-row items-center p-4 gap-4">
              <Image
                src={item.image}
                alt={item.name}
                width={100}
                height={100}
                className="rounded-md object-cover"
              />
              <div className="flex-grow">
                <Link href={`/product/${item.id}`} className="hover:underline">
                  <h3 className="font-semibold font-headline text-lg">{item.name}</h3>
                </Link>
                <p className="text-lg font-bold mt-1">
                  ₹{item.price.toLocaleString('en-IN')}
                </p>
                 {item.sustainabilityCoins && (
                    <p className="text-sm text-green-600 flex items-center gap-1">
                      <Gem className="h-3 w-3" /> +{item.sustainabilityCoins * item.quantity} Coins
                    </p>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity - 1)}>
                    <Minus className="h-4 w-4" />
                </Button>
                <p className="w-8 text-center font-bold">{item.quantity}</p>
                <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handleQuantityChange(item.id, item.quantity + 1)}>
                    <Plus className="h-4 w-4" />
                </Button>
              </div>
               <p className="text-xl font-bold w-24 text-right">
                  ₹{(item.price * item.quantity).toLocaleString('en-IN')}
                </p>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => handleRemove(item.id)}
              >
                <Trash2 className="h-5 w-5 text-muted-foreground hover:text-destructive" />
                <span className="sr-only">Remove item</span>
              </Button>
            </Card>
          ))}
        </div>
        <div className="lg:col-span-1 lg:sticky lg:top-24">
          <Card>
            <CardHeader>
              <CardTitle className="font-headline">Order Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>₹{subtotal.toLocaleString('en-IN')}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-semibold text-primary">Free</span>
              </div>
              <div className="flex justify-between text-green-600">
                <span className="flex items-center gap-1"><Gem className="h-4 w-4" /> Coins Earned</span>
                <span>+{totalCoins.toLocaleString('en-IN')}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-bold text-lg">
                <span>Total</span>
                <span>₹{total.toLocaleString('en-IN')}</span>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleCheckout} className="w-full" size="lg" disabled={cart.length === 0}>
                Proceed to Checkout
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
}
