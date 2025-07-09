
'use client';

import { useState } from 'react';
import { Sparkles, Upload, Loader2, Tag, BookOpen, PenSquare } from 'lucide-react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import Image from 'next/image';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { generateProductListing } from '@/ai/flows/generate-product-listing';
import type { GenerateProductListingOutput } from '@/ai/flows/generate-product-listing';
import { useProductStore } from '@/hooks/use-product-store';

const productSchema = z.object({
  title: z.string().min(1, 'Title is required'),
  description: z.string().min(1, 'Description is required'),
  price: z.preprocess(
    (a) => parseFloat(z.string().parse(a)),
    z.number().positive('Price must be a positive number')
  ),
  stock: z.preprocess(
    (a) => parseInt(z.string().parse(a) || '0', 10),
    z.number().min(0, 'Stock must be a non-negative number').default(0)
  ),
  culturalContext: z.string().optional(),
  hashtags: z.string(),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AddProductPage() {
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const { addProduct } = useProductStore();

  const form = useForm<ProductFormData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      title: '',
      description: '',
      price: 0,
      stock: 0,
      culturalContext: '',
      hashtags: '',
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleGenerate = async () => {
    if (!imagePreview) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload a product image first.',
        variant: 'destructive',
      });
      return;
    }
    setIsLoading(true);
    try {
      const result: GenerateProductListingOutput = await generateProductListing({
        productImage: imagePreview,
        culturalContextPrompt: form.getValues('culturalContext'),
      });
      form.setValue('title', result.title);
      form.setValue('description', result.description);
      form.setValue('culturalContext', result.culturalContext);
      form.setValue('hashtags', result.hashtags.join(', '));
      toast({
        title: 'Content Generated!',
        description: 'Product details have been filled in.',
      });
    } catch (error) {
      console.error(error);
      toast({
        title: 'Generation Failed',
        description: 'Could not generate product details. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmit = (data: ProductFormData) => {
    if (!imagePreview) {
      toast({
        title: 'No Image Selected',
        description: 'Please upload a product image first.',
        variant: 'destructive',
      });
      return;
    }

    const productData = {
      name: data.title,
      description: data.description,
      culturalContext: data.culturalContext,
      price: data.price,
      stock: data.stock,
      tags: data.hashtags.split(',').map(tag => tag.trim()),
    };

    addProduct(productData, imagePreview, 'seller-1');

    toast({
        title: 'Product Saved!',
        description: 'Your new product has been added to the shop.',
    });
    form.reset();
    setImagePreview(null);
    setImageFile(null);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold font-headline">Add Product with GenAI</h1>
        <p className="text-muted-foreground">
          Upload an image, and let our AI create an engaging product listing for you.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 font-headline">
                <Upload className="h-5 w-5" /> Product Image
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="aspect-square w-full rounded-md border-2 border-dashed flex items-center justify-center bg-muted/50">
              {imagePreview ? (
                <Image src={imagePreview} alt="Product preview" width={400} height={400} className="object-contain h-full w-full" />
              ) : (
                <div className="text-center text-muted-foreground">
                  <Upload className="mx-auto h-12 w-12" />
                  <p>Upload an image</p>
                </div>
              )}
            </div>
            <Input type="file" accept="image/*" onChange={handleImageChange} />
             <Button onClick={handleGenerate} disabled={isLoading || !imagePreview} className="w-full">
              {isLoading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Sparkles className="mr-2 h-4 w-4" />
              )}
              Generate Details
            </Button>
          </CardContent>
        </Card>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2">
                        <PenSquare className="h-5 w-5" /> Edit Details
                    </CardTitle>
                    <CardDescription>Review and edit the AI-generated content before saving.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                     <Controller
                        name="title"
                        control={form.control}
                        render={({ field }) => (
                           <Input placeholder="Product Title" {...field} />
                        )}
                        />
                     <Controller
                        name="description"
                        control={form.control}
                        render={({ field }) => (
                           <Textarea placeholder="Product Description" rows={5} {...field} />
                        )}
                        />
                     <Controller
                        name="price"
                        control={form.control}
                        render={({ field }) => (
                           <Input type="number" placeholder="Product Price (₹)" {...field} onChange={e => field.onChange(e.target.value)} />
                        )}
                        />
                     <Controller
                        name="stock"
                        control={form.control}
                        render={({ field }) => (
                           <Input type="number" placeholder="Stock Quantity" {...field} onChange={e => field.onChange(e.target.value)} />
                        )}
                        />
                     <Controller
                        name="culturalContext"
                        control={form.control}
                        render={({ field }) => (
                           <Textarea placeholder="Cultural Context (optional, helps AI)" rows={3} {...field} />
                        )}
                        />
                     <Controller
                        name="hashtags"
                        control={form.control}
                        render={({ field }) => (
                           <Input placeholder="Hashtags, separated by commas" {...field} />
                        )}
                        />
                    
                </CardContent>
            </Card>

            <Button type="submit" className="w-full" size="lg">Save Product</Button>
        </form>
      </div>
    </div>
  );
}
