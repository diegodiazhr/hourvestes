'use client';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Home,
  Building,
  LogOut,
  Search,
  FolderKanban,
  Menu,
  Bell,
  Activity,
  Clock,
  Paintbrush,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { onStudentsUpdate, getProjectsForStudent, getClassesForTeacher } from '@/lib/data';
import type { UserProfile, Project, Class } from '@/lib/types';
import { GOAL_HOURS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import StudentsList from './students-list';
import { TimeSummaryChart } from './time-summary-chart';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RadialBarChart, RadialBar, PolarAngleAxis } from 'recharts';
import { CasCategoryIcon } from './cas-category-icon';

type ActivityItem = Project & { studentName: string };


function LeftSidebarNav() {
    const router = useRouter();
    const handleSignOut = async () => {
        await auth.signOut();
        router.push('/login');
    };

    return (
        <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-14 items-center px-4 lg:h-[60px] lg:px-6">
                <Link href="/" className="flex items-center gap-2 font-bold text-xl text-primary">
                     <div className="bg-primary text-primary-foreground rounded-lg p-2">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>
                    </div>
                    <span>HOURVEST</span>
                </Link>
            </div>
            <div className="flex-1 mt-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    <Link href="/" className="flex items-center gap-3 rounded-lg bg-primary px-3 py-2 text-primary-foreground transition-all">
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
                    <Link href="/teacher/school" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground transition-all hover:text-primary">
                        <Building className="h-4 w-4" />
                        Colegio
                    </Link>
                     <Link href="#" className="flex items-center gap-3 rounded-lg px-3 py-2 text-muted-foreground/50 transition-all cursor-not-allowed">
                        <Clock className="h-4 w-4" />
                        Pronto más opciones...
                    </Link>
                </nav>
            </div>
        </div>
    );
}

export default function TeacherDashboard() {
  const { userProfile, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<(UserProfile & { totalHours: number, classId?: string, className?: string })[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (userProfile && userProfile.role === 'Profesor') {
      const fetchInitialData = async () => {
        setLoadingData(true);
        setError(null);
        try {
            const fetchedClasses = await getClassesForTeacher(userProfile.id);
            setClasses(fetchedClasses);

            const studentProfiles = fetchedClasses.flatMap(c => c.students.map(s => ({...s, className: c.name})));
            
            const studentsWithHours = await Promise.all(
              studentProfiles.map(async (student) => {
                const projects = await getProjectsForStudent(student.id);
                const totalMilliseconds = projects.reduce((acc, project) => {
                  const projectTime =
                    project.timeEntries?.reduce((timeAcc, entry) => {
                      if (entry.endTime) {
                        return timeAcc + (new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime());
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
                return studentProjects.map((p) => ({ ...p, studentName: student.name }));
              })
            );
            const flattenedProjects = allProjects.flat().sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime());
            setActivities(flattenedProjects); 

        } catch (e: any) {
            setError('Error al cargar los datos del panel.');
            console.error(e);
             toast({
                variant: 'destructive',
                title: 'Error de carga',
                description: 'No se pudieron cargar los datos de los alumnos y clases.'
            })
        } finally {
            setLoadingData(false);
        }
      };
      
      fetchInitialData();

    } else if (!authLoading && userProfile?.role !== 'Profesor') {
        router.push('/');
    }
  }, [userProfile, authLoading, router, toast]);

  const stats = useMemo(() => {
    const totalStudents = students.length;
    const studentsCompleted = students.filter(
      (s) => s.totalHours >= GOAL_HOURS
    ).length;
    return {
      totalStudents,
      studentsCompleted,
      totalClasses: classes.length,
    };
  }, [students, classes]);
  
  const handleSignOut = async () => {
    await auth.signOut();
    router.push('/login');
  };

  const loading = authLoading || loadingData;

  const averageProgress = useMemo(() => {
    if (students.length === 0) return 0;
    const totalPossibleHours = students.length * GOAL_HOURS;
    const totalActualHours = students.reduce((sum, s) => sum + s.totalHours, 0);
    return Math.min((totalActualHours / totalPossibleHours) * 100, 100);
  }, [students]);
  
  const radialChartData = [{ name: 'progress', value: averageProgress, fill: 'hsl(var(--primary))' }];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-card md:block">
        <LeftSidebarNav />
      </div>
      <div className="flex flex-col bg-muted/40">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-card">
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
                  className="w-full appearance-none bg-muted/40 pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
            </form>
          </div>
          <Button variant="ghost" size="icon">
            <Bell className="h-5 w-5"/>
          </Button>
          <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <Avatar className="h-9 w-9">
                        <AvatarImage src={userProfile ? `https://api.dicebear.com/7.x/initials/svg?seed=${userProfile.name}`: ''} />
                        <AvatarFallback>{userProfile?.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">{userProfile?.name}</p>
                    <p className="text-xs leading-none text-muted-foreground">
                        {userProfile?.email}
                    </p>
                    </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Cerrar Sesión</span>
                </DropdownMenuItem>
                </DropdownMenuContent>
          </DropdownMenu>
        </header>
        <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
            <div className="flex items-center">
                <h1 className="text-2xl font-semibold">Hola {userProfile?.name.split(' ')[0]} 👋</h1>
            </div>
            <p className="text-sm text-muted-foreground -mt-4">Inicio</p>

            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Total de Alumnos</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.totalStudents}</div>
                  <p className="text-xs text-muted-foreground">Alumnos vinculados a tu Institución Educativa</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Clases Gestionadas</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.totalClasses}</div>
                  <p className="text-xs text-muted-foreground">Cantidad de clases creadas</p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm font-medium text-muted-foreground">Alumnos Completados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{loading ? "..." : stats.studentsCompleted}</div>
                  <p className="text-xs text-muted-foreground">han alcanzado la meta de horas</p>
                </CardContent>
              </Card>
            </div>
            
            <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <Card>
                    <CardHeader>
                        <CardTitle className='text-base'>Horas dedicadas</CardTitle>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <TimeSummaryChart projects={activities} />
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className='text-base'>Progreso Medio</CardTitle>
                        <Select defaultValue={classes.length > 0 ? classes[0].id : 'all'}>
                            <SelectTrigger className="w-[120px] h-8 text-xs">
                                <SelectValue placeholder="Clase" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">Todas</SelectItem>
                                {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                            </SelectContent>
                        </Select>
                    </CardHeader>
                    <CardContent className="flex items-center justify-center">
                        <div className="relative h-40 w-40">
                             <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart 
                                    innerRadius="75%" 
                                    outerRadius="100%" 
                                    data={radialChartData} 
                                    startAngle={90} 
                                    endAngle={-270}
                                >
                                    <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                    <RadialBar background dataKey="value" cornerRadius={10} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                <span className="text-3xl font-bold text-foreground">{averageProgress.toFixed(0)}%</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <div className="hidden xl:block">
                     <StudentsList students={students} loading={loading} />
                </div>
            </div>
            
             <Card>
                <CardHeader className='flex-row items-center justify-between'>
                    <CardTitle>Actividades Publicadas Recientemente</CardTitle>
                    <Button variant="ghost" size="icon"><Search className="h-5 w-5"/></Button>
                </CardHeader>
                <CardContent className='space-y-4'>
                    {loading ? (
                        <p className="text-center text-muted-foreground">Cargando actividades...</p>
                    ) : activities.length > 0 ? (
                        activities.slice(0, 5).map(activity => (
                        <Card key={activity.id} className="p-3 shadow-none">
                           <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 text-sm">
                                <div className="bg-green-100 dark:bg-green-900/50 p-2 rounded-md">
                                    <Paintbrush className="h-5 w-5 text-green-600 dark:text-green-400" />
                                </div>
                                <p className="font-semibold text-primary">{activity.name}</p>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span>20:30h</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground capitalize">
                                    <CasCategoryIcon category={activity.category} className="h-4 w-4" />
                                    <span>{activity.category}</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Avatar className="h-6 w-6">
                                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${activity.studentName}`} />
                                        <AvatarFallback>{activity.studentName.charAt(0)}</AvatarFallback>
                                    </Avatar>
                                    <span>{activity.studentName.split(' ')[0]}</span>
                                </div>
                           </div>
                        </Card>
                        ))
                    ) : (
                        <p className="text-center text-muted-foreground py-8">No hay actividades publicadas recientemente.</p>
                    )}
                </CardContent>
            </Card>
        </main>
      </div>
    </div>
  );
}
