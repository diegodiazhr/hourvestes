'use client';

import { getProject, getProjectsForStudent, getUserProfile } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Project, UserProfile } from '@/lib/types';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      const fetchData = async () => {
        setLoading(true);
        const [studentProfile, studentProjects] = await Promise.all([
          getUserProfile(studentId),
          getProjectsForStudent(studentId),
        ]);
        
        if (!studentProfile) {
          notFound();
        }

        setStudent(studentProfile);
        setProjects(studentProjects);
        setLoading(false);
      };
      fetchData();
    }
  }, [studentId]);

  if (loading) {
    return (
        <div className="p-8">
            <Skeleton className="h-8 w-64 mb-4" />
            <Skeleton className="h-4 w-48 mb-8" />
            <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold">Detalles de {student?.name}</h1>
        <p className="text-muted-foreground">ID del alumno: {studentId}</p>

        <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Proyectos</h2>
            {projects.length > 0 ? (
                <ul className="space-y-4">
                    {projects.map(p => (
                        <li key={p.id} className="p-4 border rounded-md">
                            <h3 className="font-semibold">{p.name}</h3>
                            <p className="text-sm text-muted-foreground">{p.description}</p>
                        </li>
                    ))}
                </ul>
            ) : (
                <p>Este alumno todavía no tiene proyectos.</p>
            )}
        </div>
      </main>
    </div>
  );
}
