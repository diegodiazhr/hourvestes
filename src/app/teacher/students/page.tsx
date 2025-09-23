
'use client';
import { useEffect, useState, useMemo } from 'react';
import Link from 'next/link';
import { getStudentsForTeacher, getProjectsForStudent } from '@/lib/data';
import type { UserProfile, Project, TimeEntry } from '@/lib/types';
import { GOAL_HOURS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { UserPlus, Copy } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

function StudentProgressCard({ student }: { student: UserProfile & { totalHours: number } }) {
    const progress = useMemo(() => Math.min((student.totalHours / GOAL_HOURS) * 100, 100), [student.totalHours]);

    return (
        <Card className="hover:shadow-md transition-shadow">
            <Link href={`/teacher/student/${student.id}`}>
                <CardHeader className="flex flex-row items-center gap-4">
                    <Avatar className="h-12 w-12">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <CardTitle className="text-lg">{student.name}</CardTitle>
                        <CardDescription>{student.email}</CardDescription>
                    </div>
                </CardHeader>
                <CardContent>
                    <div>
                        <div className="flex justify-between items-center mb-1">
                            <span className="text-sm font-medium text-muted-foreground">Progreso de Horas</span>
                            <span className="text-sm font-bold">{student.totalHours.toFixed(1)} / {GOAL_HOURS} h</span>
                        </div>
                        <Progress value={progress} className="h-2" />
                        <p className="text-xs text-right mt-1 text-muted-foreground">{progress.toFixed(1)}% completado</p>
                    </div>
                </CardContent>
            </Link>
        </Card>
    )
}

function StudentsListSkeleton() {
    return (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i}>
                    <CardHeader className="flex flex-row items-center gap-4">
                        <Skeleton className="h-12 w-12 rounded-full" />
                        <div className="space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-40" />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <Skeleton className="h-6 w-full" />
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default function MyStudentsPage({ userProfile }: { userProfile: UserProfile }) {
    const { toast } = useToast();
    const [students, setStudents] = useState<(UserProfile & { totalHours: number })[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (userProfile && userProfile.role === 'Profesor' && userProfile.school) {
            getStudentsForTeacher(userProfile).then(async (studentProfiles) => {
                const studentsWithHours = await Promise.all(studentProfiles.map(async (student) => {
                    const projects = await getProjectsForStudent(student.id);
                    const totalHours = calculateTotalHours(projects);
                    return { ...student, totalHours };
                }));

                setStudents(studentsWithHours);
                setLoading(false);
            });
        } else if (userProfile) {
            setLoading(false);
        }
    }, [userProfile]);

    const handleInvite = () => {
        if(!userProfile) return;

        const schoolQueryParam = userProfile.school ? `&school=${encodeURIComponent(userProfile.school)}` : '';
        const inviteLink = `https://studio-6718836827-4de5a.web.app/register?teacherId=${userProfile.id}${schoolQueryParam}`;
        
        navigator.clipboard.writeText(inviteLink);

        toast({
            title: "¡Enlace de Invitación Copiado!",
            description: "Comparte este enlace con tus alumnos para que se registren y se vinculen a ti.",
        });
    };

    const calculateTotalHours = (projects: Project[]) => {
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
        return totalMilliseconds / (1000 * 60 * 60);
    }


    return (
        <Card className="mt-8">
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle className="text-2xl font-bold font-headline">Mis Alumnos</CardTitle>
                    <CardDescription>Visualiza y gestiona el progreso de tus alumnos{userProfile?.school ? ` de ${userProfile.school}` : ''}.</CardDescription>
                </div>
                <Button onClick={handleInvite}>
                    <UserPlus className="mr-2"/>
                    Invitar Alumnos
                </Button>
            </CardHeader>
            <CardContent>
                {loading ? <StudentsListSkeleton /> : (
                    students.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {students.map(student => (
                                <StudentProgressCard key={student.id} student={student} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Aún no tienes alumnos vinculados.</p>
                            <p className="text-muted-foreground mt-2">Usa el botón de invitar para empezar.</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}
