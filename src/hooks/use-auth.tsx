
'use client';
import { useState, useEffect, createContext, useContext, ReactNode } from 'react';
import { onIdTokenChanged, User } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useRouter, usePathname } from 'next/navigation';
import { getUserProfile, getSchoolSettings, type UserProfile, type School } from '@/lib/data';
import {deleteCookie, setCookie} from 'cookies-next';

interface AuthContextType {
  user: User | null;
  userProfile: UserProfile | null;
  schoolSettings: School | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  userProfile: null,
  schoolSettings: null,
  loading: true,
});

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [schoolSettings, setSchoolSettings] = useState<School | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onIdTokenChanged(auth, async (user) => {
      setLoading(true);
      if (user) {
        setUser(user);
        const profile = await getUserProfile(user.uid);
        setUserProfile(profile);
        if (profile?.school) {
            const settings = await getSchoolSettings(profile.school);
            setSchoolSettings(settings);
        }
        const token = await user.getIdToken();
        setCookie('fb-token', token);
      } else {
        setUser(null);
        setUserProfile(null);
        setSchoolSettings(null);
        deleteCookie('fb-token');
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, userProfile, schoolSettings, loading }}>
        {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
