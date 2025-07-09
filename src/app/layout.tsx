import type { Metadata } from 'next';
import './globals.css';
import { cn } from '@/lib/utils';
import { Toaster } from '@/components/ui/toaster';
import { Providers } from '@/app/providers';
import Header from '@/components/shared/header';
import ChatAssistant from '@/components/shared/chat-assistant';

export const metadata: Metadata = {
  title: 'KalaConnect',
  description: 'KalaConnect – India’s Creative Commerce Bridge',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Alegreya:ital,wght@0,400..900;1,400..900&family=Belleza&display=swap" rel="stylesheet" />
      </head>
      <body className={cn('min-h-screen bg-background font-body antialiased')}>
        <Providers>
          <Header />
          <main>{children}</main>
          <ChatAssistant />
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
