
'use client';

import Link from 'next/link';
import { useState } from 'react';
import { useAuth } from '@/hooks/use-auth';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from '@/components/ui/badge';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { PackageSearch, Gem, Download, Truck } from 'lucide-react';
import type { Order, Product } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { ReviewDialog } from '@/components/product/review-dialog';

const getStatusClass = (status: Order['status']) => {
    switch (status) {
        case 'Processing': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
        case 'Shipped': return 'bg-blue-100 text-blue-800 border-blue-300';
        case 'Delivered': return 'bg-green-100 text-green-800 border-green-300';
        case 'Cancelled': return 'bg-red-100 text-red-800 border-red-300';
        case 'Returned': return 'bg-gray-100 text-gray-800 border-gray-300';
        default: return 'bg-gray-100';
    }
}

export default function AccountOrdersPage() {
    const { user, updateOrderStatus } = useAuth();
    const { toast } = useToast();
    const [reviewingProduct, setReviewingProduct] = useState<Product | null>(null);

    const handleCancelOrder = async (orderId: string) => {
        try {
            await updateOrderStatus(orderId, 'Cancelled');
            toast({ title: 'Order cancelled successfully.'})
        } catch (error) {
            toast({ title: 'Failed to cancel order.', variant: 'destructive'})
        }
    }

    const handleDownloadInvoice = (order: Order) => {
        const doc = new jsPDF();

        // Add header
        doc.setFontSize(20);
        doc.text('Invoice', 14, 22);
        doc.setFontSize(12);
        doc.text(`Order #${order.id.split('-')[1]}`, 14, 30);
        doc.text(`Date: ${new Date(order.date).toLocaleDateString()}`, 14, 36);

        // Add company and customer details
        doc.setFontSize(12);
        doc.text('Billed From:', 14, 50);
        doc.setFontSize(10);
        doc.text('KalaConnect', 14, 56);
        doc.text('123 Artisan Way, Craftsville', 14, 61);
        doc.text('India', 14, 66);

        doc.setFontSize(12);
        doc.text('Billed To:', 140, 50);
        doc.setFontSize(10);
        doc.text(order.shippingAddress.name, 140, 56);
        doc.text(order.shippingAddress.address, 140, 61);
        doc.text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.pincode}`, 140, 66);

        // Add table of items
        const tableColumn = ["Item", "Quantity", "Price", "Total"];
        const tableRows: (string|number)[][] = [];

        order.items.forEach(item => {
            const itemData = [
                item.name,
                item.quantity,
                `₹${item.price.toLocaleString('en-IN')}`,
                `₹${(item.price * item.quantity).toLocaleString('en-IN')}`
            ];
            tableRows.push(itemData);
        });

        autoTable(doc, {
            head: [tableColumn],
            body: tableRows,
            startY: 80,
        });
        
        // Add total
        const finalY = (doc as any).lastAutoTable.finalY; // Get Y position of last table row
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.text('Total:', 140, finalY + 10);
        doc.text(`₹${order.total.toLocaleString('en-IN')}`, 170, finalY + 10);
        
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text('Thank you for your purchase!', 14, finalY + 30);


        doc.save(`invoice-${order.id}.pdf`);
    }
  
    if (!user || !user.orders || user.orders.length === 0) {
        return (
             <div className="flex flex-col items-center justify-center text-center py-20 border-2 border-dashed rounded-lg bg-card h-full">
                <div className="p-6 bg-primary/10 rounded-full">
                    <PackageSearch className="h-12 w-12 text-primary" />
                </div>
                <h2 className="mt-6 text-2xl font-bold font-headline">No Orders Yet</h2>
                <p className="mt-2 text-muted-foreground">
                    You haven't placed any orders. Let's find something special!
                </p>
            </div>
        )
    }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Orders</h1>
        <p className="text-muted-foreground">
          View your order history and track your purchases.
        </p>
      </div>

        <Accordion type="single" collapsible className="w-full space-y-4">
        {user.orders.map(order => (
            <AccordionItem value={order.id} key={order.id} className="border rounded-lg bg-card">
                <AccordionTrigger className="p-4 hover:no-underline">
                     <div className="flex flex-col md:flex-row md:items-center justify-between w-full text-left gap-2">
                        <div className="space-y-1">
                            <p className="font-bold text-lg">Order #{order.id.split('-')[1]}</p>
                            <p className="text-sm text-muted-foreground">Date: {new Date(order.date).toLocaleDateString()}</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <p className="text-lg font-bold">₹{order.total.toLocaleString('en-IN')}</p>
                            <Badge className={cn('text-xs', getStatusClass(order.status))}>{order.status}</Badge>
                        </div>
                     </div>
                </AccordionTrigger>
                <AccordionContent className="p-4 pt-0">
                    <div className="space-y-4">
                         <div>
                            <h4 className="font-semibold mb-2">Shipping Address</h4>
                            <div className="text-sm text-muted-foreground">
                                <p>{order.shippingAddress.name}</p>
                                <p>{order.shippingAddress.address}</p>
                                <p>{order.shippingAddress.city}, {order.shippingAddress.state} {order.shippingAddress.pincode}</p>
                            </div>
                         </div>
                         <div>
                            <h4 className="font-semibold mb-2">Items</h4>
                            <div className="space-y-2">
                                {order.items.map(item => (
                                    <div key={item.id} className="flex items-center gap-4">
                                        <Image src={item.image} alt={item.name} width={60} height={60} className="rounded-md border" />
                                        <div className="flex-grow">
                                            <p className="font-medium">{item.name}</p>
                                            <p className="text-sm text-muted-foreground">Qty: {item.quantity} - ₹{item.price.toLocaleString('en-IN')}</p>
                                        </div>
                                         {order.status === 'Delivered' && (
                                            <Button variant="outline" size="sm" className="ml-auto" onClick={() => setReviewingProduct(item)}>
                                                Leave Feedback
                                            </Button>
                                        )}
                                    </div>
                                ))}
                            </div>
                         </div>
                         <div className="flex items-center justify-between bg-green-50 dark:bg-green-950 p-3 rounded-md">
                            <p className="font-semibold text-green-700 dark:text-green-300 flex items-center gap-2"><Gem className="h-5 w-5"/> Coins Earned</p>
                            <p className="font-bold text-lg text-green-600 dark:text-green-400">+{order.sustainabilityCoinsEarned}</p>
                         </div>
                         <div className="flex gap-2 flex-wrap">
                            {['Processing', 'Shipped', 'Delivered'].includes(order.status) && (
                                <Button asChild variant="outline" size="sm">
                                    <Link href={`/account/orders/${order.id}/track`}>
                                        <Truck className="mr-2 h-4 w-4" />
                                        Track Order
                                    </Link>
                                </Button>
                            )}
                            {order.status === 'Processing' && (
                                <Button variant="outline" size="sm" onClick={() => handleCancelOrder(order.id)}>Cancel Order</Button>
                            )}
                            {order.status === 'Delivered' && (
                                <Button variant="outline" size="sm">Return Item</Button>
                            )}
                            {['Processing', 'Shipped', 'Delivered'].includes(order.status) && (
                                <Button variant="outline" size="sm" onClick={() => handleDownloadInvoice(order)}>
                                    <Download className="mr-2 h-4 w-4" />
                                    Download Invoice
                                </Button>
                            )}
                         </div>
                    </div>
                </AccordionContent>
            </AccordionItem>
        ))}
      </Accordion>

      {reviewingProduct && (
        <ReviewDialog
          productId={reviewingProduct.id}
          productName={reviewingProduct.name}
          open={!!reviewingProduct}
          onOpenChange={(open) => {
            if (!open) setReviewingProduct(null);
          }}
        />
      )}
    </div>
  );
}
