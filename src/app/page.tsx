
'use client';
import { useAuth } from '@/hooks/use-auth';
import StudentDashboard from '@/components/student-dashboard';
import TeacherDashboard from '@/components/teacher-dashboard';
import { Skeleton } from '@/components/ui/skeleton';

function DashboardSkeleton() {
  return (
    <div className="space-y-8 p-4 md:p-8">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-64 rounded-lg" />
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <Skeleton className="h-96 rounded-lg" />
    </div>
  );
}

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
