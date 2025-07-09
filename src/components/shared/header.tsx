
'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  Heart,
  Home,
  Languages,
  LogIn,
  LogOut,
  Clapperboard,
  User,
  LayoutDashboard,
  Menu,
  ShoppingCart,
  Search,
  Shirt,
} from 'lucide-react';
import { KalaConnectLogo } from '@/components/icons';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";
import { cn } from '@/lib/utils';
import { useWishlist } from '@/hooks/use-wishlist';
import { useAuth } from '@/hooks/use-auth';
import { useCart } from '@/hooks/use-cart';
import { useState } from 'react';
import { Input } from '../ui/input';
import { useI18n } from '@/hooks/use-i18n';

export default function Header() {
  const pathname = usePathname();
  const router = useRouter();
  const { wishlist } = useWishlist();
  const { isAuthenticated, user, logout } = useAuth();
  const { getCartItemCount } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const { t, setLocale, locale } = useI18n();
  const cartItemCount = getCartItemCount();

  const mainNavLinks = [
    { href: '/', label: t('Header.Home'), icon: <Home className="h-4 w-4" /> },
    { href: '/fashion-designer', label: t('Header.FashionDesigner'), icon: <Shirt className="h-4 w-4" /> },
    { href: '/reels', label: t('Header.Reels'), icon: <Clapperboard className="h-4 w-4" /> },
    { href: '/wishlist', label: t('Header.Wishlist'), icon: <Heart className="h-4 w-4" /> },
    { href: '/cart', label: t('Header.Cart'), icon: <ShoppingCart className="h-4 w-4" /> },
  ];

  const handleLogout = () => {
    logout();
    router.push('/');
  }
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/?search=${encodeURIComponent(searchQuery.trim())}`);
  };

  const navLinks = mainNavLinks.map(link => ({
    ...link,
    isActive: pathname === link.href,
  }));

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/account')) {
    return null;
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center">
        {/* Left section for mobile and desktop nav */}
        <div className="flex items-center">
          <Sheet>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="md:hidden"
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle Menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="pr-0">
               <Link href="/" className="mr-6 flex items-center space-x-2">
                  <KalaConnectLogo className="h-6 w-6 text-primary" />
                  <span className="font-bold sm:inline-block font-headline text-lg">
                    KalaConnect
                  </span>
                </Link>
              <div className="flex flex-col space-y-3 mt-6">
                {navLinks.map(({ href, label, icon, isActive }) => {
                   if ((href === '/wishlist' || href === '/cart') && !isAuthenticated) return null;
                   return (
                    <Link
                      key={href}
                      href={href}
                      className={cn(
                        "flex items-center gap-2 rounded-md p-3 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground",
                        isActive ? "bg-accent text-accent-foreground" : "text-muted-foreground"
                      )}
                    >
                      {icon}
                      <span>{label}</span>
                      {label === t('Header.Wishlist') && wishlist.size > 0 && (
                         <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{wishlist.size}</span>
                      )}
                      {label === t('Header.Cart') && cartItemCount > 0 && (
                         <span className="ml-auto flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">{cartItemCount}</span>
                      )}
                    </Link>
                  );
                })}
              </div>
            </SheetContent>
          </Sheet>
          <div className="mr-4 hidden md:flex">
            <Link href="/" className="mr-6 flex items-center space-x-2">
              <KalaConnectLogo className="h-6 w-6 text-primary" />
              <span className="hidden font-bold sm:inline-block font-headline text-lg">
                KalaConnect
              </span>
            </Link>
            <nav className="flex items-center space-x-6 text-sm font-medium">
              {navLinks.map(({ href, label, isActive }) => {
                if ((href === '/wishlist' || href === '/cart') || (href === '/reels')) return null;
                return (
                  <Link
                    key={href}
                    href={href}
                    className={cn(
                      'transition-colors hover:text-primary',
                      isActive ? 'text-primary' : 'text-muted-foreground'
                    )}
                  >
                    {label}
                  </Link>
                );
              })}
            </nav>
          </div>
        </div>

        {/* Center Search Bar */}
        <div className="flex-1 flex justify-center px-4">
          <form onSubmit={handleSearchSubmit} className="w-full max-w-sm hidden md:flex">
            <div className="relative w-full">
              <Input
                type="search"
                placeholder={t('Header.SearchPlaceholder')}
                className="pr-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <Button type="submit" variant="ghost" size="icon" className="absolute right-0 top-0 h-full w-10 text-muted-foreground hover:text-primary">
                <Search className="h-4 w-4" />
                <span className="sr-only">Search</span>
              </Button>
            </div>
          </form>
        </div>
        
        {/* Right Section Icons */}
        <div className="flex items-center justify-end space-x-2">
          {isAuthenticated && (
            <div className="hidden md:flex items-center">
              <Link href="/reels" className="relative">
                <Button variant="ghost" size="icon">
                  <Clapperboard className="h-5 w-5" />
                  <span className="sr-only">{t('Header.Reels')}</span>
                </Button>
              </Link>
              <Link href="/wishlist" className="relative">
                <Button variant="ghost" size="icon">
                  <Heart className="h-5 w-5" />
                  {wishlist.size > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      {wishlist.size}
                    </span>
                  )}
                  <span className="sr-only">{t('Header.Wishlist')}</span>
                </Button>
              </Link>
              <Link href="/cart" className="relative">
                <Button variant="ghost" size="icon">
                  <ShoppingCart className="h-5 w-5" />
                  {cartItemCount > 0 && (
                    <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs">
                      {cartItemCount}
                    </span>
                  )}
                  <span className="sr-only">{t('Header.Cart')}</span>
                </Button>
              </Link>
            </div>
          )}

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <Languages className="h-5 w-5" />
                <span className="sr-only">Change language</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onSelect={() => setLocale('en')} disabled={locale === 'en'}>English</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('hi')} disabled={locale === 'hi'}>हिन्दी</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('mr')} disabled={locale === 'mr'}>मराठी</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('bn')} disabled={locale === 'bn'}>বাংলা</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('pa')} disabled={locale === 'pa'}>ਪੰਜਾਬੀ</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('ta')} disabled={locale === 'ta'}>தமிழ்</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('te')} disabled={locale === 'te'}>తెలుగు</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('kn')} disabled={locale === 'kn'}>ಕನ್ನಡ</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('or')} disabled={locale === 'or'}>ଓଡ଼ିଆ</DropdownMenuItem>
              <DropdownMenuItem onSelect={() => setLocale('ur')} disabled={locale === 'ur'}>اردو</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isAuthenticated && user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User Menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>{user.email}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/account"><User className="mr-2 h-4 w-4" />{t('Header.MyAccount')}</Link>
                </DropdownMenuItem>
                {user.role === 'shopper' && (
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard"><LayoutDashboard className="mr-2 h-4 w-4" />{t('Header.Dashboard')}</Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  {t('Header.Logout')}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="flex items-center gap-2">
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">
                  <LogIn className="mr-2 h-4 w-4" />
                  {t('Header.Login')}
                </Link>
              </Button>
              <Button asChild size="sm">
                <Link href="/signup">{t('Header.SignUp')}</Link>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
