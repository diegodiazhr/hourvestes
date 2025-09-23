'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { getUserProfile, type UserProfile } from '@/lib/data';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  loading: true,
});

const publicRoutes = ['/login', '/register'];

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setUser(user);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
      } else {
        setUser(null);
        setUserProfile(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (loading) return;

    const isPublic = publicRoutes.some(route => pathname.startsWith(route));

    if (!user && !isPublic) {
      router.push('/login');
    } else if (user && isPublic) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const isPublic = publicRoutes.some(route => pathname.startsWith(route));

  if (loading && !isPublic) {
    return <DashboardSkeleton />;
  }
  
  if (!user && isPublic) {
    return <>{children}</>;
  }

  if(!user && !isPublic) {
    return <DashboardSkeleton />;
  }

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export function DashboardSkeleton() {
    return (
      <div className="space-y-8 p-4 md:p-8">
        <div className="flex justify-between items-center">
          <div className="h-9 w-64 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <div className="h-28 rounded-lg bg-muted animate-pulse" />
          <div className="h-28 rounded-lg bg-muted animate-pulse" />
          <div className="h-28 rounded-lg bg-muted animate-pulse" />
          <div className="h-28 rounded-lg bg-muted animate-pulse" />
        </div>
        <div className="h-96 rounded-lg bg-muted animate-pulse" />
      </div>
    );
  }
  
  
