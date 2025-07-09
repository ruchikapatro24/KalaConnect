
'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Star, Loader2 } from 'lucide-react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useProductStore } from '@/hooks/use-product-store';
import { useAuth } from '@/hooks/use-auth';
import { cn } from '@/lib/utils';

const reviewSchema = z.object({
  rating: z.number().min(1, 'Please select a rating').max(5),
  comment: z.string().min(10, 'Review must be at least 10 characters long.'),
});

interface ReviewDialogProps {
  productId: string;
  productName: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ReviewDialog({ productId, productName, open, onOpenChange }: ReviewDialogProps) {
  const { toast } = useToast();
  const { addReviewToProduct } = useProductStore();
  const { user } = useAuth();
  const [hoverRating, setHoverRating] = useState(0);

  const form = useForm<z.infer<typeof reviewSchema>>({
    resolver: zodResolver(reviewSchema),
    defaultValues: {
      rating: 0,
      comment: '',
    },
  });

  const onSubmit = (data: z.infer<typeof reviewSchema>) => {
    if (!user) {
      toast({ title: 'You must be logged in to leave a review.', variant: 'destructive' });
      return;
    }

    try {
      addReviewToProduct(productId, {
        author: user.name,
        rating: data.rating,
        comment: data.comment,
      });
      toast({ title: 'Review submitted!', description: 'Thank you for your feedback.' });
      form.reset();
      onOpenChange(false);
    } catch (error) {
      toast({ title: 'Submission failed', description: 'Could not submit your review.', variant: 'destructive' });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Write a review for {productName}</DialogTitle>
          <DialogDescription>
            Share your thoughts with other customers.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="rating"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Rating</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2" onMouseLeave={() => setHoverRating(0)}>
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={cn(
                            'h-8 w-8 cursor-pointer transition-colors',
                            (hoverRating >= star || field.value >= star)
                              ? 'text-primary fill-primary'
                              : 'text-muted-foreground'
                          )}
                          onMouseEnter={() => setHoverRating(star)}
                          onClick={() => field.onChange(star)}
                        />
                      ))}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="comment"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you like or dislike?"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Submit Review
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
