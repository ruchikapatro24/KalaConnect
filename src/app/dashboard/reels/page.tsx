
'use client';

import { useState } from 'react';
import { Film, Upload, Sparkles, Loader2, Tag, Image as ImageIcon, Video, Bot } from 'lucide-react';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateReelCaption } from '@/ai/flows/generate-reel-caption';
import { generatePromoReel } from '@/ai/flows/generate-promo-reel';
import type { Product } from '@/lib/types';
import { Checkbox } from '@/components/ui/checkbox';
import { useProductStore } from '@/hooks/use-product-store';
import { useReelStore } from '@/hooks/use-reel-store';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

const UploadReelForm = () => {
  const [videoPreview, setVideoPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [summary, setSummary] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [taggedProducts, setTaggedProducts] = useState<Set<string>>(new Set());
  const { toast } = useToast();
  const { products } = useProductStore();
  const sellerProducts = products.filter(p => p.sellerId === 'seller-1');
  const { addReel } = useReelStore();

  const handleVideoChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file && file.type.startsWith('video/')) {
        const reader = new FileReader();
        reader.onloadend = () => {
            setVideoPreview(reader.result as string);
        };
        reader.readAsDataURL(file);
    } else {
        setVideoPreview(null);
        toast({ title: 'Invalid file type', description: 'Please upload a video file.', variant: 'destructive' });
    }
  };

  const handleGenerateCaption = async () => {
    if (!summary.trim()) {
        toast({ title: 'Summary is empty', description: 'Please describe the video content.', variant: 'destructive' });
        return;
    }
    setIsLoading(true);
    try {
      const productDescription = products
        .filter(p => taggedProducts.has(p.id))
        .map(p => p.name)
        .join(', ');

      const result = await generateReelCaption({
        videoContentSummary: summary,
        productDescription: productDescription || 'various handmade items',
        brandName: 'My KalaConnect Shop'
      });
      setCaption(result.caption);
      toast({
        title: 'Caption Generated!',
        description: 'A new caption has been created.',
      });
    } catch (error) {
      console.error(error);
      toast({ title: 'Generation Failed', description: 'Could not generate caption.', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleTagProduct = (productId: string) => {
    setTaggedProducts(prev => {
      const newSet = new Set(prev);
      if (newSet.has(productId)) {
        newSet.delete(productId);
      } else {
        newSet.add(productId);
      }
      return newSet;
    })
  }

  const handleSubmit = () => {
    if(!videoPreview || !caption) {
        toast({ title: 'Incomplete Reel', description: 'Please upload a video and generate a caption.', variant: 'destructive' });
        return;
    }
    addReel({
        caption,
        taggedProductIds: Array.from(taggedProducts)
    }, videoPreview, 'seller-1'); 

    toast({ title: 'Reel Uploaded!', description: 'Your new reel is now live.' });
    
    setVideoPreview(null);
    setCaption('');
    setSummary('');
    setTaggedProducts(new Set());
  }

  return (
    <div className="space-y-8">
        <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
                <Card>
                    <CardHeader>
                        <CardTitle className="font-headline flex items-center gap-2"><Video/> Video and Caption</CardTitle>
                    </CardHeader>
                    <CardContent className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-4">
                            <div className="aspect-square w-full rounded-md border-2 border-dashed flex items-center justify-center bg-muted/50">
                                {videoPreview ? (
                                    <video src={videoPreview} controls className="w-full h-full object-contain" />
                                ) : (
                                    <div className="text-center text-muted-foreground p-4">
                                    <Film className="mx-auto h-12 w-12" />
                                    <p>Upload a video</p>
                                    </div>
                                )}
                            </div>
                            <Input type="file" accept="video/*" onChange={handleVideoChange} />
                        </div>
                        <div className="space-y-4 flex flex-col">
                            <Textarea placeholder="Summarize your video content here..." rows={4} value={summary} onChange={e => setSummary(e.target.value)} />
                            <Button onClick={handleGenerateCaption} disabled={isLoading || !summary} className="w-full">
                                {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                                Generate Caption
                            </Button>
                            <Textarea placeholder="Your generated caption will appear here..." rows={6} value={caption} onChange={e => setCaption(e.target.value)} className="flex-grow"/>
                        </div>
                    </CardContent>
                </Card>
                <Button size="lg" className="w-full" onClick={handleSubmit}>Upload Reel</Button>
            </div>
            
            <Card className="lg:sticky lg:top-24 h-fit">
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><Tag className="w-5 h-5" /> Tag Products</CardTitle>
                    <CardDescription>Select products to feature in your reel.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="max-h-96 overflow-y-auto space-y-3 pr-2">
                    {sellerProducts.map((product: Product) => (
                        <div key={product.id} className="flex items-center gap-3 p-2 rounded-md hover:bg-accent/50">
                            <Checkbox 
                                id={`upload-product-${product.id}`}
                                checked={taggedProducts.has(product.id)}
                                onCheckedChange={() => handleTagProduct(product.id)}
                             />
                            <Image src={product.image} alt={product.name} width={40} height={40} className="rounded-md"/>
                            <label htmlFor={`upload-product-${product.id}`} className="text-sm font-medium leading-none cursor-pointer">
                                {product.name}
                            </label>
                        </div>
                    ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    </div>
  )
}

const GenerateReelForm = () => {
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedCaption, setGeneratedCaption] = useState('');
  const [generatedScript, setGeneratedScript] = useState('');
  const { toast } = useToast();
  const { products } = useProductStore();
  const { addReel } = useReelStore();
  const sellerProducts = products.filter(p => p.sellerId === 'seller-1');
  const selectedProduct = sellerProducts.find(p => p.id === selectedProductId);

  const handleGenerate = async () => {
    if (!selectedProduct) {
        toast({ title: 'No Product Selected', description: 'Please choose a product to generate a reel for.', variant: 'destructive' });
        return;
    }
    setIsGenerating(true);
    setGeneratedCaption('');
    setGeneratedScript('');
    try {
        const result = await generatePromoReel({
            productName: selectedProduct.name,
            productDescription: selectedProduct.description,
            productImage: selectedProduct.image,
        });
        setGeneratedCaption(result.caption);
        setGeneratedScript(result.script);
        toast({ title: 'Reel Assets Generated!', description: 'Review and edit the generated content below.' });
    } catch (error) {
        console.error(error);
        toast({ title: 'Generation Failed', description: 'Could not generate reel assets.', variant: 'destructive' });
    } finally {
        setIsGenerating(false);
    }
  };
  
  const handleUpload = () => {
      if (!generatedCaption || !selectedProduct) {
          toast({ title: 'Incomplete Reel', description: 'Please generate content for a selected product first.', variant: 'destructive' });
          return;
      }
      addReel({
          caption: generatedCaption,
          script: generatedScript,
          taggedProductIds: [selectedProduct.id],
          aiGenerated: true,
      }, selectedProduct.image, 'seller-1');

      toast({ title: 'AI Reel Uploaded!', description: 'Your new AI-generated reel is now live.' });
      
      setSelectedProductId('');
      setGeneratedCaption('');
      setGeneratedScript('');
  }

  return (
    <div className="space-y-8">
        <Card>
            <CardHeader>
                <CardTitle className="font-headline flex items-center gap-2"><Bot/> Generate from Product</CardTitle>
                <CardDescription>Select one of your products and let AI create a promotional reel for it.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-6 items-start">
                     <div className="space-y-4">
                        <Label>Select Product</Label>
                        <Select value={selectedProductId} onValueChange={setSelectedProductId}>
                            <SelectTrigger>
                                <SelectValue placeholder="Choose a product..."/>
                            </SelectTrigger>
                            <SelectContent>
                                {sellerProducts.map(p => (
                                    <SelectItem key={p.id} value={p.id}>{p.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <div className="aspect-square w-full rounded-md border-2 border-dashed flex items-center justify-center bg-muted/50">
                            {selectedProduct ? (
                                <Image src={selectedProduct.image} alt="Product preview" width={300} height={300} className="object-contain h-full w-full" />
                            ) : (
                                <div className="text-center text-muted-foreground p-4">
                                    <ImageIcon className="mx-auto h-12 w-12" />
                                    <p>Product image will appear here</p>
                                </div>
                            )}
                        </div>
                     </div>
                     <div className="space-y-4">
                         <Button onClick={handleGenerate} disabled={isGenerating || !selectedProductId} className="w-full">
                            {isGenerating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Sparkles className="mr-2 h-4 w-4" />}
                            Generate Reel Assets
                        </Button>
                        <Separator/>
                        <div className="space-y-2">
                             <Label htmlFor="gen-caption">Generated Caption</Label>
                             <Textarea id="gen-caption" placeholder="AI generated caption will appear here..." rows={4} value={generatedCaption} onChange={e => setGeneratedCaption(e.target.value)} />
                        </div>
                         <div className="space-y-2">
                             <Label htmlFor="gen-script">Generated Script</Label>
                             <Textarea id="gen-script" placeholder="AI generated script will appear here..." rows={6} value={generatedScript} onChange={e => setGeneratedScript(e.target.value)} />
                        </div>
                     </div>
                </div>
            </CardContent>
            <CardFooter>
                 <Button size="lg" className="w-full" onClick={handleUpload} disabled={!generatedCaption || !selectedProduct}>Upload AI-Generated Reel</Button>
            </CardFooter>
        </Card>
    </div>
  )
}

export default function ReelsDashboardPage() {
    return (
        <div className="max-w-6xl mx-auto space-y-8">
            <div>
                <h1 className="text-3xl font-bold font-headline">Shoppable Reels</h1>
                <p className="text-muted-foreground">
                Engage your audience with short videos and tag your products to drive sales.
                </p>
            </div>
            
            <Tabs defaultValue="upload">
                <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="upload">Upload Existing Reel</TabsTrigger>
                    <TabsTrigger value="generate">Generate Reel with AI</TabsTrigger>
                </TabsList>
                <TabsContent value="upload" className="mt-6">
                   <UploadReelForm />
                </TabsContent>
                <TabsContent value="generate" className="mt-6">
                    <GenerateReelForm />
                </TabsContent>
            </Tabs>
        </div>
    );
}
