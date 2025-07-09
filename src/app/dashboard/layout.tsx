
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import DashboardNav from '@/components/dashboard/dashboard-nav';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && (!isAuthenticated || user?.role !== 'shopper')) {
      router.push('/login');
    }
  }, [isAuthenticated, user, isLoading, router]);
  
  if (isLoading || !isAuthenticated || user?.role !== 'shopper') {
     return (
      <div className="min-h-screen">
          <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
            <div className="container flex h-16 items-center">
               <Skeleton className="h-8 w-36" />
               <div className="flex flex-1 items-center justify-end space-x-2">
                 <Skeleton className="h-8 w-8 rounded-full" />
               </div>
            </div>
          </header>
          <main className="container py-8">
             <div className="space-y-4">
                <Skeleton className="h-8 w-64" />
                <Skeleton className="h-4 w-96" />
                <div className="grid gap-6 pt-6 md:grid-cols-2 lg:grid-cols-3">
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                  <Skeleton className="h-24 rounded-lg" />
                </div>
             </div>
          </main>
      </div>
     );
  }

  return (
    <div className="min-h-screen">
      <DashboardNav />
      <main className="container py-8">{children}</main>
    </div>
  );
}
