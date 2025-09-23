
'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '@/lib/firebase';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import Image from 'next/image';
import Link from 'next/link';
import { Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const formSchema = z.object({
  email: z.string().email({ message: 'Por favor, introduce un correo válido.' }),
  password: z.string().min(6, { message: 'La contraseña debe tener al menos 6 caracteres.' }),
});

function GoogleIcon(props: React.SVGProps<SVGSVGElement>) {
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 48 48"
        width="24px"
        height="24px"
        {...props}
      >
        <path
          fill="#FFC107"
          d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"
        />
        <path
          fill="#FF3D00"
          d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"
        />
        <path
          fill="#4CAF50"
          d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.222,0-9.655-3.356-11.303-8H6.306C9.656,39.663,16.318,44,24,44z"
        />
        <path
          fill="#1976D2"
          d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C42.022,35.622,44,30.138,44,24C44,22.659,43.862,21.35,43.611,20.083z"
        />
      </svg>
    );
  }

export default function LoginPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    setIsPending(true);
    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: '¡Bienvenido de vuelta!',
        description: 'Has iniciado sesión correctamente.',
      });
      router.push('/');
    } catch (error) {
      toast({
        variant: 'destructive',
        title: 'Error de inicio de sesión',
        description: 'Las credenciales no son correctas. Por favor, inténtalo de nuevo.',
      });
    } finally {
        setIsPending(false);
    }
  };

  return (
    <div className="min-h-screen grid grid-cols-1 md:grid-cols-2 antialiased">
        <div className="flex flex-col justify-center items-center p-8 lg:p-16 bg-card">
            <div className="w-full max-w-sm mx-auto">
                <div className="mb-8 text-center md:text-left">
                    <h1 className="text-3xl font-bold font-headline mb-2">
                        Bienvenid@ de vuelta 👋
                    </h1>
                    <p className="text-muted-foreground">
                        ¡Bienvenido a CAS Chronicle, donde podrás organizar todas tus actividades CAS en un solo click!
                    </p>
                </div>

                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                        <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                            <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                                <Input type="email" placeholder="ejemplo@correo.es" {...field} />
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
                                <Input type="password" placeholder="Indica tu contraseña" {...field} />
                            </FormControl>
                            <FormMessage />
                            </FormItem>
                        )}
                        />

                        <div className="text-right">
                            <Link href="#" className="text-sm font-medium text-primary hover:underline">
                                ¿Has olvidado de tu contraseña?
                            </Link>
                        </div>
                        
                        <Button type="submit" className="w-full bg-gray-800 hover:bg-gray-900 text-white font-bold" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Iniciar Sesión
                        </Button>
                    </form>
                </Form>

                <div className="relative my-8">
                    <div className="absolute inset-0 flex items-center">
                        <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                        <span className="bg-card px-2 text-muted-foreground">Or</span>
                    </div>
                </div>

                <Button variant="outline" className="w-full" disabled>
                    <GoogleIcon className="mr-2 h-5 w-5" />
                    Sign in with Google
                </Button>

                <p className="mt-8 text-center text-sm text-muted-foreground">
                    ¿No tienes cuenta?{' '}
                    <Link href="/register" className="font-semibold text-primary hover:underline">
                        Regístrate
                    </Link>
                </p>

                <footer className="mt-12 text-center text-xs text-muted-foreground">
                    <p>&copy; {new Date().getFullYear()} - CAS Chronicle</p>
                </footer>
            </div>
        </div>
      <div className="hidden md:block relative">
        <Image
          src="https://images.unsplash.com/photo-1519671843813-892215c8a666?q=80&w=1974&auto=format&fit=crop"
          alt="Community work"
          layout="fill"
          objectFit="cover"
          className="rounded-l-2xl"
          data-ai-hint="community service volunteering"
        />
      </div>
    </div>
  );
}

    