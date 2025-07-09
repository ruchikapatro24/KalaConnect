
'use client';

import { useState } from 'react';
import { Bot, MessageSquare, ThumbsDown, ThumbsUp, Lightbulb, Loader2, Sparkles, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { useToast } from '@/hooks/use-toast';
import { useProductStore } from '@/hooks/use-product-store';
import { analyzeReviewSentiment } from '@/ai/flows/analyze-review-sentiment';
import type { AnalyzeReviewSentimentOutput } from '@/ai/flows/analyze-review-sentiment';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

const ResultCard = ({ title, icon: Icon, items, variant = 'default' }: { title: string; icon: React.ElementType; items: string[], variant?: 'default' | 'positive' | 'negative' }) => {
    const iconColor = {
        default: 'text-primary',
        positive: 'text-green-600',
        negative: 'text-red-600',
    }[variant];

    return (
        <Card>
            <CardHeader className="flex flex-row items-center gap-3 space-y-0">
                <Icon className={cn("h-6 w-6", iconColor)} />
                <CardTitle className="font-headline">{title}</CardTitle>
            </CardHeader>
            <CardContent>
                {items.length > 0 ? (
                     <ul className="space-y-2 text-sm text-muted-foreground list-disc pl-5">
                        {items.map((item, index) => <li key={index}>{item}</li>)}
                    </ul>
                ) : (
                    <p className="text-sm text-muted-foreground">No specific themes found.</p>
                )}
            </CardContent>
        </Card>
    );
}

export default function SentimentAnalysisPage() {
    const [analysis, setAnalysis] = useState<AnalyzeReviewSentimentOutput | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const { toast } = useToast();
    const { products } = useProductStore();
    const sellerId = 'seller-1'; // Demo seller
    const sellerProducts = products.filter(p => p.sellerId === sellerId);
    
    const hasReviews = sellerProducts.some(p => p.reviews && p.reviews.length > 0);

    const handleGenerateAnalysis = async () => {
        setIsLoading(true);
        setAnalysis(null);
        try {
            const result = await analyzeReviewSentiment(sellerProducts);
            setAnalysis(result);
            toast({
                title: 'Analysis Complete!',
                description: 'Your customer sentiment report is ready.',
            });
        } catch (error: any) {
            console.error(error);
            toast({
                title: 'Analysis Failed',
                description: error.message || 'Could not generate sentiment analysis. Please try again.',
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
                    <h1 className="text-3xl font-bold font-headline">Buyer Sentiment Analysis</h1>
                    <p className="text-muted-foreground">
                        Understand what your customers are saying with AI-powered review analysis.
                    </p>
                </div>
                 <Button onClick={handleGenerateAnalysis} disabled={isLoading || !hasReviews} size="lg">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Analyze Customer Reviews
                </Button>
            </div>
            
            <Separator />
            
            {!hasReviews && !isLoading && (
                 <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>No Reviews Found</AlertTitle>
                    <AlertDescription>
                        There are no customer reviews for your products yet. Sentiment analysis will be available once you receive some feedback.
                    </AlertDescription>
                </Alert>
            )}

            {isLoading && (
                <div className="flex items-center justify-center text-center py-20">
                    <div className="space-y-4">
                        <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                        <h3 className="text-lg font-semibold">Reading the reviews...</h3>
                        <p className="text-muted-foreground">Our AI is analyzing your customer feedback.</p>
                    </div>
                </div>
            )}
            
            {analysis ? (
                 <div className="space-y-8 animate-in fade-in-50">
                    <Card>
                        <CardHeader>
                            <CardTitle className="font-headline">Overall Sentiment Score</CardTitle>
                            <CardDescription>A score from 0 (very negative) to 10 (very positive).</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center gap-4">
                                <span className="text-4xl font-bold">{analysis.sentimentScore}/10</span>
                                <Progress value={analysis.sentimentScore * 10} className="w-full" />
                            </div>
                             <p className="text-lg font-semibold text-center">
                                General Sentiment: <span className={cn(
                                    analysis.overallSentiment === 'Positive' && 'text-green-600',
                                    analysis.overallSentiment === 'Negative' && 'text-red-600',
                                    analysis.overallSentiment === 'Neutral' && 'text-yellow-600',
                                )}>{analysis.overallSentiment}</span>
                             </p>
                        </CardContent>
                    </Card>

                     <div className="grid md:grid-cols-2 gap-6">
                        <ResultCard title="Positive Themes" icon={ThumbsUp} items={analysis.positiveKeywords} variant="positive" />
                        <ResultCard title="Negative Themes" icon={ThumbsDown} items={analysis.negativeKeywords} variant="negative" />
                     </div>

                    <ResultCard title="Actionable Suggestions" icon={Lightbulb} items={analysis.actionableSuggestions} />

                 </div>
            ) : (
                !isLoading && hasReviews && (
                    <div className="text-center py-20 border-2 border-dashed rounded-lg flex flex-col items-center justify-center">
                        <div className="p-4 bg-primary/10 rounded-full mb-4">
                             <MessageSquare className="h-10 w-10 text-primary" />
                        </div>
                        <h3 className="text-xl font-bold font-headline">Unlock Customer Insights</h3>
                        <p className="text-muted-foreground mt-2 max-w-md">
                            Click "Analyze Customer Reviews" to let AI summarize your feedback, identify key themes, and provide actionable suggestions for improvement.
                        </p>
                    </div>
                )
            )}
        </div>
    );
}
