
'use client';
import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { getAllSchools, getAllUsers } from '@/lib/data';
import type { School, UserProfile } from '@/lib/types';
import { Header } from '@/components/header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { createSchoolAndInviteTeacherAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Loader2, Building, Users, PlusCircle, University, Mail, UserPlus, MoreHorizontal, Trash2, Eye } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

function AdminDashboardSkeleton() {
  return (
    <div className="p-8 space-y-6">
      <div className="h-8 w-48 bg-muted rounded" />
      <div className="grid md:grid-cols-2 gap-6">
        <div className="h-28 bg-muted rounded-lg" />
        <div className="h-28 bg-muted rounded-lg" />
      </div>
      <div className="h-64 bg-muted rounded-lg" />
    </div>
  );
}


function CreateSchoolDialog({ onSchoolCreated }: { onSchoolCreated: () => void }) {
    const [isPending, startTransition] = useTransition();
    const { toast } = useToast();
    const [open, setOpen] = useState(false);

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        const formData = new FormData(event.currentTarget);
        startTransition(async () => {
            const result = await createSchoolAndInviteTeacherAction(formData);
            if (result.success) {
                toast({ title: '¡Institución Creada!', description: `Se ha creado ${result.data.schoolName} y se ha invitado a ${result.data.teacherEmail}.` });
                onSchoolCreated();
                setOpen(false);
                (event.target as HTMLFormElement).reset();
            } else {
                toast({ variant: 'destructive', title: 'Error', description: result.error });
            }
        });
    };

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <PlusCircle className="mr-2" />
                    Crear Institución
                </Button>
            </DialogTrigger>
            <DialogContent>
                <form onSubmit={handleSubmit}>
                    <DialogHeader>
                        <DialogTitle>Crear Nueva Institución Educativa</DialogTitle>
                        <DialogDescription>
                            Introduce el nombre de la institución y el correo del profesor principal que la gestionará.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="schoolName"><University className="inline-block mr-2" />Nombre de la Institución</Label>
                            <Input id="schoolName" name="schoolName" placeholder="p. ej., Colegio Internacional del Bosque" required />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="teacherEmail"><Mail className="inline-block mr-2" />Correo del Profesor a Invitar</Label>
                            <Input id="teacherEmail" name="teacherEmail" type="email" placeholder="profesor@ejemplo.com" required />
                        </div>
                         <div className="space-y-2">
                            <Label htmlFor="teacherName"><UserPlus className="inline-block mr-2" />Nombre del Profesor</Label>
                            <Input id="teacherName" name="teacherName" placeholder="Nombre completo del profesor" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 animate-spin" />}
                            Crear e Invitar
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, schools: 0 });
  const [schools, setSchools] = useState<School[]>([]);
  const [loading, setLoading] = useState(true);
  const { userProfile } = useAuth();
  
  const fetchData = async () => {
    setLoading(true);
    try {
        const [usersData, schoolsData] = await Promise.all([getAllUsers(), getAllSchools()]);
        setStats({ users: usersData.length, schools: schoolsData.length });
        setSchools(schoolsData);
    } catch(e) {
        console.error("Failed to fetch admin data", e);
    } finally {
        setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <Header />
        <main className="flex-1 container mx-auto">
          <AdminDashboardSkeleton />
        </main>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      <main className="flex-1 container mx-auto p-4 md:p-8">
        <h1 className="text-3xl font-bold font-headline mb-6">Panel de Administración</h1>

        <div className="grid md:grid-cols-2 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Usuarios Totales</CardTitle>
              <Users className="text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.users}</p>
              <p className="text-sm text-muted-foreground">Alumnos y profesores registrados.</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Instituciones Educativas</CardTitle>
              <Building className="text-primary" />
            </CardHeader>
            <CardContent>
              <p className="text-4xl font-bold">{stats.schools}</p>
              <p className="text-sm text-muted-foreground">Colegios dados de alta en la plataforma.</p>
            </CardContent>
          </Card>
        </div>

        <Card>
            <CardHeader className="flex flex-row items-center justify-between">
                <div>
                    <CardTitle>Gestión de Instituciones</CardTitle>
                    <CardDescription>Crea, visualiza y gestiona las instituciones de la plataforma.</CardDescription>
                </div>
                <CreateSchoolDialog onSchoolCreated={fetchData} />
            </CardHeader>
            <CardContent>
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Nombre</TableHead>
                            <TableHead>Profesor Admin.</TableHead>
                            <TableHead>Alumnos</TableHead>
                            <TableHead>Acciones</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {schools.map(school => (
                            <TableRow key={school.id}>
                                <TableCell className="font-medium">{school.name}</TableCell>
                                <TableCell>{school.adminTeacherId}</TableCell>
                                <TableCell>0</TableCell>
                                <TableCell>
                                     <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button variant="ghost" className="h-8 w-8 p-0">
                                                <span className="sr-only">Abrir menú</span>
                                                <MoreHorizontal className="h-4 w-4" />
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end">
                                            <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                                            <DropdownMenuItem>
                                               <Eye className="mr-2" /> Ver Alumnos
                                            </DropdownMenuItem>
                                            <DropdownMenuSeparator />
                                            <DropdownMenuItem className="text-destructive">
                                                <Trash2 className="mr-2" /> Eliminar Institución
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </CardContent>
        </Card>

      </main>
    </div>
  );
}
