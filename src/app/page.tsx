
import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { ProjectCard } from '@/components/project-card';
import { getProjects } from '@/lib/data';
import { TimeSummaryChart } from '@/components/time-summary-chart';

export default async function Home() {
  const projects = await getProjects();
  
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Mis Proyectos CAS
          </h1>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> Nuevo Proyecto
            </Link>
          </Button>
        </div>
        {projects.length > 0 ? (
          <div className="grid gap-8 lg:grid-cols-3">
             <div className="lg:col-span-2 grid gap-6 md:grid-cols-2">
                {projects.map(project => (
                  <ProjectCard key={project.id} project={project} />
                ))}
              </div>
              <div className="lg:col-span-1">
                <TimeSummaryChart projects={projects} />
              </div>
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">Aún no hay proyectos.</h2>
            <p className="text-muted-foreground mt-2">Comienza creando tu primer proyecto CAS.</p>
            <Button asChild className="mt-4">
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Crear Proyecto
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
