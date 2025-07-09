'use client';

import { useState } from 'react';
import { BookText, Sparkles, Loader2, ClipboardCopy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { expandSellerStory } from '@/ai/flows/expand-seller-story';

export default function StoryPage() {
  const [brief, setBrief] = useState('');
  const [expandedStory, setExpandedStory] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleGenerate = async () => {
    if (!brief.trim()) {
      toast({
        title: 'Brief is empty',
        description: 'Please write a brief story to expand.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    setExpandedStory('');
    try {
      const result = await expandSellerStory({ briefStory: brief });
      setExpandedStory(result.expandedStory);
       toast({
        title: 'Story Generated!',
        description: 'Your expanded story is ready.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate your story. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleCopy = () => {
    navigator.clipboard.writeText(expandedStory);
    toast({ title: 'Copied to clipboard!' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Shopper Story Generator</h1>
        <p className="text-muted-foreground">
          Tell us a little about your brand, and we'll craft a compelling story for your customers.
        </p>
      </div>
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="font-headline">Your Brief</CardTitle>
            <CardDescription>
              In a few sentences, describe your brand's origin, values, and roots.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., We are a family of artisans from Jaipur, making pottery for 3 generations..."
              rows={8}
              value={brief}
              onChange={(e) => setBrief(e.target.value)}
            />
            <Button onClick={handleGenerate} disabled={isLoading} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Expand My Story
            </Button>
          </CardContent>
        </Card>
        <Card className="bg-primary/5">
          <CardHeader>
            <CardTitle className="font-headline">Your Expanded Story</CardTitle>
            <CardDescription>
                Here is the AI-generated narrative for your brand.
            </CardDescription>
          </CardHeader>
          <CardContent className="relative">
            {expandedStory && (
                <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={handleCopy}>
                    <ClipboardCopy className="h-5 w-5" />
                </Button>
            )}
            {isLoading ? (
                <div className="flex items-center justify-center h-48 text-muted-foreground">
                    <Loader2 className="h-8 w-8 animate-spin" />
                </div>
            ) : expandedStory ? (
              <div className="prose prose-sm max-w-none text-foreground whitespace-pre-wrap">
                {expandedStory}
              </div>
            ) : (
                <div className="flex flex-col items-center justify-center h-48 text-muted-foreground text-center">
                    <BookText className="h-12 w-12" />
                    <p className="mt-2">Your story will appear here.</p>
                </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
