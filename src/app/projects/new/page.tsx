import { Header } from '@/components/header';
import { ProjectForm } from '@/components/project-form';

export default function NewProjectPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold font-headline text-foreground">
              Registrar un Nuevo Proyecto
            </h1>
            <p className="text-muted-foreground mt-2">
              Rellena los detalles de tu experiencia CAS.
            </p>
          </div>
          <ProjectForm />
        </div>
      </main>
    </div>
  );
}
