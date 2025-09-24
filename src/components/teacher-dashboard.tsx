
'use client';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  BarChart2,
  CheckCircle,
  Home,
  User,
  Building,
  Settings,
  LogOut,
  Copy,
  Search,
  Filter,
  FolderKanban,
  Menu,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { onStudentsUpdate, getProjectsForStudent } from '@/lib/data';
import type { UserProfile, Project } from '@/lib/types';
import { GOAL_HOURS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import StudentsList from './students-list';


function InviteButton({
  teacherId,
  schoolName,
}: {
  teacherId: string;
  schoolName?: string;
}) {
  const { toast } = useToast();

  const handleInvite = () => {
    toast({
        title: 'Ve a la sección "Alumnos"',
        description:
          'Para invitar alumnos, crea una clase y copia el enlace de invitación desde la sección "Alumnos".',
      });
  };

  return (
    <Button onClick={handleInvite} className="w-full">
      <Copy className="mr-2 h-4 w-4" />
      Invitar Alumnos
    </Button>
  );
}

type Activity = Project & { studentName: string };

function LeftSidebarNav() {
    const router = useRouter();
    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/login');
    };

    return (
        <div className="flex h-full max-h-screen flex-col gap-2">
            <div className="flex h-14 items-center border-b px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-semibold">
                    <div className="bg-primary text-primary-foreground rounded-lg p-2">
                        <Users className="h-5 w-5" />
                    </div>
                    <span className="">HourVest</span>
                </Link>
            </div>
            <div className="flex-1">
                <nav className="grid items-start px-2 text-sm font-medium lg:px-4">
                    <Link href="/" className="flex items-center gap-3 rounded-lg bg-muted px-3 py-2 text-primary transition-all hover:text-primary">
                        <Home className="h-4 w-4" />
                        Inicio
                    </Link>
                    <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                        <FolderKanban className="h-4 w-4" />
                        Proyectos
                    </Link>
                    <Link href="/teacher/students" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                        <Users className="h-4 w-4" />
                        Alumnos
                    </Link>
                    <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                        <Building className="h-4 w-4" />
                        Colegio
                    </Link>
                </nav>
            </div>
            <div className="mt-auto p-4">
                <Button size="sm" variant="ghost" className="w-full justify-start text-muted-foreground" onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Cerrar Sesión
                </Button>
            </div>
        </div>
    );
}

export default function TeacherDashboard() {
  const { userProfile } = useAuth();
  const [students, setStudents] = useState<
    (UserProfile & { totalHours: number })[]
  >([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    if (userProfile && userProfile.role === 'Profesor') {
      const unsubscribe = onStudentsUpdate(
        userProfile.id,
        async (studentProfiles) => {
          setLoading(true);
          setError(null);
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

          const allProjects = await Promise.all(
            studentProfiles.map(async (student) => {
              const studentProjects = await getProjectsForStudent(student.id);
              return studentProjects.map((p) => ({
                ...p,
                studentName: student.name,
              }));
            })
          );

          const flattenedProjects = allProjects.flat();
          flattenedProjects.sort(
            (a, b) =>
              new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
          );
          setActivities(flattenedProjects.slice(0, 5)); 

          setLoading(false);
        },
        (err) => {
            setError('No se pudieron cargar los datos de los alumnos. Es posible que no tengas permisos para verlos. Revisa las reglas de seguridad de Firestore.');
            setLoading(false);
            toast({
                variant: 'destructive',
                title: 'Error de permisos',
                description: 'No se pudieron cargar los datos de los alumnos. Contacta con el administrador.'
            })
        }
      );
      return () => unsubscribe();
    } else if (userProfile) {
      setLoading(false);
    }
  }, [userProfile, toast]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const studentsCompleted = students.filter(
      (s) => s.totalHours >= GOAL_HOURS
    ).length;
    const totalHours = students.reduce((acc, s) => acc + s.totalHours, 0);
    const averageProgress =
      totalStudents > 0
        ? (totalHours / (totalStudents * GOAL_HOURS)) * 100
        : 0;

    return {
      totalStudents,
      studentsCompleted,
      averageProgress: Math.min(averageProgress, 100),
    };
  }, [students]);

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[220px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-muted/40 md:block">
        <LeftSidebarNav />
      </div>
      <div className="flex flex-col">
        <header className="flex h-14 items-center gap-4 border-b bg-muted/40 px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col">
              <LeftSidebarNav />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
            <form>
              <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar alumnos..."
                  className="w-full appearance-none bg-background pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <Avatar className="h-9 w-9">
              <AvatarImage src={userProfile ? `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.name}`: ''} />
              <AvatarFallback>{userProfile?.name.charAt(0)}</AvatarFallback>
          </Avatar>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-lg font-semibold md:text-2xl">Inicio</h1>
                {userProfile && (
                    <div className="md:hidden">
                         <InviteButton teacherId={userProfile.id} schoolName={userProfile.school} />
                    </div>
                )}
            </div>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Total de Alumnos</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Alumnos vinculados a tu cuenta</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Progreso Medio</CardTitle>
                  <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : `${stats.averageProgress.toFixed(0)}%`}</div>
                  <p className="text-xs text-muted-foreground">del total de horas CAS completado</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium">Alumnos Completados</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.studentsCompleted}</div>
                  <p className="text-xs text-muted-foreground">han alcanzado la meta de horas</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <div className="xl:col-span-2">
                    <Card>
                        <CardHeader>
                            <CardTitle>Actividades Publicadas Recientemente</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                <TableRow>
                                    <TableHead>Alumno</TableHead>
                                    <TableHead>Actividad</TableHead>
                                    <TableHead className="text-right">Categoría</TableHead>
                                </TableRow>
                                </TableHeader>
                                <TableBody>
                                {loading ? (
                                    <TableRow><TableCell colSpan={3} className="text-center">Cargando...</TableCell></TableRow>
                                ) : error ? (
                                    <TableRow><TableCell colSpan={3} className="text-center text-destructive">{error}</TableCell></TableRow>
                                ) : activities.length > 0 ? (
                                    activities.map(activity => (
                                    <TableRow key={activity.id}>
                                        <TableCell>
                                        <div className="font-medium">{activity.studentName}</div>
                                        <div className="hidden text-sm text-muted-foreground md:inline">
                                            {activity.startDate ? new Date(activity.startDate).toLocaleDateString() : ''}
                                        </div>
                                        </TableCell>
                                        <TableCell>{activity.name}</TableCell>
                                        <TableCell className="text-right capitalize">{activity.category}</TableCell>
                                    </TableRow>
                                    ))
                                ) : (
                                    <TableRow><TableCell colSpan={3} className="text-center">Por ahora, aquí no hay nada :(</TableCell></TableRow>
                                )}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                </div>

                <div className="hidden xl:block">
                     <StudentsList userProfile={userProfile} students={students} loading={loading} />
                     {userProfile && (
                        <div className="mt-4">
                           <InviteButton teacherId={userProfile.id} schoolName={userProfile.school} />
                        </div>
                    )}
                </div>
            </div>

            <div className="block xl:hidden">
                <StudentsList userProfile={userProfile} students={students} loading={loading} />
            </div>

        </main>
      </div>
    </div>
  );
}
