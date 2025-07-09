
'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import { Skeleton } from '@/components/ui/skeleton';
import AccountNav from '@/components/account/account-nav';

export default function AccountLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { isAuthenticated, user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!isAuthenticated) {
        router.push('/login?redirect=/account');
      } else if (user?.role === 'shopper') {
        // Redirect sellers to their dashboard
        router.push('/dashboard');
      }
    }
  }, [isAuthenticated, user, isLoading, router]);
  
  if (isLoading || !isAuthenticated || user?.role !== 'user') {
     return (
        <div className="flex min-h-screen">
            <div className="w-64 border-r p-4 space-y-4 hidden md:block">
                <Skeleton className="h-8 w-36" />
                <div className="space-y-2 pt-4">
                    <Skeleton className="h-8 w-full" />
                    <Skeleton className="h-8 w-full" />
                </div>
            </div>
            <main className="flex-1 p-8">
                <Skeleton className="h-8 w-64 mb-6" />
                <Skeleton className="h-96 w-full" />
            </main>
        </div>
     );
  }

  return (
    <div className="flex min-h-screen">
      <AccountNav />
      <main className="flex-1 p-4 sm:p-6 md:p-8">{children}</main>
    </div>
  );
}
