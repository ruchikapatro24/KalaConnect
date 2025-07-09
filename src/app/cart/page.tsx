
'use client';

import Link from 'next/link';
import Image from 'next/image';
import { ShoppingCart, Trash2, Frown, Plus, Minus, Gem, Share2, Loader2 } from 'lucide-react';
import { useState } from 'react';

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
import { ShareCartDialog } from '@/components/cart/share-cart-dialog';


export default function CartPage() {
  const { cart, removeFromCart, updateItemQuantity, getCartTotal, getCartSubtotal, getCartCoins, createSharedCart } = useCart();
  const { toast } = useToast();
  const [isCreatingLink, setIsCreatingLink] = useState(false);
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [sharedCartId, setSharedCartId] = useState<string | null>(null);

  const handleShareCart = async () => {
    if (cart.length === 0) {
      toast({
        title: 'Cannot share',
        description: 'Your cart is empty.',
        variant: 'destructive',
      });
      return;
    }
    
    // Reset previous id and open dialog in loading state
    setSharedCartId(null);
    setIsShareDialogOpen(true);
    setIsCreatingLink(true);

    try {
      const newCartId = await createSharedCart();
      setSharedCartId(newCartId);
    } catch (error: any) {
      toast({
        title: 'Sharing Failed',
        description: error.message || 'Could not create a share link.',
        variant: 'destructive',
      });
      // Close dialog on error
      setIsShareDialogOpen(false);
    } finally {
      setIsCreatingLink(false);
    }
  };

  const handleRemove = (productId: string, productName: string) => {
    removeFromCart(productId);
    toast({
      title: 'Item removed',
      description: `${productName} has been removed from your cart.`,
    });
  };

  const handleQuantityChange = (productId: string, newQuantity: number) => {
    if (newQuantity > 0) {
      updateItemQuantity(productId, newQuantity);
    } else {
      handleRemove(productId, cart.find(item => item.id === productId)?.name || '');
    }
  };

  const subtotal = getCartSubtotal();
  const totalCoins = getCartCoins();
  const total = getCartTotal();

  if (cart.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg bg-card">
          <div className="p-6 bg-primary/10 rounded-full">
            <ShoppingCart className="h-12 w-12 text-primary" />
          </div>
          <h2 className="mt-6 text-2xl font-bold font-headline">Your Cart is Empty</h2>
          <p className="mt-2 text-muted-foreground">
            Looks like you haven't added anything to your cart yet.
          </p>
          <Button asChild className="mt-6">
            <Link href="/">
              Start Shopping
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
        <div className="flex items-center gap-4">
            <ShoppingCart className="h-8 w-8 text-primary" />
            <h1 className="text-3xl md:text-4xl font-bold font-headline">My Cart</h1>
        </div>
        <Button variant="outline" className="w-full md:w-auto" onClick={handleShareCart} disabled={isCreatingLink}>
            <Share2 className="mr-2 h-4 w-4" />
            Share Cart
        </Button>
      </div>
      <div className="grid lg:grid-cols-3 gap-8 items-start">
        <div className="lg:col-span-2 space-y-4">
          {cart.map((item) => (
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
                onClick={() => handleRemove(item.id, item.name)}
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
              <Button asChild className="w-full" size="lg">
                <Link href="/checkout">Proceed to Checkout</Link>
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
        <ShareCartDialog
            cartId={sharedCartId}
            isLoading={isCreatingLink}
            open={isShareDialogOpen}
            onOpenChange={setIsShareDialogOpen}
        />
    </div>
  );
}
