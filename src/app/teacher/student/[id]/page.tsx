
'use client';

import { getClass, getProject, getProjectsForStudent, getUserProfile } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Project, UserProfile, Class } from '@/lib/types';
import { Header } from '@/components/header';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Mail, Users, FileDown, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { CasCategoryIcon } from '@/components/cas-category-icon';
import { Button } from '@/components/ui/button';

function StudentDetailSkeleton() {
    return (
        <div className="p-4 md:p-8 space-y-8">
            <div className="grid md:grid-cols-3 gap-6">
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
                <Skeleton className="h-28" />
            </div>
            <div className="flex justify-between items-center">
                <Skeleton className="h-8 w-48" />
                <Skeleton className="h-10 w-36" />
            </div>
             <div className="space-y-4">
                <Skeleton className="h-24 w-full" />
                <Skeleton className="h-24 w-full" />
            </div>
        </div>
    )
}

export default function StudentDetailPage() {
  const params = useParams();
  const studentId = params.id as string;
  const [student, setStudent] = useState<UserProfile | null>(null);
  const [studentClass, setStudentClass] = useState<Omit<Class, 'students' | 'studentCount'> | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (studentId) {
      const fetchData = async () => {
        setLoading(true);
        try {
            const studentProfile = await getUserProfile(studentId);
            
            if (!studentProfile) {
              notFound();
              return;
            }
    
            const [studentProjects, classData] = await Promise.all([
                getProjectsForStudent(studentId),
                studentProfile.classId ? getClass(studentProfile.classId) : Promise.resolve(null)
            ]);
    
            setStudent(studentProfile);
            setProjects(studentProjects);
            setStudentClass(classData);

        } catch (error) {
            console.error("Failed to fetch student data:", error);
            // Optionally set an error state to show in the UI
        } finally {
            setLoading(false);
        }
      };
      fetchData();
    }
  }, [studentId]);

  if (loading) {
    return (
        <div className="flex flex-col min-h-screen">
            <Header />
            <main className="flex-1 container mx-auto">
                 <StudentDetailSkeleton />
            </main>
        </div>
    )
  }


  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <div className="flex items-center gap-4 mb-8">
            <Avatar className="h-16 w-16">
                <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student?.name}`} />
                <AvatarFallback>{student?.name?.substring(0, 2)}</AvatarFallback>
            </Avatar>
            <div>
                <h1 className="text-3xl font-bold font-headline">{student?.name}</h1>
                <p className="text-muted-foreground">ID del alumno: {studentId}</p>
            </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Mail className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle>Correo Electrónico</CardTitle>
                        <CardDescription>Dirección de contacto del alumno.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{student?.email}</p>
                </CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Users className="w-8 h-8 text-primary" />
                    <div>
                        <CardTitle>Clase Vinculada</CardTitle>
                        <CardDescription>La clase a la que pertenece el alumno.</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <p className="font-semibold">{studentClass?.name || 'No asignada'}</p>
                </CardContent>
            </Card>
        </div>


        <div className="mt-8">
            <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold font-headline">Proyectos del Alumno</h2>
                <Button variant="outline" disabled>
                    <FileDown className="mr-2 h-4 w-4" />
                    Exportar Información (PDF)
                </Button>
            </div>
            {projects.length > 0 ? (
                <div className="space-y-4">
                    {projects.map(p => (
                        <Link href={`/teacher/student/${studentId}/project/${p.id}`} key={p.id} className="block group">
                            <Card className="hover:border-primary transition-all">
                                <CardContent className="p-4 flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <CasCategoryIcon category={p.category} className="h-8 w-8 text-muted-foreground"/>
                                        <div>
                                            <h3 className="font-semibold group-hover:text-primary transition-colors">{p.name}</h3>
                                            <p className="text-sm text-muted-foreground line-clamp-1">{p.description}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-4">
                                        <Badge variant={p.progress === 'Completado' ? 'default' : 'secondary'} className="capitalize">{p.progress}</Badge>
                                        <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:translate-x-1 transition-transform" />
                                    </div>
                                </CardContent>
                            </Card>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-16 border-2 border-dashed rounded-lg">
                    <p className="text-muted-foreground font-semibold">Este alumno todavía no tiene proyectos.</p>
                </div>
            )}
        </div>
      </main>
    </div>
  );
}
