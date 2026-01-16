'use client';

import Link from 'next/link';
import { useLocale } from '@/context/language-context';
import { Button } from '@/components/ui/button';
import { Logo } from '@/components/icons/logo';
import { useSession, signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

export function Header() {
  const { t, toggleLanguage, language } = useLocale();
  const { data: session } = useSession();
  const user = session?.user;
  const router = useRouter();

  const handleLogout = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  return (
    <header className="no-print border-b bg-card px-4 py-3 sm:px-6 lg:px-8">
      <div className="container mx-auto flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-primary">
          <Logo className="h-7 w-7" />
          <span className="font-headline text-2xl">Gradia</span>
        </Link>
        <div className="flex items-center gap-4">
          {user ? (
            <>
              <Button asChild variant="ghost">
                <Link href="/dashboard">Dashboard</Link>
              </Button>
              <p className="hidden text-sm text-muted-foreground sm:block">
                Welcome, {user.email}
              </p>
              <Button variant="outline" onClick={handleLogout}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Button asChild variant="ghost">
                <Link href="/login">Login</Link>
              </Button>
              <Button asChild>
                <Link href="/signup">Sign Up</Link>
              </Button>
            </>
          )}
          <Button variant="outline" onClick={toggleLanguage} className="w-[50px]">
            {language === 'en' ? 'ES' : 'EN'}
            <span className="sr-only">{t('toggleLanguage')}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
