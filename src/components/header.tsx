import Link from 'next/link';
import { BookOpenCheck } from 'lucide-react';

export function Header() {
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
        </div>
      </div>
    </header>
  );
}
