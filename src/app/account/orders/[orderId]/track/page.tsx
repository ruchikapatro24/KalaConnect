
'use client';

import React from 'react';
import { useParams, notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, Truck, Home, XCircle, Undo2, ArrowLeft } from 'lucide-react';
import type { Order } from '@/lib/types';
import { cn } from '@/lib/utils';


const statusSteps = [
    { status: 'Processing', label: 'Order Confirmed', icon: <CheckCircle/> },
    { status: 'Shipped', label: 'Shipped', icon: <Truck/> },
    { status: 'Delivered', label: 'Delivered', icon: <Home/> },
];

const cancelledStep = { status: 'Cancelled', label: 'Order Cancelled', icon: <XCircle/> };
const returnedStep = { status: 'Returned', label: 'Order Returned', icon: <Undo2/> };

const getStepStatus = (orderStatus: Order['status'], stepStatus: Order['status']) => {
    const statusOrder = ['Processing', 'Shipped', 'Delivered'];
    const currentStatusIndex = statusOrder.indexOf(orderStatus);
    const stepStatusIndex = statusOrder.indexOf(stepStatus);
    
    if (orderStatus === 'Cancelled' || orderStatus === 'Returned') {
        return 'inactive';
    }

    if (stepStatusIndex <= currentStatusIndex) {
        return 'completed';
    }
    
    return 'inactive';
}

export default function TrackOrderPage() {
    const params = useParams<{ orderId: string }>();
    const { user } = useAuth();

    const order = user?.orders?.find(o => o.id === params.orderId);

    if (!order) {
        return notFound();
    }

    const isFinalState = order.status === 'Cancelled' || order.status === 'Returned';
    let finalStateStep = null;
    if (order.status === 'Cancelled') finalStateStep = cancelledStep;
    if (order.status === 'Returned') finalStateStep = returnedStep;

    return (
        <div className="space-y-8">
            <div className="flex items-center gap-4">
                <Button asChild variant="outline" size="icon">
                    <Link href="/account/orders">
                        <ArrowLeft className="h-4 w-4" />
                        <span className="sr-only">Back to orders</span>
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold font-headline">Track Order</h1>
                    <p className="text-muted-foreground">Order #{order.id.split('-')[1]}</p>
                </div>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Order Journey</CardTitle>
                </CardHeader>
                <CardContent>
                    {isFinalState && finalStateStep ? (
                         <div className="flex items-center gap-4 p-4 rounded-lg bg-red-50 dark:bg-red-950/50 border border-destructive/30">
                            <div className="text-destructive">{finalStateStep.icon}</div>
                            <div>
                                <p className="font-bold text-lg">{finalStateStep.label}</p>
                                <p className="text-sm text-muted-foreground">
                                    This order is no longer in transit.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <div className="flex items-center justify-between relative">
                             <div className="absolute left-0 top-5 -translate-y-1/2 h-1 w-full bg-muted">
                                <div
                                    className="absolute left-0 top-0 h-full bg-primary transition-all duration-500"
                                    style={{
                                        width: `${(statusSteps.findIndex(s => s.status === order.status) / (statusSteps.length - 1)) * 100}%`
                                    }}
                                />
                             </div>
                            {statusSteps.map((step) => {
                                const status = getStepStatus(order.status, step.status);
                                return (
                                <div key={step.status} className="z-10 flex flex-col items-center gap-2">
                                    <div className={cn(
                                        "h-10 w-10 rounded-full flex items-center justify-center transition-colors duration-300 bg-background border-2",
                                        status === 'completed' ? 'border-primary text-primary' : 'border-muted-foreground text-muted-foreground'
                                    )}>
                                       {React.cloneElement(step.icon, { className: 'h-6 w-6' })}
                                    </div>
                                    <p className={cn(
                                        "text-sm font-semibold mt-1",
                                        status === 'completed' ? 'text-primary' : 'text-muted-foreground'
                                    )}>{step.label}</p>
                                </div>
                                );
                            })}
                        </div>
                    )}
                </CardContent>
            </Card>

            <div className="grid md:grid-cols-2 gap-8">
                <Card>
                    <CardHeader>
                        <CardTitle>Shipping Address</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">{order.shippingAddress.name}</p>
                            <p>{order.shippingAddress.address}</p>
                            <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle>Order Summary</CardTitle>
                    </CardHeader>
                    <CardContent>
                         <div className="space-y-3 max-h-48 overflow-y-auto pr-2">
                            {order.items.map(item => (
                                <div key={item.id} className="flex items-center gap-4 text-sm">
                                    <Image src={item.image} alt={item.name} width={40} height={40} className="rounded-md border" />
                                    <span className="text-muted-foreground flex-grow">{item.name} x {item.quantity}</span>
                                    <span className="font-medium">₹{(item.price * item.quantity).toLocaleString('en-IN')}</span>
                                </div>
                            ))}
                         </div>
                         <Separator className="my-3"/>
                         <div className="flex items-center justify-between font-bold">
                            <span>Total</span>
                            <span>₹{order.total.toLocaleString('en-IN')}</span>
                         </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
