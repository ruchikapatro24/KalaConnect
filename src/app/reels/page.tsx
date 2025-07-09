
'use client';

import { ReelCard } from '@/components/shared/reel-card';
import { useReelStore } from '@/hooks/use-reel-store';

export default function ReelsPage() {
  const { reels } = useReelStore();
  
  return (
    <div className="container mx-auto max-w-lg px-4 py-8">
      <div className="flex flex-col items-center gap-8">
        <div className="text-center">
            <h1 className="text-3xl md:text-4xl font-bold font-headline">Shoppable Reels</h1>
            <p className="text-muted-foreground mt-2">Tap on a reel to discover products</p>
        </div>
        <div className="w-full flex flex-col items-center gap-12">
            {reels.map((reel) => (
                <ReelCard key={reel.id} reel={reel} />
            ))}
        </div>
      </div>
    </div>
  );
}
