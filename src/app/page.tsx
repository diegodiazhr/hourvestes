
'use client';
import { useAuth } from '@/hooks/use-auth';
import StudentDashboard from '@/components/student-dashboard';
import TeacherDashboard from '@/components/teacher-dashboard';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';

export default function Home() {
  const { userProfile, loading } = useAuth();

  if (loading || !userProfile) {
    return <DashboardSkeleton />;
  }

  if (userProfile.role === 'Profesor') {
    return <TeacherDashboard />;
  }

  // Default to student dashboard
  return <StudentDashboard />;
}
