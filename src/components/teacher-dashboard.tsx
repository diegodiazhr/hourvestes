
'use client';
import { useMemo, useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/header';
import { useAuth } from '@/hooks/use-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, BarChart2, CheckCircle, UserPlus, Link } from 'lucide-react';
import MyStudentsPage from '@/app/teacher/students/page';
import { getStudentsForTeacher, getProjectsForStudent } from '@/lib/data';
import type { UserProfile, Project } from '@/lib/types';
import { GOAL_HOURS } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

export default function TeacherDashboard() {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState<(UserProfile & { totalHours: number })[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile && userProfile.role === 'Profesor') {
      getStudentsForTeacher(userProfile).then(async (studentProfiles) => {
        const studentsWithHours = await Promise.all(
          studentProfiles.map(async (student) => {
            const projects = await getProjectsForStudent(student.id);
            const totalMilliseconds = projects.reduce((acc, project) => {
                const projectTime =
                  project.timeEntries?.reduce((timeAcc, entry) => {
                    if (entry.endTime) {
                      const start = new Date(entry.startTime).getTime();
                      const end = new Date(entry.endTime).getTime();
                      return timeAcc + (end - start);
                    }
                    return timeAcc;
                  }, 0) || 0;
                return acc + projectTime;
              }, 0);
            const totalHours = totalMilliseconds / (1000 * 60 * 60);
            return { ...student, totalHours };
          })
        );
        setStudents(studentsWithHours);
        setLoading(false);
      });
    } else if (userProfile) {
      setLoading(false);
    }
  }, [userProfile]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const studentsCompleted = students.filter(s => s.totalHours >= GOAL_HOURS).length;
    const totalHours = students.reduce((acc, s) => acc + s.totalHours, 0);
    const averageProgress = totalStudents > 0 ? (totalHours / (totalStudents * GOAL_HOURS)) * 100 : 0;

    return {
      totalStudents,
      studentsCompleted,
      averageProgress: Math.min(averageProgress, 100)
    }
  }, [students]);

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
                    <div className="text-2xl font-bold">{loading ? '...' : stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Alumnos vinculados a tu cuenta</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Progreso Medio</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{loading ? '...' : `${stats.averageProgress.toFixed(0)}%`}</div>
                    <p className="text-xs text-muted-foreground">del total de horas CAS completado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Alumnos Completados</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{loading ? '...' : stats.studentsCompleted}</div>
                    <p className="text-xs text-muted-foreground">han alcanzado la meta de horas</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Invitar Alumno</CardTitle>
                    <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-6">
                    <InviteButton userProfile={userProfile} />
                </CardContent>
            </Card>
        </div>
        
        <MyStudentsPage 
            students={students || []} 
            loading={loading} 
            userProfile={userProfile} 
        />

      </main>
    </div>
  );
}

function InviteButton({ userProfile }: { userProfile: UserProfile | null }) {
    const { toast } = useToast();

    const handleInvite = () => {
        if (!userProfile) {
             toast({
                variant: 'destructive',
                title: "Error de Perfil",
                description: "No se puede generar el enlace porque tu perfil no está cargado.",
            });
            return;
        };

        const baseUrl = 'https://studio-6718836827-4de5a.web.app';
        const schoolQueryParam = userProfile.school
          ? `&school=${encodeURIComponent(userProfile.school)}`
          : '';
        const inviteLink = `${baseUrl}/register?ref=${userProfile.id}${schoolQueryParam}`;
        
        navigator.clipboard.writeText(inviteLink);

        toast({
            title: "¡Enlace de Invitación Copiado!",
            description: "Comparte este enlace con tus alumnos para que se registren y se vinculen a ti.",
        });
    };
    
    return (
        <Button onClick={handleInvite} className="w-full">
            <UserPlus className="mr-2"/>
            Copiar Enlace de Invitación
        </Button>
    )
}

MyStudentsPage.InviteButton = InviteButton;
