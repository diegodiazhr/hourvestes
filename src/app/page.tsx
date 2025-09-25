
'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/use-auth';
import StudentDashboard from '@/components/student-dashboard';
import TeacherDashboard from '@/components/teacher-dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

export default function Home() {
  const { user, userProfile, loading } = useAuth();
  
  if (loading || !user) {
    return <DashboardSkeleton />;
  }

  if (userProfile?.role === 'Profesor') {
    return <TeacherDashboard />;
  }

  return <StudentDashboard />;
}
