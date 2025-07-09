
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';
import { Sparkles, Loader2, Palette, Send } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateFashionDesign } from '@/ai/flows/generate-fashion-design';
import type { GenerateFashionDesignOutput } from '@/ai/flows/generate-fashion-design';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { useI18n } from '@/hooks/use-i18n';
import { RequestDesignDialog } from '@/components/fashion/request-design-dialog';

const designSchema = z.object({
  occasion: z.string().min(1, 'Occasion is required'),
  style: z.string().min(1, 'Style is required'),
  colorPalette: z.string().min(1, 'Color Palette is required'),
  userPrompt: z.string().optional(),
});

type DesignFormData = z.infer<typeof designSchema>;

export default function FashionDesignerPage() {
  const [designOutput, setDesignOutput] = useState<GenerateFashionDesignOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRequestDialogOpen, setIsRequestDialogOpen] = useState(false);
  const { toast } = useToast();
  const { t } = useI18n();

  const form = useForm<DesignFormData>({
    resolver: zodResolver(designSchema),
    defaultValues: {
      occasion: 'Festive',
      style: 'Modern Fusion',
      colorPalette: 'Royal blues and gold',
      userPrompt: '',
    },
  });

  const onSubmit = async (data: DesignFormData) => {
    setIsLoading(true);
    setDesignOutput(null);
    try {
      const result = await generateFashionDesign(data);
      setDesignOutput(result);
      toast({
        title: 'Your Design is Ready!',
        description: 'The AI Fashion Designer has created a new concept for you.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Design Generation Failed',
        description: 'Could not generate a design. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 md:py-12">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl md:text-4xl font-bold font-headline">AI Fashion Designer</h1>
          <p className="text-muted-foreground mt-2">
            Craft your dream outfit. Describe your vision and let AI bring it to life.
          </p>
        </div>

        <Card>
            <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid md:grid-cols-3 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="occasion">Occasion</Label>
                            <Input id="occasion" {...form.register('occasion')} placeholder="e.g., Wedding, Casual" />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="style">Style</Label>
                            <Input id="style" {...form.register('style')} placeholder="e.g., Modern, Fusion" />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="colorPalette">Color Palette</Label>
                            <Input id="colorPalette" {...form.register('colorPalette')} placeholder="e.g., Pastel Pinks, Gold" />
                        </div>
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="userPrompt">Specific Ideas (Optional)</Label>
                        <Textarea id="userPrompt" {...form.register('userPrompt')} placeholder="Tell us more... e.g., 'I want a flowing lehenga with floral embroidery'" rows={3} />
                    </div>

                    <Button type="submit" disabled={isLoading} className="w-full" size="lg">
                    {isLoading ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                        <Sparkles className="mr-2 h-4 w-4" />
                    )}
                    Generate Design
                    </Button>
                </form>
            </CardContent>
        </Card>
        
        {isLoading && (
            <div className="text-center py-16">
                <Loader2 className="mx-auto h-12 w-12 animate-spin text-primary" />
                <p className="mt-4 text-muted-foreground">Our AI is sketching your design...</p>
            </div>
        )}

        {designOutput && (
            <Card className="animate-in fade-in-50">
                <CardHeader>
                    <CardTitle className="font-headline text-3xl">{designOutput.designName}</CardTitle>
                </CardHeader>
                <CardContent className="grid md:grid-cols-2 gap-8">
                    <div className="space-y-6">
                        <div>
                             <Image
                                src={designOutput.designImageUri}
                                alt={designOutput.designName}
                                width={500}
                                height={500}
                                className="rounded-lg border object-cover aspect-square w-full"
                             />
                        </div>
                    </div>
                    <div className="space-y-6">
                        <div>
                            <h3 className="font-semibold font-headline text-lg">Concept</h3>
                            <p className="text-muted-foreground mt-2">{designOutput.description}</p>
                        </div>
                        <Separator/>
                        <div>
                             <h3 className="font-semibold font-headline text-lg flex items-center gap-2"><Palette/> Fabric Suggestions</h3>
                             <ul className="list-disc pl-5 mt-2 space-y-1 text-muted-foreground">
                                {designOutput.fabricSuggestions.map((fabric, index) => (
                                    <li key={index}>{fabric}</li>
                                ))}
                             </ul>
                        </div>
                         <Separator/>
                        <div>
                          <h3 className="font-semibold font-headline text-lg">Bring it to Life</h3>
                          <p className="text-muted-foreground mt-2 mb-4">
                            Love this design? Send this concept to one of our talented artisans and they can work with you to make it a reality.
                          </p>
                          <Button size="lg" onClick={() => setIsRequestDialogOpen(true)}>
                              <Send className="mr-2 h-5 w-5" />
                              Request this Design
                          </Button>
                        </div>
                    </div>
                </CardContent>
            </Card>
        )}
      </div>
       {designOutput && <RequestDesignDialog open={isRequestDialogOpen} onOpenChange={setIsRequestDialogOpen} design={designOutput} />}
    </div>
  );
}
