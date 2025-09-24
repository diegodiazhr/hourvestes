import { Header } from '@/components/header';
import { SchoolSettingsForm } from '@/components/school-settings-form';

export default function TeacherSchoolPage() {
  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="max-w-2xl mx-auto">
            <div className="mb-8">
                <h1 className="text-3xl font-bold font-headline">Ajustes del Colegio</h1>
                <p className="text-muted-foreground mt-1">
                    Gestiona la configuración global para todos tus alumnos y clases.
                </p>
            </div>
            <SchoolSettingsForm />
        </div>
      </main>
    </div>
  );
}
