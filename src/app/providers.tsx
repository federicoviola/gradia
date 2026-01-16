'use client';

import { Toaster } from '@/components/ui/toaster';
import { Header } from '@/components/layout/header';
import { LanguageProvider } from '@/context/language-context';
import { SessionProvider } from 'next-auth/react';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider>
      <LanguageProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="container mx-auto flex-grow px-4 py-8 sm:px-6 lg:px-8">
            {children}
          </main>
        </div>
        <Toaster />
      </LanguageProvider>
    </SessionProvider>
  );
}
