import Link from 'next/link';
import { PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { ProjectCard } from '@/components/project-card';
import { projects } from '@/lib/data';

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-bold font-headline text-foreground">
            My CAS Projects
          </h1>
          <Button asChild className="bg-primary hover:bg-primary/90 text-primary-foreground">
            <Link href="/projects/new">
              <PlusCircle className="mr-2 h-4 w-4" /> New Project
            </Link>
          </Button>
        </div>
        {projects.length > 0 ? (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {projects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <h2 className="text-xl font-semibold text-muted-foreground">No projects yet.</h2>
            <p className="text-muted-foreground mt-2">Get started by creating your first CAS project.</p>
            <Button asChild className="mt-4">
              <Link href="/projects/new">
                <PlusCircle className="mr-2 h-4 w-4" /> Create Project
              </Link>
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
