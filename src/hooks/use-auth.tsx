'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onAuthStateChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { getUserProfile, type UserProfile } from '@/lib/data';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

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
    }

    if (user && isPublic) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const isPublic = publicRoutes.some(route => pathname.startsWith(route));
  const isAppLoading = loading && !isPublic;


  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {isAppLoading ? <DashboardSkeleton /> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
