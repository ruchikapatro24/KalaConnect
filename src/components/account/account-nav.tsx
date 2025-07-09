
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { User, Package, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { KalaConnectLogo } from '../icons';

const navLinks = [
  { href: '/account', label: 'My Profile', icon: <User className="h-5 w-5" /> },
  { href: '/account/orders', label: 'My Orders', icon: <Package className="h-5 w-5" /> },
];

export default function AccountNav() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  return (
    <aside className="w-64 flex-col border-r hidden md:flex">
       <div className="border-b p-4">
        <Link href="/" className="flex items-center gap-2 font-semibold">
           <KalaConnectLogo className="h-6 w-6 text-primary" />
           <span className="font-bold sm:inline-block font-headline text-lg">KalaConnect</span>
        </Link>
      </div>
      <div className="flex flex-1 flex-col justify-between">
        <nav className="grid gap-2 p-4 text-sm font-medium">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary',
                pathname === link.href && 'bg-muted text-primary'
              )}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="p-4 border-t">
            <Button variant="ghost" className="w-full justify-start gap-3" onClick={handleLogout}>
                <LogOut className="h-5 w-5" />
                Logout
            </Button>
        </div>
      </div>
    </aside>
  );
}
