'use client';

import { useState } from 'react';
import { CalendarHeart, Loader2, Sparkles, Lightbulb, Package, ShoppingCart, Megaphone, BarChart2 } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import {
  ChartContainer,
  ChartTooltipContent,
} from '@/components/ui/chart';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useProductStore } from '@/hooks/use-product-store';
import { generateFestivalForecast } from '@/ai/flows/generate-festival-forecast';
import type { GenerateFestivalForecastOutput } from '@/ai/flows/generate-festival-forecast';
import { Separator } from '@/components/ui/separator';

const festivals = [
    'Diwali', 'Holi', 'Navratri', 'Dussehra', 'Raksha Bandhan', 'Ganesh Chaturthi', 'Christmas', 'Eid-ul-Fitr'
];

type NewProductIdea = GenerateFestivalForecastOutput['newProductIdeas'][0];

const ResultCard = ({ title, icon: Icon, items }: { title: string; icon: React.ElementType; items: string[] }) => (
    <Card>
        <CardHeader className="flex flex-row items-center gap-3 space-y-0">
            <Icon className="h-6 w-6 text-primary" />
            <CardTitle className="font-headline">{title}</CardTitle>
        </CardHeader>
        <CardContent>
            {items.length > 0 ? (
                 <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                    {items.map((item, index) => <li key={index} dangerouslySetInnerHTML={{ __html: item.replace(/\*(.*?)\*/g, '<strong>$1</strong>') }} />)}
                </ul>
            ) : (
                <p className="text-sm text-muted-foreground">No suggestions found.</p>
            )}
        </CardContent>
    </Card>
);

const NewProductIdeaCard = ({ idea }: { idea: NewProductIdea }) => (
    <Card className="bg-card flex flex-col">
        <CardHeader>
            <CardTitle className="text-lg font-headline">{idea.name}</CardTitle>
            <CardDescription>{idea.description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4 text-sm flex-grow">
            <div>
                <h4 className="font-semibold text-foreground mb-1">Cost & Time Analysis</h4>
                <div className="text-muted-foreground space-y-1">
                    <p><strong>Est. Cost to Make:</strong> {idea.estimatedCostToMake}</p>
                    <p><strong>Est. Production Time:</strong> {idea.productionTime}</p>
                </div>
            </div>
            <div>
                 <h4 className="font-semibold text-foreground mb-1">Required Materials</h4>
                 <ul className="list-disc pl-5 text-muted-foreground">
                    {idea.requiredMaterials.map((material, index) => <li key={index}>{material}</li>)}
                 </ul>
            </div>
        </CardContent>
    </Card>
);


export default function FestivalForecastPage() {
    const [selectedFestival, setSelectedFestival] = useState('');
    const [forecast, setForecast] = useState<GenerateFestivalForecastOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { products } = useProductStore();
    const sellerId = 'seller-1'; // Demo seller
    const sellerProducts = products.filter(p => p.sellerId === sellerId);
    
    const chartConfig = {
        salesBoost: {
            label: "Sales Boost",
            color: "hsl(var(--primary))",
        },
    };

    const handleGenerateForecast = async () => {
        if (!selectedFestival) {
            toast({
                title: 'Please select a festival',
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        setForecast(null);
        try {
            const result = await generateFestivalForecast(selectedFestival, sellerProducts);
            setForecast(result);
            toast({
                title: `Forecast for ${selectedFestival} is ready!`,
            });
        } catch (error) {
            console.error(error);
            toast({
                title: 'Forecast Failed',
                description: 'Could not generate forecast. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">AI Festival Forecast</h1>
                <p className="text-muted-foreground">
                    Prepare for upcoming festivals with AI-powered sales and marketing advice.
                </p>
            </div>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Select a Festival</CardTitle>
                    <CardDescription>Choose an upcoming festival to get tailored recommendations for your products.</CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col md:flex-row items-center gap-4">
                     <Select value={selectedFestival} onValueChange={setSelectedFestival}>
                        <SelectTrigger className="md:w-[280px]">
                            <SelectValue placeholder="Choose a festival..." />
                        </SelectTrigger>
                        <SelectContent>
                            {festivals.map(festival => (
                                <SelectItem key={festival} value={festival}>{festival}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Button onClick={handleGenerateForecast} disabled={isLoading || !selectedFestival}>
                        {isLoading ? (
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        ) : (
                            <Sparkles className="mr-2 h-4 w-4" />
                        )}
                        Generate Forecast
                    </Button>
                </CardContent>
            </Card>

            {isLoading && (
                 <div className="flex items-center justify-center text-center py-20">
                    <div className="space-y-4">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold">Generating your forecast...</h3>
                        <p className="text-muted-foreground">Our AI is analyzing trends for {selectedFestival}.</p>
                    </div>
                </div>
            )}

            {forecast ? (
                <div className="space-y-8 animate-in fade-in-50">
                    <div className="grid md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="font-headline">Market Snapshot for {selectedFestival}</CardTitle>
                            </CardHeader>
                            <CardContent>
                                 <p className="text-muted-foreground">{forecast.forecastSummary}</p>
                            </CardContent>
                        </Card>
                        {forecast.categorySalesForecast && forecast.categorySalesForecast.length > 0 && (
                            <Card>
                                <CardHeader>
                                    <CardTitle className="font-headline flex items-center gap-2">
                                        <BarChart2 className="h-5 w-5 text-primary" />
                                        Projected Sales Boost
                                    </CardTitle>
                                    <CardDescription>
                                        Potential sales increase by category for {selectedFestival}.
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <ChartContainer config={chartConfig} className="min-h-[250px] w-full">
                                        <BarChart data={forecast.categorySalesForecast} margin={{ top: 20, right: 10, left: -10 }}>
                                            <CartesianGrid vertical={false} />
                                            <XAxis
                                                dataKey="category"
                                                tickLine={false}
                                                tickMargin={10}
                                                axisLine={false}
                                                stroke="hsl(var(--muted-foreground))"
                                                tickFormatter={(value) => value.charAt(0).toUpperCase() + value.slice(1).replace('-', ' ')}
                                            />
                                            <YAxis
                                                stroke="hsl(var(--muted-foreground))"
                                                tickFormatter={(value) => `${value}%`}
                                            />
                                            <Tooltip
                                                cursor={false}
                                                content={<ChartTooltipContent
                                                    formatter={(value) => `${value}%`}
                                                    indicator="dot"
                                                />}
                                            />
                                            <Bar dataKey="salesBoost" fill="var(--color-salesBoost)" radius={4} />
                                        </BarChart>
                                    </ChartContainer>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-6">
                        <ResultCard title="Top Products" icon={ShoppingCart} items={forecast.topProductSuggestions} />
                        <ResultCard title="Marketing Ideas" icon={Megaphone} items={forecast.marketingIdeas} />
                    </div>
                    
                    <Separator />

                    <div>
                        <div className="flex items-center gap-3 mb-6">
                            <Lightbulb className="h-7 w-7 text-primary" />
                            <h3 className="text-2xl font-bold font-headline">New Product Ideas & Analysis</h3>
                        </div>
                        {forecast.newProductIdeas.length > 0 ? (
                            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {forecast.newProductIdeas.map((idea, index) => <NewProductIdeaCard key={index} idea={idea} />)}
                            </div>
                        ) : (
                             <p className="text-sm text-muted-foreground">No new product ideas were generated.</p>
                        )}
                    </div>
                </div>
            ) : (
                !isLoading && (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                             <CalendarHeart className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Ready for the Festive Season?</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            Select a festival and click "Generate Forecast" to get AI-powered insights on what to stock, how to market, and what to create to maximize your sales.
                        </p>
                    </div>
                )
            )}
        </div>
    );
}
