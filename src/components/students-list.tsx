
'use client';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';
import { GOAL_HOURS } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import { useMemo } from 'react';

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
                            <span className="text-sm font-medium text-muted-foreground">Progreso</span>
                            <span className="text-sm font-bold">{student.totalHours.toFixed(0)} / {GOAL_HOURS} h</span>
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
        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-6">
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

interface StudentsListProps {
    userProfile: UserProfile | null;
    students: (UserProfile & { totalHours: number })[];
    loading: boolean;
}

export default function StudentsList({ userProfile, students, loading }: StudentsListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-xl font-bold font-headline">Mis Alumnos</CardTitle>
                <CardDescription>Visualiza y gestiona el progreso de tus alumnos.</CardDescription>
            </CardHeader>
            <CardContent>
                {loading ? <StudentsListSkeleton /> : (
                    students.length > 0 ? (
                        <div className="grid md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-1 gap-6">
                            {students.map(student => (
                                <StudentProgressCard key={student.id} student={student} />
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 border-2 border-dashed rounded-lg">
                            <p className="text-muted-foreground">Aún no tienes alumnos vinculados.</p>
                            <p className="text-muted-foreground mt-2 text-sm">Usa el botón de invitar para empezar.</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}
