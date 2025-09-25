
'use client';
import { useMemo, useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Users,
  Home,
  Building,
  LogOut,
  Search,
  Clock,
  Menu,
  Bell,
  Target,
} from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';
import { getProjectsForStudent, getClassesForTeacher } from '@/lib/data';
import type { UserProfile, Project, Class } from '@/lib/types';
import { GOAL_HOURS } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { auth } from '@/lib/firebase';
import { useRouter } from 'next/navigation';
import { useToast } from '@/hooks/use-toast';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import StudentsList from './students-list';
import { TimeSummaryChart } from './time-summary-chart';
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
import { RadialBarChart, RadialBar, PolarAngleAxis, ResponsiveContainer } from 'recharts';
import { CasCategoryIcon } from './cas-category-icon';
import { Skeleton } from './ui/skeleton';

type ActivityItem = Project & { studentName: string };

function formatProjectDuration(project: Project) {
    const totalMilliseconds = project.timeEntries?.reduce((acc, entry) => {
        if (entry.endTime) {
            const start = new Date(entry.startTime).getTime();
            const end = new Date(entry.endTime).getTime();
            return acc + (end - start);
        }
        return acc;
    }, 0) || 0;

    const hours = Math.floor(totalMilliseconds / (1000 * 60 * 60));
    const minutes = Math.round((totalMilliseconds % (1000 * 60 * 60)) / (1000 * 60));
    
    if (hours > 0) return `${hours}h ${minutes > 0 ? `${minutes}m` : ''}`.trim();
    if (minutes > 0) return `${minutes}m`;
    return `0m`;
}


function LeftSidebarNav() {
    const router = useRouter();

    const navItems = [
        { href: '/', icon: Home, label: 'Inicio' },
        { href: '/teacher/students', icon: Users, label: 'Alumnos' },
        { href: '/teacher/school', icon: Building, label: 'Colegio' },
    ];

    return (
        <div className="flex h-full max-h-screen flex-col">
            <div className="flex h-14 items-center px-6 lg:h-[60px]">
                 <Link href="/" className="flex items-center gap-2 text-xl font-headline text-sidebar-foreground hover:opacity-80 transition-opacity">
                    <svg fill="hsl(var(--sidebar-foreground))" height="24px" width="24px" version="1.1" id="Layer_1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M29.5,8.5L16,1.5L2.5,8.5l13.5,7L29.5,8.5z M2,11.3l13.5,6.9v10.3L2,21.6V11.3z M16.5,28.5v-10.3L30,11.3v10.3L16.5,28.5z"/></svg>
                    <span className="font-bold">HourVest</span>
                </Link>
            </div>
            <div className="flex-1 mt-4">
                <nav className="grid items-start px-4 text-sm font-medium">
                    {navItems.map(item => (
                         <Link 
                            key={item.label}
                            href={item.href} 
                            className={`flex items-center gap-3 rounded-lg px-3 py-2 transition-all ${item.href === '/' ? 'bg-primary text-primary-foreground' : 'text-sidebar-foreground/70 hover:bg-primary/20 hover:text-sidebar-foreground'}`}
                        >
                            <item.icon className="h-4 w-4" />
                            {item.label}
                        </Link>
                    ))}
                </nav>
            </div>
        </div>
    );
}

function DashboardSkeleton() {
    return (
        <div className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
             <div className="flex items-center">
                <Skeleton className="h-8 w-48" />
            </div>
            <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
              <Skeleton className="h-28" />
            </div>
             <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                <div className="xl:col-span-2">
                  <Skeleton className="h-64" />
                </div>
                <div className="grid gap-4">
                  <Skeleton className="h-40" />
                  <Skeleton className="h-40" />
                </div>
            </div>
            <Skeleton className="h-80" />
        </div>
    )
}

export default function TeacherDashboard() {
  const { userProfile, loading: authLoading } = useAuth();
  const [students, setStudents] = useState<(UserProfile & { totalHours: number, classId?: string, className?: string })[]>([]);
  const [classes, setClasses] = useState<Class[]>([]);
  const [activities, setActivities] = useState<ActivityItem[]>([]);
  const [loadingData, setLoadingData] = useState(true);
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (userProfile && userProfile.role === 'Profesor') {
      const fetchInitialData = async () => {
        setLoadingData(true);
        try {
            const fetchedClasses = await getClassesForTeacher(userProfile.id);
            setClasses(fetchedClasses);

            const allStudentsFromClasses = fetchedClasses.flatMap(c => 
                c.students.map(s => ({...s, className: c.name, classId: c.id}))
            );
            
            if (allStudentsFromClasses.length === 0) {
              setStudents([]);
              setActivities([]);
              setLoadingData(false);
              return;
            }

            const projectsPromises = allStudentsFromClasses.map(student => getProjectsForStudent(student.id));
            const allProjectsPerStudent = await Promise.all(projectsPromises);
            
            const allActivities: ActivityItem[] = [];
            const studentsWithHours = allStudentsFromClasses.map((student, index) => {
                const studentProjects = allProjectsPerStudent[index];
                
                studentProjects.forEach(p => {
                    allActivities.push({ ...p, studentName: student.name });
                });

                const totalMilliseconds = studentProjects.reduce((acc, project) => {
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
            });

            setStudents(studentsWithHours);
            setActivities(allActivities.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime())); 

        } catch (e: any) {
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
    if (totalPossibleHours === 0) return 0;
    return Math.min((totalActualHours / totalPossibleHours) * 100, 100);
  }, [students]);
  
  const radialChartData = [{ name: 'progress', value: averageProgress, fill: 'hsl(var(--primary))' }];

  return (
    <div className="grid min-h-screen w-full md:grid-cols-[240px_1fr] lg:grid-cols-[280px_1fr]">
      <div className="hidden border-r bg-sidebar md:block">
        <LeftSidebarNav />
      </div>
      <div className="flex flex-col bg-muted/20">
        <header className="flex h-14 items-center gap-4 border-b bg-card px-4 lg:h-[60px] lg:px-6">
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="shrink-0 md:hidden">
                <Menu className="h-5 w-5" />
                <span className="sr-only">Toggle navigation menu</span>
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col p-0 bg-sidebar">
              <LeftSidebarNav />
            </SheetContent>
          </Sheet>
          <div className="w-full flex-1">
             <div className="relative">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  type="search"
                  placeholder="Buscar alumnos..."
                  className="w-full appearance-none bg-muted pl-8 shadow-none md:w-2/3 lg:w-1/3"
                />
              </div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full">
            <Bell className="h-5 w-5"/>
            <span className="sr-only">Notificaciones</span>
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

        {loading ? <DashboardSkeleton /> : (
            <main className="flex flex-1 flex-col gap-4 p-4 lg:gap-6 lg:p-6">
                <div>
                    <h1 className="text-2xl font-bold">Hola {userProfile?.name.split(' ')[0]} 👋</h1>
                    <p className="text-muted-foreground">Inicio</p>
                </div>

                <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-3">
                <Card>
                    <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Total de Alumnos</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-bold">{stats.totalStudents}</div>
                    <p className="text-xs text-muted-foreground">Alumnos vinculados a tu Institución Educativa</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Clases Gestionadas</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-bold">{stats.totalClasses}</div>
                    <p className="text-xs text-muted-foreground">Cantidad de clases creadas</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                    <CardTitle className="text-sm font-medium text-muted-foreground">Alumnos Completados</CardTitle>
                    </CardHeader>
                    <CardContent>
                    <div className="text-3xl font-bold">{stats.studentsCompleted}</div>
                    <p className="text-xs text-muted-foreground">han alcanzado la meta de horas</p>
                    </CardContent>
                </Card>
                </div>
                
                <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
                    <Card className="xl:col-span-2">
                        <CardHeader>
                            <CardTitle className='text-base'>Horas dedicadas</CardTitle>
                        </CardHeader>
                        <CardContent className="pl-2">
                            <TimeSummaryChart projects={activities} />
                        </CardContent>
                    </Card>
                    <div className="grid gap-4">
                        <Card>
                            <CardHeader className="flex flex-row items-center justify-between">
                                <CardTitle className='text-base'>Progreso Medio</CardTitle>
                                <Select defaultValue={classes.length > 0 ? 'all' : undefined}>
                                    <SelectTrigger className="w-[120px] h-8 text-xs">
                                        <SelectValue placeholder="Clase" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">Todas</SelectItem>
                                        {classes.map(c => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
                                    </SelectContent>
                                </Select>
                            </CardHeader>
                            <CardContent className="flex items-center justify-center -mt-4">
                                <div className="relative h-40 w-40">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <RadialBarChart 
                                            innerRadius="75%" 
                                            outerRadius="100%" 
                                            data={radialChartData} 
                                            startAngle={90} 
                                            endAngle={450}
                                        >
                                            <PolarAngleAxis type="number" domain={[0, 100]} angleAxisId={0} tick={false} />
                                            <RadialBar background={{fill: 'hsl(var(--muted))'}} dataKey="value" cornerRadius={10} />
                                        </RadialBarChart>
                                    </ResponsiveContainer>
                                    <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                                        <span className="text-3xl font-bold text-foreground">{averageProgress.toFixed(0)}%</span>
                                        <Target className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                        <StudentsList students={students} loading={loading} />
                    </div>
                </div>
                
                <Card>
                    <CardHeader className='flex-row items-center justify-between'>
                        <CardTitle>Actividades Publicadas Recientemente</CardTitle>
                        <Button variant="ghost" size="icon"><Search className="h-5 w-5 text-muted-foreground" /></Button>
                    </CardHeader>
                    <CardContent className='space-y-2'>
                        {loading ? (
                            <p className="text-center text-muted-foreground">Cargando actividades...</p>
                        ) : activities.length > 0 ? (
                            activities.slice(0, 4).map(activity => (
                            <Card key={activity.id} className="p-3 shadow-sm hover:shadow-md transition-shadow">
                            <Link href={`/teacher/student/${activity.userId}/project/${activity.id}`}>
                                <div className="grid grid-cols-[auto_1fr_auto_auto_auto] items-center gap-4 text-sm">
                                    <div className="bg-muted p-2 rounded-md">
                                        <CasCategoryIcon category={activity.category} className="h-5 w-5 text-muted-foreground" />
                                    </div>
                                    <p className="font-semibold text-primary">{activity.name}</p>
                                    <div className="flex items-center gap-2 text-muted-foreground">
                                        <Clock className="h-4 w-4" />
                                        <span>{formatProjectDuration(activity)}</span>
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
                            </Link>
                            </Card>
                            ))
                        ) : (
                            <p className="text-center text-muted-foreground py-8">No hay actividades añadidas recientemente.</p>
                        )}
                    </CardContent>
                </Card>
            </main>
        )}
      </div>
    </div>
  );
}

    