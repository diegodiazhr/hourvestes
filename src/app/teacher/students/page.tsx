
import { Suspense } from 'react';
import { Header } from '@/components/header';
import { TeacherClasses } from '@/components/teacher-classes';
import { Skeleton } from '@/components/ui/skeleton';

function ClassesSkeleton() {
  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex justify-between items-center">
        <Skeleton className="h-9 w-48" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="space-y-8">
        <div className="border rounded-lg p-4">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-4" />
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
        <div className="border rounded-lg p-4">
          <Skeleton className="h-6 w-1/3 mb-4" />
          <Skeleton className="h-4 w-1/2 mb-4" />
           <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            <Skeleton className="h-24 w-full" />
          </div>
        </div>
      </div>
    </div>
  );
}


export default function TeacherStudentsPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1">
        <Suspense fallback={<ClassesSkeleton />}>
          <TeacherClasses />
        </Suspense>
      </main>
    </div>
  );
}
