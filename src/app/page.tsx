
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import StudentDashboard from '@/components/student-dashboard';
import TeacherDashboard from '@/components/teacher-dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

const publicRoutes = ['/login', '/register'];

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [loading, user, router]);
  

  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  if (userProfile?.role === 'Profesor') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
}
