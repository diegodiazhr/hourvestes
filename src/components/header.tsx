'use client';
import Link from 'next/link';
import { BookOpenCheck, LogOut, Users } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { Button } from './ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar';


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
          
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
             {userProfile?.role === 'Profesor' ? (
                <Link href="/teacher/students" className="text-muted-foreground transition-colors hover:text-foreground">Alumnos</Link>
             ) : (
                <Link href="/projects/new" className="text-muted-foreground transition-colors hover:text-foreground">Nuevo Proyecto</Link>
             )}
          </nav>
          
          {user && userProfile && (
            <div className="flex items-center gap-2 md:gap-4">
               <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                       <Avatar>
                         <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.name}`} alt={userProfile.name} />
                         <AvatarFallback>{userProfile.name.charAt(0)}</AvatarFallback>
                       </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent className="w-56" align="end" forceMount>
                    <DropdownMenuLabel className="font-normal">
                      <div className="flex flex-col space-y-1">
                        <p className="text-sm font-medium leading-none">{userProfile.name}</p>
                        <p className="text-xs leading-none text-muted-foreground">
                          {user.email}
                        </p>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleSignOut}>
                      <LogOut className="mr-2 h-4 w-4" />
                      <span>Cerrar Sesión</span>
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
