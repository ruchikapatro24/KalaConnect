
'use client';

import { useEffect, useRef, useState } from 'react';
import { X, CameraOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import type { Product } from '@/lib/types';

interface VirtualTryOnProps {
  product: Product;
  onClose: () => void;
}

// URL-encoded SVG for a lip shape mask
const lipMask = `url("data:image/svg+xml,%3csvg width='200' height='100' viewBox='0 0 200 100' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M10,55 C20,15 180,15 190,55 C180,85 130,100 100,80 C70,100 20,85 10,55 Z' fill='black'/%3e%3c/svg%3e")`;


export function VirtualTryOn({ product, onClose }: VirtualTryOnProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    let stream: MediaStream | null = null;
    let isMounted = true;
    
    const requestCamera = async () => {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices) {
        if (!isMounted) return;
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Not Supported',
          description: 'Your browser does not support camera access.',
        });
        return;
      }

      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: true });
        if (!isMounted) {
            stream.getTracks().forEach(track => track.stop());
            return;
        }
        setHasCameraPermission(true);

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
      } catch (error) {
        if (!isMounted) return;
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to use this feature.',
        });
      }
    };

    requestCamera();

    return () => {
      isMounted = false;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
      if (videoRef.current && videoRef.current.srcObject) {
        (videoRef.current.srcObject as MediaStream).getTracks().forEach(track => track.stop());
        videoRef.current.srcObject = null;
      }
    };
  }, [toast]);

  return (
    <div className="fixed inset-0 bg-black/80 z-[9999] flex items-center justify-center p-4 animate-in fade-in">
      <Card className="w-full max-w-md relative animate-in fade-in zoom-in-95">
        <CardHeader>
          <CardTitle className="font-headline">Virtual Try-On: {product.name}</CardTitle>
          <Button variant="ghost" size="icon" className="absolute top-4 right-4" onClick={onClose}>
            <X className="h-5 w-5" />
            <span className="sr-only">Close</span>
          </Button>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="aspect-video w-full rounded-md border bg-muted flex items-center justify-center relative overflow-hidden">
            <video ref={videoRef} className="w-full h-full object-cover rounded-md scale-x-[-1]" autoPlay muted playsInline />
            {hasCameraPermission === null && (
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 text-center p-4">
                    <p>Requesting camera permission...</p>
                </div>
            )}
            {hasCameraPermission === false && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-background/90 text-center p-4">
                <CameraOff className="h-12 w-12 text-destructive" />
                <Alert variant="destructive" className="mt-4">
                  <AlertTitle>Camera Access Denied</AlertTitle>
                  <AlertDescription>
                    Please allow camera access in your browser to use this feature.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            {hasCameraPermission && (
              <>
                {/* Lip-shaped color overlay */}
                <div
                  className="absolute inset-0 pointer-events-none"
                  style={{
                    backgroundColor: product.color || '#C73B7E',
                    mixBlendMode: 'multiply',
                    opacity: 0.6,
                    maskImage: lipMask,
                    WebkitMaskImage: lipMask,
                    maskSize: '40%',
                    maskRepeat: 'no-repeat',
                    maskPosition: 'center 60%',
                  }}
                />
                {/* Helper outline for alignment */}
                 <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                  <svg width="40%" viewBox="0 0 200 100" xmlns="http://www.w3.org/2000/svg" style={{ transform: 'translateY(20%)', opacity: 0.3 }}>
                    <path d="M10,55 C20,15 180,15 190,55 C180,85 130,100 100,80 C70,100 20,85 10,55 Z" stroke="white" strokeWidth="5" fill="none" />
                  </svg>
                </div>

                <div className="absolute bottom-4 left-4 text-white font-bold [text-shadow:_0_1px_3px_rgb(0_0_0_/_70%)] bg-black/40 px-2 py-1 rounded z-10">
                  {product.name}
                </div>
              </>
            )}
          </div>
          <p className="text-sm text-muted-foreground text-center">
            Align your face with the guide. This is a simulation.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
