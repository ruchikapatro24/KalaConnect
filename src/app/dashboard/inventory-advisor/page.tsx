
'use client';

import { useState } from 'react';
import { Lightbulb, Loader2, Package, Sparkles, TrendingDown, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { generateInventoryAdvice } from '@/ai/flows/generate-inventory-advice';
import type { GenerateInventoryAdviceOutput } from '@/ai/flows/generate-inventory-advice';
import { useProductStore } from '@/hooks/use-product-store';
import { Separator } from '@/components/ui/separator';

const AdviceCard = ({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: string[] }) => (
    <Card>
        <CardHeader className="flex flex-row items-center gap-3">
            <Icon className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {items.length > 0 ? (
                 <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    {items.map((item, index) => <li key={index}>{item}</li>)}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No suggestions at this time.</p>
            )}
        </CardContent>
    </Card>
);

export default function InventoryAdvisorPage() {
    const [advice, setAdvice] = useState<GenerateInventoryAdviceOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { products } = useProductStore();
    const sellerId = 'seller-1'; // Demo seller
    const sellerProducts = products.filter(p => p.sellerId === sellerId);

    const handleGenerateAdvice = async () => {
        setIsLoading(true);
        setAdvice(null);
        try {
            const result = await generateInventoryAdvice(sellerProducts);
            setAdvice(result);
            toast({
                title: 'Analysis Complete!',
                description: 'Your inventory advice is ready.',
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Analysis Failed',
                description: 'Could not generate advice. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold font-headline">AI Inventory Advisor</h1>
                    <p className="text-muted-foreground">
                        Get smart recommendations to optimize your stock and sales.
                    </p>
                </div>
                <Button onClick={handleGenerateAdvice} disabled={isLoading} size="lg">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze My Inventory
                </Button>
            </div>
            
            <Separator />

            {isLoading && (
                <div className="flex items-center justify-center text-center py-20">
                    <div className="space-y-4">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold">Analyzing your data...</h3>
                        <p className="text-muted-foreground">Our AI is looking at your sales and stock levels.</p>
                    </div>
                </div>
            )}
            
            {advice ? (
                 <div className="grid md:grid-cols-3 gap-6">
                    <AdviceCard title="Urgent Restocks" icon={TrendingUp} items={advice.restockSuggestions} />
                    <AdviceCard title="Slow Movers" icon={TrendingDown} items={advice.slowMovers} />
                    <AdviceCard title="New Ideas" icon={Lightbulb} items={advice.newProductIdeas} />
                 </div>
            ) : (
                !isLoading && (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                             <Package className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Ready for Insights?</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            Click the "Analyze My Inventory" button to get personalized recommendations from our AI on what to stock, what to discount, and what to create next.
                        </p>
                    </div>
                )
            )}
        </div>
    );
}

