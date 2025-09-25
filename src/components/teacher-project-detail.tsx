
'use client';

import { getProject, getUserProfile } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Project, TimeEntry, UserProfile } from '@/lib/types';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CasCategoryIcon } from '@/components/cas-category-icon';
import { CheckCircle2, Timer, Paperclip, BookOpen, Clock, ListCollapse } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';
import { DashboardSkeleton } from './dashboard-skeleton';
import Image from 'next/image';

function formatDuration(milliseconds: number) {
    if (milliseconds < 0) milliseconds = 0;
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours.toString().padStart(2, '0')}:${minutes
      .toString()
      .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

export function TeacherProjectDetail() {
  const params = useParams();
  const projectId = params.projectId as string;
  const studentId = params.id as string;

  const [project, setProject] = useState<Project | null>(null);
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId && studentId) {
      const fetchProject = async () => {
        setLoading(true);
        setError(null);
        try {
          const [projectData, studentData] = await Promise.all([
            getProject(projectId),
            getUserProfile(studentId)
          ]);
          
          if (projectData && studentData && projectData.userId === studentData.id) {
            setProject(projectData);
            setStudent(studentData);
          } else {
            setError('No se pudo encontrar el proyecto o el alumno solicitado.');
          }
        } catch (e: any) {
          console.error(e);
          setError('Ocurrió un error al cargar el proyecto.');
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [projectId, studentId]);

  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error al cargar el proyecto</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    )
  }

  if (!project || !student) {
    return notFound();
  }

  const totalTime = project.timeEntries?.reduce((acc, entry) => {
    if (entry.endTime) {
      const start = new Date(entry.startTime).getTime();
      const end = new Date(entry.endTime).getTime();
      return acc + (end - start);
    }
    return acc;
  }, 0) || 0;

  const sortedEntries = [...(project.timeEntries || [])].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <p className="text-muted-foreground text-sm font-semibold">Proyecto de {student.name}</p>
            <h1 className="text-4xl font-bold font-headline text-foreground">
                {project.name}
            </h1>
            <p className="text-muted-foreground capitalize">
            {project.startDate ? format(project.startDate, 'd MMMM, yyyy', { locale: es }) : ''} -{' '}
            {project.endDate
                ? format(project.endDate, 'd MMMM, yyyy', { locale: es })
                : 'Actual'}
            </p>
        </div>
        <div className="flex gap-4 items-center">
            <Badge
                variant="secondary"
                className="flex items-center gap-2 text-base px-4 py-2 shrink-0 capitalize"
            >
                <CasCategoryIcon
                category={project.category}
                className="h-5 w-5"
                />
                {project.category}
            </Badge>
        </div>
      </div>

      <Separator />

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-8">
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Descripción del Proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base text-foreground/80 whitespace-pre-wrap">{project.description || 'No hay descripción todavía.'}</p>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="font-headline">Metas y Resultados de Aprendizaje</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div>
                        <h3 className="font-semibold mb-2 text-foreground">Metas Personales</h3>
                        <p className="text-base text-foreground/80 whitespace-pre-wrap">{project.personalGoals || 'No se han definido metas personales.'}</p>
                    </div>
                    <Separator />
                    <div>
                        <h3 className="font-semibold mb-3 text-foreground">Resultados de Aprendizaje Alcanzados</h3>
                        <ul className="space-y-3">
                        {project.learningOutcomes.map((outcome, i) => (
                            <li key={i} className="flex items-start gap-3">
                            <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                            <span className="text-foreground/80">{outcome}</span>
                            </li>
                        ))}
                        </ul>
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="font-headline flex items-center gap-2"><BookOpen />Reflexiones</CardTitle>
                </CardHeader>
                <CardContent>
                    <p className="text-base text-foreground/80 whitespace-pre-wrap min-h-[150px]">{project.reflections || 'El alumno aún no ha escrito ninguna reflexión.'}</p>
                </CardContent>
            </Card>
        </div>

        <div className="space-y-8 sticky top-24">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Timer />Registro de Tiempo</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="text-center bg-muted rounded-lg p-4">
                        <p className="text-sm text-muted-foreground">Tiempo Total Registrado</p>
                        <div className="text-4xl font-bold font-mono tracking-tighter flex items-center justify-center gap-2">
                           {formatDuration(totalTime)}
                        </div>
                    </div>
                     <div className="space-y-3">
                        <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground"><ListCollapse /> Historial de Actividad</h4>
                        {sortedEntries.length > 0 ? (
                            <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                                {sortedEntries.map(entry => {
                                    const durationMs = entry.endTime ? new Date(entry.endTime).getTime() - new Date(entry.startTime).getTime() : 0;
                                    return (
                                        <div key={entry.startTime} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                                            <div>
                                                <p className="font-medium">{format(new Date(entry.startTime), "d MMM, yyyy", { locale: es })}</p>
                                                <p className="text-xs text-muted-foreground">{entry.manual ? 'Entrada manual' : `De ${format(new Date(entry.startTime), 'HH:mm')} a ${format(new Date(entry.endTime!), 'HH:mm')}`}</p>
                                            </div>
                                            <div className="font-mono text-right">
                                                {formatDuration(durationMs)}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        ) : (
                            <p className="text-sm text-muted-foreground text-center py-4">No hay registros de tiempo todavía.</p>
                        )}
                    </div>
                </CardContent>
            </Card>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2 font-headline"><Paperclip />Evidencia del Proyecto</CardTitle>
                </CardHeader>
                <CardContent>
                     {project.evidence && project.evidence.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4">
                            {project.evidence.map(item => (
                                <Link key={item.id} href={item.url} target="_blank" rel="noopener noreferrer" className="group relative overflow-hidden rounded-lg aspect-w-4 aspect-h-3">
                                    <Image
                                        src={item.url}
                                        alt={item.title}
                                        width={200}
                                        height={150}
                                        className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                                        />
                                    <div className="absolute inset-0 bg-black/60 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                        <p className="text-white text-xs font-semibold line-clamp-2">{item.title}</p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                        ) : (
                        <div className="text-center text-sm text-muted-foreground py-8">
                            No hay evidencias todavía.
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
      </div>
    </div>
  );
}
