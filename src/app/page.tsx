
'use client';
import { useAuth } from '@/hooks/use-auth';
import StudentDashboard from '@/components/student-dashboard';
import TeacherDashboard from '@/components/teacher-dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

export default function Home() {
  const { userProfile, loading } = useAuth();

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (userProfile?.role === 'Profesor') {
    return <TeacherDashboard />;
  }

  // Default to student dashboard if userProfile is available
  if (userProfile) {
    return <StudentDashboard />;
  }

  // Fallback while redirecting or if userProfile is null
  return <DashboardSkeleton />;
}
