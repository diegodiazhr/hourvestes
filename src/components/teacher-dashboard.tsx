
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
  MoreVertical,
  PlusCircle,
  Search,
  Filter,
  Copy,
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
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

function InviteButton({ teacherId, schoolName }: { teacherId: string, schoolName?: string }) {
    const { toast } = useToast();

    const handleInvite = () => {
        const baseUrl = window.location.origin;
        const inviteLink = `${baseUrl}/register?ref=${teacherId}${schoolName ? `&school=${encodeURIComponent(schoolName)}` : ''}`;
        
        navigator.clipboard.writeText(inviteLink).then(() => {
            toast({
                title: "¡Enlace Copiado!",
                description: "El enlace de invitación ha sido copiado a tu portapapeles.",
            });
        }).catch(() => {
            toast({
                variant: 'destructive',
                title: "Error",
                description: "No se pudo copiar el enlace.",
            });
        });
    };

    return (
        <Button onClick={handleInvite} size="icon" variant="ghost" className="h-8 w-8">
            <PlusCircle className="h-5 w-5" />
        </Button>
    );
}

type Activity = Project & { studentName: string };

export default function TeacherDashboard() {
  const { userProfile } = useAuth();
  const router = useRouter();
  const [students, setStudents] = useState<(UserProfile & { totalHours: number })[]>([]);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userProfile && userProfile.role === 'Profesor') {
      const unsubscribe = onStudentsUpdate(userProfile.id, async (studentProfiles) => {
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

        // Fetch all projects for all students
        const allProjects = await Promise.all(
          studentProfiles.map(async (student) => {
            const studentProjects = await getProjectsForStudent(student.id);
            return studentProjects.map(p => ({...p, studentName: student.name}));
          })
        );
        
        const flattenedProjects = allProjects.flat();
        flattenedProjects.sort((a, b) => b.startDate.getTime() - a.startDate.getTime());
        setActivities(flattenedProjects.slice(0, 5)); // Get 5 most recent

        setLoading(false);
      });
      return () => unsubscribe();
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

  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {/* Left Sidebar */}
      <nav className="hidden md:flex flex-col w-64 bg-card border-r p-4">
        <div className="flex items-center gap-2 mb-8">
            <HourvestLogo />
            <h1 className="text-xl font-bold">HOURVEST</h1>
        </div>

        <div className="flex-1 space-y-4">
            <div className="space-y-1">
                <p className="text-xs font-semibold text-muted-foreground px-3">OVERVIEW</p>
                <Link href="/" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md bg-primary/10 text-primary">
                    <Home className="h-5 w-5" />
                    Inicio
                </Link>
                <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted">
                    <Users className="h-5 w-5" />
                    Mis Alumnos
                </Link>
                <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted">
                    <User className="h-5 w-5" />
                    Perfil
                </Link>
                <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted">
                    <Building className="h-5 w-5" />
                    Colegio
                </Link>
            </div>
        </div>

        <div className="space-y-1">
             <p className="text-xs font-semibold text-muted-foreground px-3">SETTINGS</p>
             <Link href="#" className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-muted-foreground hover:bg-muted">
                <Settings className="h-5 w-5" />
                Settings
            </Link>
            <button onClick={handleSignOut} className="flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md text-red-500 hover:bg-red-500/10 w-full">
                <LogOut className="h-5 w-5" />
                Logout
            </button>
        </div>

      </nav>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-auto">
        <header className="flex items-center justify-between mb-8">
            <div className="relative w-full max-w-md">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input placeholder="Buscar a un alumno..." className="pl-10" />
            </div>
            <Button variant="ghost" size="icon">
                <Filter className="h-5 w-5" />
            </Button>
        </header>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
             <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Total de Alumnos</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{loading ? '...' : stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Alumnos vinculados a tu cuenta</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Progreso Medio</CardTitle>
                    <BarChart2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{loading ? '...' : `${stats.averageProgress.toFixed(0)}%`}</div>
                    <p className="text-xs text-muted-foreground">del total de horas CAS completado</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <CardTitle className="text-sm font-medium">Alumnos Completados</CardTitle>
                    <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                    <div className="text-2xl font-bold">{loading ? '...' : stats.studentsCompleted}</div>
                    <p className="text-xs text-muted-foreground">han alcanzado la meta de horas</p>
                </CardContent>
            </Card>
        </div>

        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-semibold">Actividades Publicadas Recientemente</h2>
                <Link href="#" className="text-sm font-medium text-primary hover:underline">See All</Link>
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
                            activities.map(activity => (
                                <TableRow key={activity.id}>
                                    <TableCell>
                                        <div className="flex items-center gap-3">
                                            <Avatar className="h-9 w-9">
                                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activity.studentName}`} />
                                                <AvatarFallback>{activity.studentName.charAt(0)}</AvatarFallback>
                                            </Avatar>
                                            <div>
                                                <div className="font-medium">{activity.studentName}</div>
                                                <div className="text-xs text-muted-foreground">{activity.startDate.toLocaleDateString()}</div>
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>{activity.name}</TableCell>
                                    <TableCell>
                                        <Badge variant="secondary">{activity.category.toUpperCase()}</Badge>
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
      <aside className="hidden lg:flex flex-col w-80 bg-card border-l p-6">
        <div className="flex justify-between items-center mb-6">
            <h2 className="text-lg font-semibold">Your Profile</h2>
            <Button variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5"/>
            </Button>
        </div>

        <div className="flex flex-col items-center text-center mb-6">
            <Avatar className="h-20 w-20 mb-4">
                 <AvatarImage src={userProfile ? `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.name}` : ''} />
                <AvatarFallback>{userProfile?.name.charAt(0)}</AvatarFallback>
            </Avatar>
            <h3 className="font-semibold text-lg">Hola, {userProfile?.name.split(' ')[0]}</h3>
        </div>
        
        <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold">Mis Alumnos</h2>
            {userProfile && <InviteButton teacherId={userProfile.id} schoolName={userProfile.school} />}
        </div>
        <div className="flex-1 space-y-3 overflow-auto">
            {loading ? (
                Array.from({length: 5}).map((_, i) => <div key={i} className="h-10 bg-muted rounded-md animate-pulse" />)
            ) : students.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground pt-8">
                    <p>Por ahora, aquí no hay nada :(</p>
                </div>
            ) : (
                students.map(student => (
                    <div key={student.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                             <Avatar className="h-9 w-9">
                                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} />
                                <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                            </Avatar>
                            <div>
                                <p className="text-sm font-medium">{student.name}</p>
                                <p className="text-xs text-muted-foreground">{student.school}</p>
                            </div>
                        </div>
                        <Link href={`/teacher/student/${student.id}`}>
                            <Button size="sm" variant="outline" className="h-8 px-3 bg-primary/10 border-primary/20 text-primary hover:bg-primary/20">Ver</Button>
                        </Link>
                    </div>
                ))
            )}
        </div>
        <Button className="w-full mt-4 bg-primary/10 text-primary hover:bg-primary/20">Ver todos</Button>
      </aside>
    </div>
  );
}

