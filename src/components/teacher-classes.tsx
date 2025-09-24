
'use client';
import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getClassesForTeacher } from '@/lib/data';
import { createClassAction } from '@/lib/actions';
import type { Class, UserProfile } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Loader2, PlusCircle, Copy, Users, Link as LinkIcon, User } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from 'next/link';


function CreateClassForm({ onClassCreated }: { onClassCreated: () => void }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
  
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      
      startTransition(async () => {
        const result = await createClassAction(formData);
        if (result.success) {
          toast({ title: '¡Clase creada!', description: 'Tu nueva clase ha sido creada correctamente.' });
          setOpen(false);
          onClassCreated();
        } else {
          toast({ variant: 'destructive', title: 'Error', description: result.error });
        }
      });
    };
  
    return (
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogTrigger asChild>
          <Button>
            <PlusCircle className="mr-2 h-4 w-4" />
            Crear Nueva Clase
          </Button>
        </DialogTrigger>
        <DialogContent>
          <form onSubmit={handleSubmit}>
            <DialogHeader>
              <DialogTitle>Crear Nueva Clase</DialogTitle>
              <DialogDescription>
                Dale un nombre a tu nueva clase para empezar a invitar alumnos.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4">
              <Input
                id="name"
                name="name"
                placeholder="p. ej., Biología 1º Bachillerato - Grupo A"
                required
              />
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isPending}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Clase
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

function InviteLinkButton({ classId }: { classId: string }) {
    const { toast } = useToast();

    const handleCopy = () => {
        const inviteLink = `${window.location.origin}/register?classId=${classId}`;
        navigator.clipboard.writeText(inviteLink).then(() => {
            toast({
                title: '¡Enlace Copiado!',
                description: 'El enlace de invitación para esta clase ha sido copiado a tu portapapeles.',
            });
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo copiar el enlace.' });
        });
    };

    return (
        <Button variant="outline" size="sm" onClick={handleCopy}>
            <LinkIcon className="mr-2 h-4 w-4" />
            Copiar enlace de invitación
        </Button>
    )
}

function StudentCard({ student }: { student: UserProfile }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
             <Link href={`/teacher/student/${student.id}`}>
                <CardHeader className="flex flex-row items-center gap-4 pb-2">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                </CardHeader>
            </Link>
        </Card>
    )
}


export function TeacherClasses() {
  const { user } = useAuth();
  const [classes, setClasses] = useState<Class[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchClasses = async () => {
    if (user) {
        setLoading(true);
        const fetchedClasses = await getClassesForTeacher(user.uid);
        setClasses(fetchedClasses);
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchClasses();
  }, [user]);

  if (loading) {
    return <div>Cargando clases...</div>;
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold font-headline">Gestión de Clases y Alumnos</h1>
            <p className="text-muted-foreground">Crea clases, invita a alumnos y sigue su progreso.</p>
        </div>
        <CreateClassForm onClassCreated={fetchClasses} />
      </div>

      {classes.length > 0 ? (
          <Accordion type="single" collapsible defaultValue={`class-${classes[0].id}`}>
            {classes.map((cls) => (
                <AccordionItem value={`class-${cls.id}`} key={cls.id}>
                    <AccordionTrigger>
                        <div className='flex items-center gap-4'>
                            <h2 className="text-xl font-semibold">{cls.name}</h2>
                            <div className="flex items-center text-sm text-muted-foreground">
                                <Users className="mr-2 h-4 w-4" />
                                {cls.studentCount} {cls.studentCount === 1 ? 'alumno' : 'alumnos'}
                            </div>
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4">
                        <div className='pb-4'>
                            <InviteLinkButton classId={cls.id} />
                        </div>
                        {cls.students.length > 0 ? (
                             <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                                {cls.students.map(student => (
                                    <StudentCard key={student.id} student={student} />
                                ))}
                            </div>
                        ): (
                            <div className="text-center py-8 border-2 border-dashed rounded-lg">
                                <User className="mx-auto h-10 w-10 text-muted-foreground" />
                                <p className="mt-4 font-semibold text-muted-foreground">Aún no hay alumnos en esta clase</p>
                                <p className="text-sm text-muted-foreground">Copia el enlace de invitación para que puedan unirse.</p>
                            </div>
                        )}
                    </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      ) : (
        <div className="text-center py-16 border-2 border-dashed rounded-lg">
            <Users className="mx-auto h-12 w-12 text-muted-foreground" />
            <h2 className="text-xl font-semibold text-muted-foreground mt-4">¡Aún no has creado ninguna clase!</h2>
            <p className="text-muted-foreground mt-2">Crea tu primera clase para poder invitar a alumnos.</p>
            <div className="mt-4">
                <CreateClassForm onClassCreated={fetchClasses} />
            </div>
        </div>
      )}
    </div>
  );
}
