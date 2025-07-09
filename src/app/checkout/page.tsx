
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { CreditCard, Landmark, Loader2, PackageCheck, Wallet, Gem } from 'lucide-react';
import Image from 'next/image';

import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Skeleton } from '@/components/ui/skeleton';
import { Label } from '@/components/ui/label';

const addressSchema = z.object({
  name: z.string().min(2, 'Full name is required'),
  phone: z.string().min(10, 'Please enter a valid 10-digit phone number').max(10),
  address: z.string().min(5, 'Address is required'),
  city: z.string().min(2, 'City is required'),
  state: z.string().min(2, 'State is required'),
  pincode: z.string().length(6, 'Pincode must be 6 digits'),
  paymentMethod: z.enum(['cod', 'card', 'upi'], {
    required_error: 'You need to select a payment method.',
  }),
});

type CheckoutFormData = z.infer<typeof addressSchema>;

const CheckoutLoadingSkeleton = () => (
    <div className="container mx-auto px-4 py-8">
        <Skeleton className="h-10 w-64 mb-8" />
        <div className="grid lg:grid-cols-3 gap-8 items-start">
            <div className="lg:col-span-2 space-y-6">
                <Skeleton className="h-64 w-full rounded-lg" />
                <Skeleton className="h-48 w-full rounded-lg" />
            </div>
            <div className="lg:col-span-1">
                <Skeleton className="h-96 w-full rounded-lg" />
            </div>
        </div>
    </div>
);


export default function CheckoutPage() {
  const { user, isAuthenticated, isLoading: authLoading, addOrder } = useAuth();
  const { cart, getCartTotal, getCartCoins, clearCart } = useCart();
  const router = useRouter();
  const { toast } = useToast();

  const form = useForm<CheckoutFormData>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      name: user?.name || '',
      phone: '',
      address: '',
      city: '',
      state: '',
      pincode: '',
      paymentMethod: 'cod',
    },
  });

  useEffect(() => {
    if (!authLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/checkout');
      } else if (cart.length === 0) {
        toast({ title: 'Your cart is empty', description: 'Redirecting you to the homepage.'})
        router.push('/');
      }
    }
  }, [isAuthenticated, authLoading, cart, router, toast]);
  
  useEffect(() => {
    if(user?.name) {
        form.setValue('name', user.name);
    }
  }, [user, form]);

  const onSubmit = async (data: CheckoutFormData) => {
    try {
        const total = getCartTotal();
        await addOrder(cart, total, {
            name: data.name,
            address: data.address,
            city: data.city,
            state: data.state,
            pincode: data.pincode,
        });
        toast({
            title: 'Order Placed!',
            description: 'Thank you for your purchase. Your order is being processed.',
        });
        clearCart();
        router.push('/checkout/success');
    } catch (error) {
        console.error('Order submission failed', error);
        toast({
            title: 'Order Failed',
            description: 'There was a problem placing your order. Please try again.',
            variant: 'destructive',
        });
    }
  };
  
  if (authLoading || !isAuthenticated || cart.length === 0) {
    return <CheckoutLoadingSkeleton />;
  }

  const total = getCartTotal();
  const totalCoins = getCartCoins();
  const isSubmitting = form.formState.isSubmitting;

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="container mx-auto px-4 py-8">
        <h1 className="text-3xl md:text-4xl font-bold font-headline mb-8">Checkout</h1>
        <div className="grid lg:grid-cols-3 gap-8 items-start">
          <div className="lg:col-span-2 space-y-8">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Shipping Information</CardTitle>
                <CardDescription>Enter the address where you want to receive your order.</CardDescription>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField control={form.control} name="name" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Full Name</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                 <FormField control={form.control} name="phone" render={({ field }) => (
                  <FormItem><FormLabel>Phone</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormItem className="md:col-span-2"><FormLabel>Email</FormLabel><FormControl><Input value={user?.email || ''} readOnly disabled /></FormControl></FormItem>
                <FormField control={form.control} name="address" render={({ field }) => (
                  <FormItem className="md:col-span-2"><FormLabel>Address</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="city" render={({ field }) => (
                  <FormItem><FormLabel>City</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="state" render={({ field }) => (
                  <FormItem><FormLabel>State</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
                <FormField control={form.control} name="pincode" render={({ field }) => (
                  <FormItem><FormLabel>Pincode</FormLabel><FormControl><Input {...field} /></FormControl><FormMessage /></FormItem>
                )} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Payment Method</CardTitle>
                <CardDescription>Choose how you'd like to pay.</CardDescription>
              </CardHeader>
              <CardContent>
                <FormField control={form.control} name="paymentMethod" render={({ field }) => (
                  <FormItem>
                    <RadioGroup onValueChange={field.onChange} defaultValue={field.value} className="grid md:grid-cols-3 gap-4">
                      <Label htmlFor="cod" className="border rounded-md p-4 flex items-center gap-3 has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                          <RadioGroupItem value="cod" id="cod" />
                          <Wallet className="h-5 w-5" /> Cash on Delivery
                      </Label>
                       <Label htmlFor="card" className="border rounded-md p-4 flex items-center gap-3 has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                          <RadioGroupItem value="card" id="card" />
                          <CreditCard className="h-5 w-5" /> Credit/Debit Card
                      </Label>
                       <Label htmlFor="upi" className="border rounded-md p-4 flex items-center gap-3 has-[:checked]:bg-primary/10 has-[:checked]:border-primary cursor-pointer">
                          <RadioGroupItem value="upi" id="upi" />
                          <Landmark className="h-5 w-5" /> UPI / Netbanking
                      </Label>
                    </RadioGroup>
                    <FormMessage className="mt-4" />
                  </FormItem>
                )} />
              </CardContent>
            </Card>
          </div>

          <div className="lg:col-span-1 lg:sticky lg:top-24">
            <Card>
              <CardHeader>
                <CardTitle className="font-headline">Order Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3 max-h-64 overflow-y-auto pr-2">
                    {cart.map(item => (
                        <div key={item.id} className="flex items-center gap-4">
                            <Image src={item.image} alt={item.name} width={64} height={64} className="rounded-md" />
                            <div className="flex-grow">
                                <p className="font-semibold">{item.name}</p>
                                <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                            </div>
                            <p className="font-semibold">₹{(item.price * item.quantity).toLocaleString('en-IN')}</p>
                        </div>
                    ))}
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>₹{total.toLocaleString('en-IN')}</span>
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
                <Button type="submit" className="w-full" size="lg" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing Order...</>
                  ) : (
                    <><PackageCheck className="mr-2 h-5 w-5" /> Place Order</>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
        </div>
      </form>
    </Form>
  );
}
