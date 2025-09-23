
'use client';
import Link from 'next/link';
import { PlusCircle, School, BookUser, CalendarClock, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { ProjectCard } from '@/components/project-card';
import { getProjects } from '@/lib/data';
import { TimeSummaryChart } from '@/components/time-summary-chart';
import { useAuth } from '@/hooks/use-auth';
import { useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatsCards } from '@/components/stats-cards';

function DashboardSkeleton() {
  return (
    <div className="space-y-8">
       <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
        <Skeleton className="h-28 rounded-lg" />
      </div>
      <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
          <Skeleton className="h-48 rounded-lg" />
          <Skeleton className="h-48 rounded-lg" />
        </div>
        <div className="lg:col-span-1">
          <Skeleton className="h-64 rounded-lg" />
        </div>
      </div>
    </div>
  )
}

export default function StudentDashboard() {
  const { user, userProfile, loading } = useAuth();
  const [projects, setProjects] = useState<Project[]>([]);
  const [projectsLoading, setProjectsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      getProjects().then(data => {
        setProjects(data);
        setProjectsLoading(false);
      });
    }
  }, [user]);

  if (loading || projectsLoading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto p-4 md:p-8">
           <DashboardSkeleton />
        </main>
      </div>
    )
  }
  
  const teacher = { name: "Prof. Anacleta", email: "anacleta@school.org" };
  const deadline = new Date();
  deadline.setMonth(deadline.getMonth() + 6);

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        <div>
            <h1 className="text-2xl md:text-3xl font-bold font-headline text-foreground">
                Bienvenido, {userProfile?.name.split(' ')[0]}
            </h1>
            <p className="text-muted-foreground">Aquí tienes un resumen de tu progreso en CAS.</p>
        </div>

        <StatsCards projects={projects} />
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Institución</CardTitle>
                    <School className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-semibold">{userProfile?.school || 'No especificada'}</div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Profesor Vinculado</CardTitle>
                    <BookUser className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                <div className="text-lg font-semibold">{teacher.name}</div>
                <p className="text-xs text-muted-foreground">{teacher.email}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Fecha Límite (Estimada)</CardTitle>
                    <CalendarClock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-lg font-semibold">{deadline.toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
                </CardContent>
            </Card>
        </div>


        <div className="flex items-center justify-between mt-8">
          <h2 className="text-2xl font-bold font-headline text-foreground">
            Mis Proyectos
          </h2>
          <Button asChild>
            <Link href="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> 
              <span className="hidden sm:inline">Nuevo Proyecto</span>
            </Link>
          </Button>
        </div>

        {projects.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">
              <div className="lg:col-span-2 grid gap-6 grid-cols-1 sm:grid-cols-2">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="hidden lg:block lg:col-span-1">
                <TimeSummaryChart projects={projects} />
              </div>
          </div>
        ) : (
          <div className="text-center py-12 md:py-16 border-2 border-dashed rounded-lg">
            <Trophy className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-muted-foreground mt-4">¡Aún no hay proyectos!</h2>
            <p className="text-muted-foreground mt-2">Comienza tu viaje CAS creando tu primer proyecto.</p>
            <Button asChild className="mt-4">
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Primer Proyecto
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
