
'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Send } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { mockSellers } from '@/lib/mock-data';
import type { GenerateFashionDesignOutput } from '@/ai/flows/generate-fashion-design';
import type { Seller } from '@/lib/types';

interface RequestDesignDialogProps {
  design: GenerateFashionDesignOutput | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RequestDesignDialog({ design, open, onOpenChange }: RequestDesignDialogProps) {
  const { toast } = useToast();
  const [selectedSeller, setSelectedSeller] = useState<Seller | null>(null);

  const handleSendRequest = () => {
    if (!selectedSeller) {
      toast({
        title: 'Please select an artisan',
        variant: 'destructive',
      });
      return;
    }

    // In a real app, this would trigger a backend process
    console.log(`Sending design "${design?.designName}" to seller ${selectedSeller.name}`);
    
    toast({
      title: 'Request Sent!',
      description: `Your design idea has been sent to ${selectedSeller.name}. They may contact you for further details.`,
    });
    onOpenChange(false);
    setSelectedSeller(null);
  };
  
  if (!design) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Request this Design</DialogTitle>
          <DialogDescription>
            Choose an artisan to send your AI-generated design concept to. They can work with you to bring it to life.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
            <div className="flex items-center gap-4 p-2 border rounded-md">
                <Image src={design.designImageUri} alt={design.designName} width={60} height={60} className="rounded-md" />
                <div>
                    <p className="font-semibold">{design.designName}</p>
                    <p className="text-sm text-muted-foreground">AI-Generated Concept</p>
                </div>
            </div>
            
            <Select onValueChange={(sellerId) => {
                const seller = mockSellers.find(s => s.id === sellerId);
                setSelectedSeller(seller || null);
            }}>
                <SelectTrigger className="w-full">
                    <SelectValue placeholder="Select an Artisan..." />
                </SelectTrigger>
                <SelectContent>
                    {mockSellers.map(seller => (
                        <SelectItem key={seller.id} value={seller.id}>
                            {seller.name} ({seller.craftswomanName})
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
        </div>

        <DialogFooter>
          <Button type="button" onClick={handleSendRequest} disabled={!selectedSeller}>
            <Send className="mr-2 h-4 w-4" />
            Send Request
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
