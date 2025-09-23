
'use client';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart2, UserPlus, CheckCircle } from 'lucide-react';
import MyStudentsPage from '@/app/teacher/students/page';

export default function TeacherDashboard() {
  const { userProfile } = useAuth();

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8 space-y-8">
        <div>
          <h1 className="text-3xl font-bold font-headline text-foreground">
            Panel de Profesor
          </h1>
          <p className="text-muted-foreground">
            Bienvenido, {userProfile?.name}. Gestiona a tus alumnos y su progreso.
          </p>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total de Alumnos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">12</div>
                    <p className="text-xs text-muted-foreground">Alumnos vinculados a tu cuenta</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progreso Medio</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">45%</div>
                    <p className="text-xs text-muted-foreground">del total de horas CAS completado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alumnos Completados</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">2</div>
                    <p className="text-xs text-muted-foreground">han alcanzado la meta de horas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Invitar Alumno</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <Button asChild className="w-full">
                        <Link href="/teacher/students">
                            <UserPlus className="mr-2" /> Ir a Invitaciones
                        </Link>
                    </Button>
                </CardContent>
            </Card>
        </div>
        
        <MyStudentsPage />

      </main>
    </div>
  );
}
