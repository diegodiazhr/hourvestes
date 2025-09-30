
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
import { Loader2, PlusCircle, Copy, User, Users, Calendar as CalendarIcon, Check } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import Link from 'next/link';
import { Skeleton } from './ui/skeleton';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { Label } from './ui/label';


function CreateClassForm({ onClassCreated }: { onClassCreated: () => void }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);
    const [date, setDate] = useState<Date | undefined>();
  
    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const formData = new FormData(event.currentTarget);
      if (!date) {
        toast({ variant: 'destructive', title: 'Error', description: 'Debes seleccionar una fecha de finalización.' });
        return;
      }
      formData.append('casEndDate', date.toISOString());
      
      startTransition(async () => {
        const result = await createClassAction(formData);
        if (result.success) {
          toast({ title: '¡Clase creada!', description: 'Tu nueva clase ha sido creada correctamente.' });
          setOpen(false);
          setDate(undefined);
          (event.target as HTMLFormElement).reset();
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
                Rellena los datos de tu nueva clase para empezar a invitar alumnos.
              </DialogDescription>
            </DialogHeader>
            <div className="py-4 space-y-4">
              <div>
                <Label htmlFor="name">Nombre de la clase</Label>
                <Input
                    id="name"
                    name="name"
                    placeholder="p. ej., Biología 1º Bachillerato"
                    required
                    className="mt-2"
                />
              </div>
              <div>
                <Label>Fecha de Finalización de CAS</Label>
                <Popover>
                    <PopoverTrigger asChild>
                        <Button
                        variant={'outline'}
                        className={cn(
                            "w-full justify-start text-left font-normal mt-2",
                            !date && "text-muted-foreground"
                        )}
                        >
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {date ? format(date, "PPP", { locale: es}) : <span>Elige una fecha</span>}
                        </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                        <Calendar
                        mode="single"
                        selected={date}
                        onSelect={setDate}
                        initialFocus
                        locale={es}
                        />
                    </PopoverContent>
                </Popover>
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
              <Button type="submit" disabled={isPending || !date}>
                {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Crear Clase
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  }

function CopyClassCodeButton({ classId }: { classId: string }) {
    const { toast } = useToast();
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        navigator.clipboard.writeText(classId).then(() => {
            setCopied(true);
            toast({
                title: '¡Código Copiado!',
                description: 'El código de la clase se ha copiado a tu portapapeles.',
            });
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => {
            toast({ variant: 'destructive', title: 'Error', description: 'No se pudo copiar el código.' });
        });
    };

    return (
        <Button variant="outline" size="sm" onClick={handleCopy}>
            {copied ? <Check className="mr-2 h-4 w-4 text-green-500" /> : <Copy className="mr-2 h-4 w-4" />}
            {copied ? 'Copiado' : 'Copiar código de clase'}
        </Button>
    )
}

function StudentCard({ student }: { student: UserProfile }) {
    return (
        <Card className="hover:shadow-md transition-shadow">
             <Link href={`/teacher/student/${student.id}`}>
                <div className="flex items-center gap-4 p-3">
                    <Avatar className="h-10 w-10">
                        <AvatarImage src={`https://api.dicebear.com/7.x/initials/svg?seed=${student.name}`} alt={student.name} />
                        <AvatarFallback>{student.name.charAt(0)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <p className="font-semibold">{student.name}</p>
                        <p className="text-xs text-muted-foreground">{student.email}</p>
                    </div>
                </div>
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
    return (
      <div className="p-4 md:p-6 space-y-6">
        <div className="flex justify-between items-center">
          <Skeleton className="h-9 w-48" />
          <Skeleton className="h-10 w-32" />
        </div>
        <div className="space-y-4 border rounded-lg p-4">
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-8 w-1/3" />
            <Skeleton className="h-20 w-full" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
            <h1 className="text-2xl font-bold font-headline">Gestión de Clases y Alumnos</h1>
            <p className="text-muted-foreground">Crea clases, invita a alumnos y sigue su progreso.</p>
        </div>
        {classes.length > 0 && <CreateClassForm onClassCreated={fetchClasses} />}
      </div>

      {classes.length > 0 ? (
          <Accordion type="single" collapsible defaultValue={`class-${classes[0].id}`} className="w-full">
            {classes.map((cls) => (
                <AccordionItem value={`class-${cls.id}`} key={cls.id}>
                    <AccordionTrigger className="hover:no-underline">
                        <div className='flex flex-1 justify-between items-center pr-4'>
                            <div className="flex flex-col sm:flex-row sm:items-center text-left sm:gap-4">
                                <h2 className="text-xl font-semibold text-left">{cls.name}</h2>
                                <div className="flex items-center text-sm text-muted-foreground gap-4">
                                    <div className="flex items-center">
                                        <Users className="mr-2 h-4 w-4" />
                                        {cls.studentCount} {cls.studentCount === 1 ? 'alumno' : 'alumnos'}
                                    </div>
                                    <div className="hidden sm:flex items-center">
                                        <CalendarIcon className="mr-2 h-4 w-4" />
                                        Fin: {format(cls.casEndDate, 'dd/MM/yyyy')}
                                    </div>
                                </div>
                            </div>
                           <CopyClassCodeButton classId={cls.id} />
                        </div>
                    </AccordionTrigger>
                    <AccordionContent className="space-y-4 pt-4">
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
                                <p className="text-sm text-muted-foreground">Copia el código de clase para que puedan unirse.</p>
                            </div>
                        )}
                    </AccordionContent>
              </AccordionItem>
            ))}
        </Accordion>
      ) : (
        <Card className="mt-6">
          <CardHeader>
            <CardTitle className="text-2xl">¡Bienvenido a HourVest!</CardTitle>
            <CardDescription>Sigue estos dos sencillos pasos para empezar a gestionar a tus alumnos.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
              <div className="flex items-start gap-4">
                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">1</div>
                  <div className="flex-1">
                      <h3 className="text-lg font-semibold">Crea tu primera clase</h3>
                      <p className="text-muted-foreground mb-4">Agrupa a tus alumnos en clases para tenerlos organizados. Por ejemplo: "Biología 1º Bachillerato".</p>
                      <CreateClassForm onClassCreated={fetchClasses} />
                  </div>
              </div>
              <div className="flex items-start gap-4 opacity-50">
                   <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-muted-foreground font-bold">2</div>
                   <div className="flex-1">
                       <h3 className="text-lg font-semibold">Invita a tus alumnos</h3>
                       <p className="text-muted-foreground">Una vez creada la clase, podrás copiar un código de invitación único para compartir con tus alumnos. ¡Ellos harán el resto!</p>
                  </div>
              </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
