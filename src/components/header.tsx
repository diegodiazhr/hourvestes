
'use client';
import Link from 'next/link';
import { BookOpenCheck, LogOut, Menu } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import { Sheet, SheetContent, SheetTrigger } from './ui/sheet';

// This component can be used to display nav links in a sheet for mobile
function MobileNav() {
    // This is just a placeholder, in a real app you'd have your nav links here
    return (
        <nav className="grid gap-4 text-lg font-medium">
            <Link href="/" className="flex items-center gap-2 text-lg font-semibold">
                <BookOpenCheck className="h-6 w-6" />
                <span className="sr-only">HourVest</span>
            </Link>
            <Link href="/" className="text-muted-foreground hover:text-foreground">
                Dashboard
            </Link>
            <Link href="/projects/new" className="text-muted-foreground hover:text-foreground">
                Nuevo Proyecto
            </Link>
        </nav>
    )
}


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
            <span className="hidden sm:inline">HourVest</span>
          </Link>
          {user && (
            <div className="flex items-center gap-2 md:gap-4">
                <span className="text-sm text-foreground hidden sm:inline">
                    {userProfile?.name}
                </span>
              <Button onClick={handleSignOut} variant="ghost" size="sm">
                <LogOut className="mr-2 h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
