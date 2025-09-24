
'use client';
import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import Link from 'next/link';
import { BookOpenCheck, Loader2 } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre es requerido.'}),
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  school: z.string().min(2, { message: 'El nombre de la institución es requerido.' }),
});

export function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);
  const [isLoadingParams, setIsLoadingParams] = useState(true);
  const [inviteDetails, setInviteDetails] = useState<{
    teacherId: string;
    classId: string;
    schoolName: string;
    className: string;
  } | null>(null);
  
  const classId = searchParams.get('classId');

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      school: '',
    },
  });

  useEffect(() => {
    async function fetchInviteDetails() {
      if (classId) {
        const classRef = doc(db, 'classes', classId);
        const classSnap = await getDoc(classRef);
        if (classSnap.exists()) {
          const classData = classSnap.data();
          setInviteDetails({
            classId,
            teacherId: classData.teacherId,
            schoolName: classData.school,
            className: classData.name,
          });
          form.setValue('school', classData.school);
        } else {
            toast({ variant: 'destructive', title: 'Error', description: 'El enlace de invitación no es válido.' });
        }
      }
      setIsLoadingParams(false);
    }
    fetchInviteDetails();
  }, [classId, form, toast]);


  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!inviteDetails) {
        toast({ variant: 'destructive', title: 'Error', description: 'Faltan los detalles de la invitación.' });
        return;
    }
    setIsPending(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Create user profile in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        name: values.name,
        email: values.email,
        role: 'Alumno',
        school: values.school,
        teacherId: inviteDetails.teacherId,
        classId: inviteDetails.classId,
      });

      toast({
        title: '¡Cuenta Creada!',
        description: 'Tu cuenta ha sido creada exitosamente. Ahora serás redirigido.',
      });
      router.push('/');
    } catch (error: any) {
        let description = 'Ocurrió un error inesperado. Por favor, inténtalo de nuevo.';
        if (error.code === 'auth/email-already-in-use') {
            description = 'Este correo electrónico ya está en uso. Por favor, inicia sesión o usa otro correo.';
        }
      toast({
        variant: 'destructive',
        title: 'Error de registro',
        description,
      });
      setIsPending(false);
    }
  };

  const isTeacherRegistration = !classId && !isLoadingParams;

  if (isLoadingParams) {
      // You can return a skeleton loader here
      return <div>Cargando...</div>
  }

  return (
      <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
            <BookOpenCheck className="h-10 w-10 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline mt-2">HourVest</h1>
            <p className="text-muted-foreground">{isTeacherRegistration ? 'Crea una cuenta de profesor' : 'Crea tu cuenta de alumno'}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registro de Nueva Cuenta</CardTitle>
            {inviteDetails && (
                <CardDescription>
                    Te estás registrando como alumno en la clase <strong>{inviteDetails.className}</strong> de {inviteDetails.schoolName}.
                </CardDescription>
            )}
             {isTeacherRegistration && (
                <CardDescription>
                    Crea una cuenta de profesor para gestionar tus clases y alumnos.
                </CardDescription>
             )}
          </CardHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)}>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Tu nombre" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 <FormField
                  control={form.control}
                  name="school"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Institución Educativa</FormLabel>
                      <FormControl>
                        <Input placeholder="Nombre de tu escuela" {...field} disabled={!!inviteDetails?.schoolName} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Correo Electrónico</FormLabel>
                      <FormControl>
                        <Input type="email" placeholder="tu@correo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contraseña</FormLabel>
                      <FormControl>
                        <Input type="password" placeholder="••••••••" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                 {!isTeacherRegistration && (
                    <input type="hidden" name="role" value="Alumno" />
                )}
                 {isTeacherRegistration && (
                     <FormField
                        control={form.control}
                        name="role"
                        render={({ field }) => (
                            <FormItem>
                                <FormControl>
                                <input type="hidden" {...field} value="Profesor" />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        )}
                        />
                )}
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Button type="submit" className="w-full" disabled={isPending || (!isTeacherRegistration && !inviteDetails)}>
                  {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Crear Cuenta
                </Button>
                <p className="text-sm text-center text-muted-foreground">
                  ¿Ya tienes una cuenta?{' '}
                  <Link href="/login" className="font-semibold text-primary hover:underline">
                    Inicia Sesión
                  </Link>
                </p>
              </CardFooter>
            </form>
          </Form>
        </Card>
      </div>
  );
}
