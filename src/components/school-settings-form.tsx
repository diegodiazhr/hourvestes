'use client';
import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { useToast } from '@/hooks/use-toast';
import { updateSchoolSettingsAction } from '@/lib/actions';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Loader2, Upload, Building, BrainCircuit } from 'lucide-react';
import Image from 'next/image';
import { Skeleton } from './ui/skeleton';

export function SchoolSettingsForm() {
  const { userProfile, schoolSettings, loading: authLoading } = useAuth();
  const { toast } = useToast();
  const [isPending, startTransition] = useTransition();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    
    startTransition(async () => {
      const result = await updateSchoolSettingsAction(formData);
      if (result.success) {
        toast({ title: '¡Ajustes guardados!', description: 'La configuración de tu colegio ha sido actualizada.' });
        if (result.data?.logoUrl) {
            // No need to set preview URL, page will reload via revalidation
        }
      } else {
        toast({ variant: 'destructive', title: 'Error', description: result.error });
      }
    });
  };

  if (authLoading) {
      return (
          <div className="space-y-6">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-48 w-full" />
          </div>
      )
  }

  const currentLogoUrl = previewUrl || schoolSettings?.logoUrl;

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building className="text-primary" />
            Identidad del Colegio
          </CardTitle>
          <CardDescription>
            Personaliza la apariencia de la plataforma con el logo de tu institución.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="logo">Logotipo del Colegio</Label>
            <div className="mt-2 flex items-center gap-4">
              <div className="w-20 h-20 rounded-md border flex items-center justify-center bg-muted/50 overflow-hidden">
                {currentLogoUrl ? (
                  <Image src={currentLogoUrl} alt="Logo preview" width={80} height={80} className="object-contain" />
                ) : (
                  <Building className="w-8 h-8 text-muted-foreground" />
                )}
              </div>
              <div className="relative">
                <Input
                  id="logo"
                  name="logo"
                  type="file"
                  onChange={handleFileChange}
                  accept="image/png, image/jpeg, image/svg+xml"
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                />
                <Button type="button" variant="outline" asChild>
                  <label htmlFor="logo" className="cursor-pointer">
                    <Upload className="mr-2" />
                    Subir Logo
                  </label>
                </Button>
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">Recomendado: PNG o SVG con fondo transparente.</p>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BrainCircuit className="text-primary" />
            Funciones de IA
          </CardTitle>
          <CardDescription>
            Activa o desactiva las funcionalidades basadas en inteligencia artificial para tus alumnos.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between rounded-lg border p-4">
            <div className="space-y-0.5">
              <Label htmlFor="aiEnabled" className="text-base">Asistente de Reflexión</Label>
              <p className="text-sm text-muted-foreground">
                Permite a los alumnos generar sugerencias de reflexión para sus proyectos CAS.
              </p>
            </div>
            <Switch
              id="aiEnabled"
              name="aiEnabled"
              defaultChecked={schoolSettings?.aiEnabled ?? false}
            />
          </div>
        </CardContent>
      </Card>

      <div>
        <Button type="submit" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 animate-spin" />}
          Guardar Cambios
        </Button>
      </div>
    </form>
  );
}
