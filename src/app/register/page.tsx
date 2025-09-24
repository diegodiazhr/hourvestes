
'use client';
import { useEffect, useState } from 'react';
import Image from 'next/image';
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
import type { School } from '@/lib/types';
import { getSchoolSettings } from '@/lib/data';

const formSchema = z.object({
  name: z.string().min(2, { message: 'El nombre es requerido.'}),
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
  school: z.string().min(2, { message: 'El nombre de la institución es requerido.' }),
});

export default function RegisterPage() {
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
  const [schoolSettings, setSchoolSettings] = useState<School | null>(null);
  
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
          const schoolData = await getSchoolSettings(classData.school);
          setSchoolSettings(schoolData);
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
    // A teacher registration flow
    if (!inviteDetails) {
        setIsPending(true);
        try {
            const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
            const user = userCredential.user;
             await setDoc(doc(db, 'users', user.uid), {
                name: values.name,
                email: values.email,
                role: 'Profesor',
                school: values.school,
            });
            toast({ title: '¡Cuenta Creada!', description: 'Tu cuenta de profesor ha sido creada.' });
            router.push('/');
        } catch (error: any) {
            let description = 'Ocurrió un error inesperado.';
            if (error.code === 'auth/email-already-in-use') {
                description = 'Este correo ya está en uso.';
            }
            toast({ variant: 'destructive', title: 'Error de registro', description });
        } finally {
            setIsPending(false);
        }
        return;
    }

    // A student registration flow
    setIsPending(true);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

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
      return (
        <div className="flex min-h-screen items-center justify-center">
            <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </div>
      )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
            {schoolSettings?.logoUrl ? (
                 <Image src={schoolSettings.logoUrl} alt={`${schoolSettings.name} logo`} width={64} height={64} className="mx-auto h-16 w-16 rounded-lg object-contain mb-4" />
            ): (
                <BookOpenCheck className="h-10 w-10 mx-auto text-primary" />
            )}
            <h1 className="text-3xl font-bold font-headline mt-2">HourVest</h1>
            <p className="text-muted-foreground">{isTeacherRegistration ? 'Crea una cuenta de profesor' : 'Crea tu cuenta de alumno'}</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>{isTeacherRegistration ? 'Registro de Profesor' : 'Registro de Alumno'}</CardTitle>
            {inviteDetails && (
                <CardDescription>
                    Te estás registrando en la clase <strong>{inviteDetails.className}</strong> de {inviteDetails.schoolName}.
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
    </div>
  );
}
