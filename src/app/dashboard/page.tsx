
'use client';

import { useMemo, useState, useEffect } from 'react';
import { DollarSign, Package, ClipboardList, AlertCircle, TrendingUp } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend } from 'recharts';
import Image from 'next/image';

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@/components/ui/alert";
import type { Product, AuthUser } from '@/lib/types';
import { useProductStore } from '@/hooks/use-product-store';
import { Badge } from '@/components/ui/badge';

const USERS_STORAGE_KEY = 'kala-connect-users';

const DashboardStatCard = ({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ElementType;
}) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      <Icon className="h-4 w-4 text-muted-foreground" />
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">{description}</p>
    </CardContent>
  </Card>
);

const SalesChart = ({ data }: { data: any[] }) => {
  const chartConfig = {
    revenue: {
      label: 'Revenue',
      color: 'hsl(var(--primary))',
    },
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-headline">Sales Performance</CardTitle>
        <CardDescription>Your revenue over the last 6 months.</CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="min-h-[200px] w-full">
          <BarChart data={data}>
            <CartesianGrid vertical={false} />
            <XAxis
              dataKey="month"
              tickLine={false}
              tickMargin={10}
              axisLine={false}
            />
            <YAxis
              tickFormatter={(value) => `₹${value / 1000}k`}
            />
            <Tooltip
              cursor={false}
              content={<ChartTooltipContent
                formatter={(value) => `₹${(value as number).toLocaleString()}`}
                indicator="dot"
              />}
            />
            <Bar dataKey="revenue" fill="var(--color-revenue)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
};

export default function DashboardPage() {
  const sellerId = 'seller-1';
  const { products } = useProductStore();
  const sellerProducts = products.filter((p) => p.sellerId === sellerId);
  const [allUsers, setAllUsers] = useState<AuthUser[]>([]);

  useEffect(() => {
    if (typeof window !== 'undefined') {
        const usersData = window.localStorage.getItem(USERS_STORAGE_KEY);
        if (usersData) {
            try {
                const userStore = JSON.parse(usersData);
                const usersArray = Object.entries(userStore).map(([email, data]: [string, any]) => ({
                    email,
                    ...data,
                }));
                setAllUsers(usersArray);
            } catch (e) {
                console.error("Failed to parse user data from local storage", e);
            }
        }
    }
  }, []);

  const {
    totalRevenue,
    totalUnitsSold,
    salesChartData,
    pendingOrdersCount,
    topSellingProducts,
    lowStockProducts,
  } = useMemo(() => {
    let revenue = 0;
    let units = 0;
    const monthlySales: { [key: string]: { revenue: number } } = {};

    const productsWithSales = sellerProducts.map(product => {
        const totalUnitsSoldForProduct = product.sales?.reduce((acc, sale) => acc + sale.unitsSold, 0) || 0;
        
        if (product.sales) {
            product.sales.forEach(sale => {
              const saleRevenue = sale.unitsSold * product.price;
              revenue += saleRevenue;
              units += sale.unitsSold;
              
              if (!monthlySales[sale.month]) {
                monthlySales[sale.month] = { revenue: 0 };
              }
              monthlySales[sale.month].revenue += saleRevenue;
            });
        }

        return {
            ...product,
            totalUnitsSold: totalUnitsSoldForProduct
        }
    });

    const topSellingProducts = [...productsWithSales].sort((a, b) => b.totalUnitsSold - a.totalUnitsSold).slice(0, 3);
    const lowStockProducts = sellerProducts.filter(p => p.stock > 0 && p.stock < 10);
    
    let pendingOrdersCount = 0;
    if (allUsers.length > 0) {
        const customerOrders = allUsers
            .filter(u => u.role === 'user' && u.orders?.length > 0)
            .flatMap(u => u.orders);

        const pendingSellerOrders: Set<string> = new Set();
        customerOrders.forEach(order => {
            if (order.status === 'Processing') {
                const hasSellerProduct = order.items.some(item => item.sellerId === sellerId);
                if (hasSellerProduct) {
                    pendingSellerOrders.add(order.id);
                }
            }
        });
        pendingOrdersCount = pendingSellerOrders.size;
    }
    
    const chartData = Object.entries(monthlySales).map(([month, data]) => ({
      month,
      revenue: data.revenue,
    }));

    return {
      totalRevenue: revenue,
      totalUnitsSold: units,
      salesChartData: chartData.slice(-6),
      pendingOrdersCount,
      topSellingProducts,
      lowStockProducts,
    };
  }, [sellerProducts, allUsers, sellerId]);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Seller Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's a look at your shop's performance.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <DashboardStatCard
          title="Total Revenue"
          value={`₹${totalRevenue.toLocaleString('en-IN')}`}
          description="Total earnings from all sales."
          icon={DollarSign}
        />
        <DashboardStatCard
          title="Items Sold"
          value={totalUnitsSold.toLocaleString()}
          description="Total number of products sold."
          icon={Package}
        />
        <DashboardStatCard
          title="Active Listings"
          value={sellerProducts.length.toString()}
          description="Number of products in your shop."
          icon={ClipboardList}
        />
        <DashboardStatCard
          title="Pending Orders"
          value={pendingOrdersCount.toString()}
          description="Orders that need to be fulfilled."
          icon={AlertCircle}
        />
      </div>
      
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
            <SalesChart data={salesChartData} />
        </div>
        <div className="lg:col-span-3 space-y-4">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <TrendingUp className="h-5 w-5 text-primary" /> Top Selling Products
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Product</TableHead>
                                <TableHead className="text-right">Units Sold</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {topSellingProducts.map(product => (
                                <TableRow key={product.id}>
                                    <TableCell className="font-medium flex items-center gap-2">
                                        <Image src={product.image} alt={product.name} width={32} height={32} className="rounded-md" />
                                        {product.name}
                                    </TableCell>
                                    <TableCell className="text-right font-bold">{product.totalUnitsSold}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </CardContent>
            </Card>
             <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <AlertCircle className="h-5 w-5 text-destructive" /> Low Stock Alerts
                    </CardTitle>
                </CardHeader>
                <CardContent>
                   {lowStockProducts.length > 0 ? (
                        <div className="space-y-2">
                            {lowStockProducts.map(product => (
                                <Alert key={product.id} variant="destructive">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertTitle className="text-sm font-semibold">{product.name}</AlertTitle>
                                    <AlertDescription className="text-xs">
                                        Only <Badge variant="outline" className="mx-1">{product.stock}</Badge> items left in stock.
                                    </AlertDescription>
                                </Alert>
                            ))}
                        </div>
                   ) : (
                    <p className="text-sm text-muted-foreground">No products are low on stock. Great job!</p>
                   )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
