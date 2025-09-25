
'use client';
import Link from 'next/link';
import type { UserProfile } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from './ui/separator';

function StudentProgressCard({ student }: { student: UserProfile & { totalHours: number, className?: string } }) {
    return (
         <Link href={`/teacher/student/${student.id}`} className="block hover:bg-muted/50 rounded-md p-2 -mx-2">
            <div className="flex justify-between items-center">
                <span className="font-semibold text-sm">{student.name}</span>
                <span className="text-xs text-muted-foreground">{student.className || 'Sin clase'}</span>
            </div>
        </Link>
    )
}

function StudentsListSkeleton() {
    return (
        <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className='space-y-2'>
                    <div className="flex justify-between items-center">
                        <Skeleton className="h-4 w-32" />
                        <Skeleton className="h-3 w-24" />
                    </div>
                    {i < 2 && <Separator/>}
                </div>
            ))}
        </div>
    )
}

interface StudentsListProps {
    students: (UserProfile & { totalHours: number, className?: string })[];
    loading: boolean;
}

export default function StudentsList({ students, loading }: StudentsListProps) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-base">Mis Alumnos</CardTitle>
            </CardHeader>
            <CardContent>
                {loading ? <StudentsListSkeleton /> : (
                    students.length > 0 ? (
                        <div className="space-y-2">
                            {students.slice(0, 4).map((student, i) => (
                                <div key={student.id}>
                                    <StudentProgressCard student={student} />
                                    {i < Math.min(students.length, 4) - 1 && <Separator />}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-8">
                            <p className="text-sm text-muted-foreground">No tienes alumnos.</p>
                        </div>
                    )
                )}
            </CardContent>
        </Card>
    );
}

    
