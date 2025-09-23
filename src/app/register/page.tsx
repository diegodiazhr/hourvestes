import { Suspense } from 'react';
import { RegisterForm } from '@/components/register-form';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpenCheck } from 'lucide-react';
import { Card, CardHeader, CardContent, CardDescription, CardTitle, CardFooter } from '@/components/ui/card';

function RegisterFormSkeleton() {
  return (
    <div className="w-full max-w-md p-4">
        <div className="text-center mb-8">
            <BookOpenCheck className="h-10 w-10 mx-auto text-primary" />
            <h1 className="text-3xl font-bold font-headline mt-2">HourVest</h1>
            <p className="text-muted-foreground">Crea una cuenta para empezar</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Registro de Nueva Cuenta</CardTitle>
            <CardDescription>Cargando formulario...</CardDescription>
          </CardHeader>
              <CardContent className="space-y-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-10 w-full" />
              </CardContent>
              <CardFooter className="flex flex-col gap-4">
                <Skeleton className="h-10 w-full" />
                <Skeleton className="h-4 w-3/4" />
              </CardFooter>
        </Card>
      </div>
  )
}

export default function RegisterPage() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-background py-12">
      <Suspense fallback={<RegisterFormSkeleton />}>
        <RegisterForm />
      </Suspense>
    </div>
  );
}
