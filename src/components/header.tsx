'use client';
import Link from 'next/link';
import { BookOpenCheck, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';

export function Header() {
  const { user, userProfile } = useAuth();
  const router = useRouter();

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <header className="bg-card/80 backdrop-blur-lg border-b sticky top-0 z-20">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center gap-2 text-xl font-bold font-headline text-primary hover:text-primary/80 transition-colors"
          >
            <BookOpenCheck className="h-6 w-6" />
            <span>CAS Chronicle</span>
          </Link>
          {user && (
            <div className="flex items-center gap-4">
                <span className="text-sm text-foreground hidden sm:inline">
                    {userProfile?.name}
                </span>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar Sesión
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

    