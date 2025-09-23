
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
  PlusCircle,
  Search,
  Filter,
  Copy,
  PanelLeftOpen,
  PanelRightOpen,
  PanelLeftClose,
  PanelRightClose
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { onStudentsUpdate, getProjectsForStudent } from '@/lib/data';
import type { UserProfile, Project } from '@/lib/types';
import { GOAL_HOURS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
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

function HourvestLogo() {
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-primary"
    >
      <path
        d="M16 0L29.8564 8V24L16 32L2.14359 24V8L16 0Z"
        fill="currentColor"
      />
      <path
        d="M23 12L16 16L9 12"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 26V16"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function InviteButton({
  teacherId,
  schoolName,
}: {
  teacherId: string;
  schoolName?: string;
}) {
  const { toast } = useToast();

  const handleInvite = () => {
    const baseUrl = window.location.origin;
    const inviteLink = `${baseUrl}/register?ref=${teacherId}${
      schoolName ? `&school=${encodeURIComponent(schoolName)}` : ''
    }`;

    navigator.clipboard
      .writeText(inviteLink)
      .then(() => {
        toast({
          title: '¡Enlace Copiado!',
          description:
            'El enlace de invitación ha sido copiado a tu portapapeles.',
        });
      })
      .catch(() => {
        toast({
          variant: 'destructive',
          title: 'Error',
          description: 'No se pudo copiar el enlace.',
        });
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

export default function TeacherDashboard() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<
    (UserProfile & { totalHours: number })[]
  >([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);

  useEffect(() => {
    if (userProfile && userProfile.role === 'Profesor') {
      const unsubscribe = onStudentsUpdate(
        userProfile.id,
        async (studentProfiles) => {
          setLoading(true);
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
        }
      );
      return () => unsubscribe();
    } else if (userProfile) {
      setLoading(false);
    }
  }, [userProfile]);

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

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Sidebar */}
      <aside
        className={`bg-card text-card-foreground border-r transition-all duration-300 ${
          isLeftSidebarOpen ? 'w-64' : 'w-0'
        } overflow-hidden`}
      >
        <div className="flex h-full flex-col">
          <div className="flex h-16 items-center gap-2 border-b px-4">
            <HourvestLogo />
            <h1 className="text-xl font-bold">HOURVEST</h1>
          </div>
          <nav className="flex-1 space-y-2 p-4">
            <p className="px-2 text-xs font-semibold text-muted-foreground">
              OVERVIEW
            </p>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md bg-primary/10 px-2 py-1.5 text-sm font-medium text-primary"
            >
              <Home />
              <span>Inicio</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <Users />
              <span>Mis Alumnos</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <User />
              <span>Perfil</span>
            </Link>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <Building />
              <span>Colegio</span>
            </Link>
          </nav>
          <div className="mt-auto space-y-2 p-4">
            <p className="px-2 text-xs font-semibold text-muted-foreground">
              SETTINGS
            </p>
            <Link
              href="#"
              className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-muted-foreground hover:bg-muted"
            >
              <Settings />
              <span>Settings</span>
            </Link>
            <button
              onClick={handleSignOut}
              className="flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-sm font-medium text-red-500 hover:bg-red-500/10"
            >
              <LogOut />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2">
            {!isLeftSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsLeftSidebarOpen(true)}>
                <PanelLeftOpen />
              </Button>
            )}
             {isLeftSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsLeftSidebarOpen(false)}>
                <PanelLeftClose />
              </Button>
            )}
            <div className="relative w-full max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input placeholder="Buscar a un alumno..." className="pl-10" />
            </div>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon">
              <Filter className="h-5 w-5" />
            </Button>
             {!isRightSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsRightSidebarOpen(true)}>
                <PanelRightOpen />
              </Button>
            )}
             {isRightSidebarOpen && (
              <Button variant="ghost" size="icon" onClick={() => setIsRightSidebarOpen(false)}>
                <PanelRightClose />
              </Button>
            )}
          </div>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Total de Alumnos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.totalStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                Alumnos vinculados a tu cuenta
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Progreso Medio
              </CardTitle>
              <BarChart2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : `${stats.averageProgress.toFixed(0)}%`}
              </div>
              <p className="text-xs text-muted-foreground">
                del total de horas CAS completado
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                Alumnos Completados
              </CardTitle>
              <CheckCircle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {loading ? '...' : stats.studentsCompleted}
              </div>
              <p className="text-xs text-muted-foreground">
                han alcanzado la meta de horas
              </p>
            </CardContent>
          </Card>
        </div>

        <div>
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">
              Actividades Publicadas Recientemente
            </h2>
            <Link
              href="#"
              className="text-sm font-medium text-primary hover:underline"
            >
              Ver todo
            </Link>
          </div>
          <Card>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>NOMBRE DEL ALUMNO</TableHead>
                  <TableHead>NOMBRE DE LA ACTIVIDAD</TableHead>
                  <TableHead>TIPO DE ACT.</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Cargando actividades...
                    </TableCell>
                  </TableRow>
                ) : activities.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={3} className="h-24 text-center">
                      Por ahora, aquí no hay nada :(
                    </TableCell>
                  </TableRow>
                ) : (
                  activities.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <Avatar className="h-9 w-9">
                            <AvatarImage
                              src={`https://api.dicebear.com/7.x/initials/svg?seed=${activity.studentName}`}
                            />
                            <AvatarFallback>
                              {activity.studentName.charAt(0)}
                            </AvatarFallback>
                          </Avatar>
                          <div>
                            <div className="font-medium">
                              {activity.studentName}
                            </div>
                            <div className="text-xs text-muted-foreground">
                                {new Date(activity.startDate).toLocaleDateString()}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{activity.name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary">
                          {activity.category.toUpperCase()}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </Card>
        </div>
      </main>

      {/* Right Sidebar */}
      <aside
        className={`bg-card text-card-foreground border-l transition-all duration-300 ${
          isRightSidebarOpen ? 'w-80' : 'w-0'
        } overflow-hidden`}
      >
        <div className="h-full flex flex-col">
          <div className="p-4 text-center border-b">
            <Avatar className="h-20 w-20 mx-auto mb-2">
              <AvatarImage
                src={
                  userProfile
                    ? `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.name}`
                    : ''
                }
              />
              <AvatarFallback>{userProfile?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">
              Hola, {userProfile?.name.split(' ')[0]}
            </h3>
          </div>
          <div className="p-4 flex-1">
            <h2 className="text-lg font-semibold mb-4">Mis Alumnos</h2>
            <div className="flex-1 space-y-3 overflow-auto">
              {loading ? (
                <p>Cargando alumnos...</p>
              ) : students.length > 0 ? (
                students.map((student) => (
                  <div
                    key={student.id}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <Avatar className="h-9 w-9">
                        <AvatarImage
                          src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`}
                        />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-medium">{student.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {student.school}
                        </p>
                      </div>
                    </div>
                    <Link href={`/teacher/student/${student.id}`}>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 px-3 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20"
                      >
                        Ver
                      </Button>
                    </Link>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground text-center pt-8">
                  Aún no tienes alumnos vinculados.
                </p>
              )}
            </div>
          </div>
          <div className="p-4 border-t">
            {userProfile && (
              <InviteButton
                teacherId={userProfile.id}
                schoolName={userProfile.school}
              />
            )}
          </div>
        </div>
      </aside>
    </div>
  );
}
