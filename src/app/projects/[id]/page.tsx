
import { ProjectDetail } from '@/components/project-detail';
import { Suspense } from 'react';
import { DashboardSkeleton } from '@/components/dashboard-skeleton';
import { Header } from '@/components/header';

export default function ProjectDetailPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <Suspense fallback={<DashboardSkeleton />}>
          <ProjectDetail />
        </Suspense>
      </main>
    </div>
  );
}
