
import { Suspense } from 'react';
import { Header } from '@/components/header';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { TeacherProjectDetail } from '@/components/teacher-project-detail';

export default function TeacherStudentProjectPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <TeacherProjectDetail />
        </Suspense>
      </main>
    </div>
  );
}
