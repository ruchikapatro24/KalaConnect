
'use client';

import QRCode from 'qrcode.react';
import { Copy, Loader2 } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Label } from '../ui/label';

interface ShareCartDialogProps {
  cartId: string | null;
  isLoading: boolean;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ShareCartDialog({ cartId, isLoading, open, onOpenChange }: ShareCartDialogProps) {
  const { toast } = useToast();
  const shareUrl = cartId ? `${window.location.origin}/cart/${cartId}` : '';

  const copyLink = () => {
    if (!shareUrl) return;
    navigator.clipboard.writeText(shareUrl);
    toast({ title: 'Link copied to clipboard!' });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Share Your Cart</DialogTitle>
          <DialogDescription>
            Anyone with this link can view and edit this cart in real-time.
          </DialogDescription>
        </DialogHeader>
        <div className="flex flex-col items-center justify-center gap-4 py-4 min-h-[240px]">
            {isLoading ? (
                <div className="flex flex-col items-center justify-center text-center">
                    <Loader2 className="h-12 w-12 animate-spin text-primary" />
                    <p className="mt-4 text-muted-foreground">Creating your secure sharing link. This can take a moment...</p>
                </div>
            ) : cartId && (
                <>
                    <div className="p-4 border rounded-md bg-white">
                        <QRCode value={shareUrl} size={160} />
                    </div>
                    <div className="w-full space-y-2">
                        <Label htmlFor="share-link">Shareable Link</Label>
                        <div className="flex items-center space-x-2">
                            <Input id="share-link" value={shareUrl} readOnly />
                            <Button type="button" size="icon" onClick={copyLink}>
                                <Copy className="h-4 w-4" />
                                <span className="sr-only">Copy Link</span>
                            </Button>
                        </div>
                    </div>
                </>
            )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
