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

const publicRoutes = ['/login', '/register', '/'];

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
    // If loading, don't do anything.
    if (loading) return;

    const isPublic = publicRoutes.some(route => pathname.startsWith(route));

    // If the user is not logged in and not on a public route, redirect to login.
    if (!user && !isPublic) {
      router.push('/login');
    }

    // If the user is logged in and on a public route (like login/register), redirect to home.
    if (user && (pathname === '/login' || pathname === '/register')) {
      router.push('/');
    }
  }, [user, loading, pathname, router]);

  const isPublic = publicRoutes.some(route => pathname.startsWith(route));

  return (
    <AuthContext.Provider value={{ user, userProfile, loading }}>
      {loading && !isPublic ? <div className="flex items-center justify-center h-screen"><p>Cargando...</p></div> : children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);