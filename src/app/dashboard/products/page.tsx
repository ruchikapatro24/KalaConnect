
'use client';

import Image from 'next/image';
import { useMemo } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useProductStore } from '@/hooks/use-product-store';
import type { Product } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Pen } from 'lucide-react';

const getStockBadgeVariant = (stock: number): 'destructive' | 'secondary' | 'default' => {
  if (stock === 0) return 'destructive';
  if (stock < 10) return 'secondary';
  return 'default';
};

export default function MyProductsPage() {
  // For this demo, we'll assume the logged-in seller is 'seller-1'
  const sellerId = 'seller-1';
  const { products } = useProductStore();
  const sellerProducts = products.filter((p) => p.sellerId === sellerId);
  
  const productsWithSales = useMemo(() => {
    return sellerProducts.map(product => ({
      ...product,
      totalUnitsSold: product.sales?.reduce((acc, sale) => acc + sale.unitsSold, 0) || 0,
    }))
  }, [sellerProducts]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">My Products</h1>
        <p className="text-muted-foreground">
          Manage your product inventory and view their performance.
        </p>
      </div>

      <Card>
        <CardContent className="mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[80px]">Image</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Stock</TableHead>
                <TableHead>Total Sold</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {productsWithSales.map((product: Product & { totalUnitsSold: number }) => (
                <TableRow key={product.id}>
                  <TableCell>
                    <Image
                      src={product.image}
                      alt={product.name}
                      width={40}
                      height={40}
                      className="rounded-md object-cover"
                    />
                  </TableCell>
                  <TableCell className="font-medium">{product.name}</TableCell>
                  <TableCell>₹{product.price.toLocaleString('en-IN')}</TableCell>
                  <TableCell>
                    <Badge variant={getStockBadgeVariant(product.stock)}>
                      {product.stock} in stock
                    </Badge>
                  </TableCell>
                  <TableCell>{product.totalUnitsSold}</TableCell>
                   <TableCell className="text-right">
                    <Button variant="ghost" size="icon">
                        <Pen className="h-4 w-4"/>
                        <span className="sr-only">Edit Product</span>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
