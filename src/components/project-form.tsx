
'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CalendarIcon, Loader2 } from 'lucide-react';

import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Calendar } from '@/components/ui/calendar';
import {
  RadioGroup,
  RadioGroupItem,
} from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { learningOutcomes, type CASCategory } from '@/lib/types';
import { createProjectAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { CasCategoryIcon } from './cas-category-icon';
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/hooks/use-auth';

const projectFormSchema = z.object({
  name: z.string().min(3, {
    message: 'El nombre del proyecto debe tener al menos 3 caracteres.',
  }),
  description: z.string().min(10, {
    message: 'La descripción debe tener al menos 10 caracteres.',
  }),
  category: z.enum(['Creatividad', 'Actividad', 'Servicio'], {
    required_error: 'Debes seleccionar una categoría de proyecto.',
  }),
  dates: z.object(
    {
      from: z.date({ required_error: 'Se requiere una fecha de inicio.' }),
      to: z.date().optional(),
    }
  ).refine(data => data.from, {
      message: "La fecha de inicio es obligatoria"
  }),
  learningOutcomes: z.array(z.string()).refine(value => value.some(item => item), {
    message: 'Debes seleccionar al menos un resultado de aprendizaje.',
  }),
  personalGoals: z.string().optional(),
});

type ProjectFormValues = z.infer<typeof projectFormSchema>;

const defaultValues: Partial<ProjectFormValues> = {
  name: '',
  description: '',
  category: undefined,
  learningOutcomes: [],
  personalGoals: '',
  dates: {
    from: undefined,
    to: undefined
  }
};

export function ProjectForm() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isPending, setIsPending] = useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    defaultValues,
  });

  async function onSubmit(data: ProjectFormValues) {
    if (!user) {
        toast({
            title: "Error de autenticación",
            description: "Debes iniciar sesión para crear un proyecto.",
            variant: 'destructive',
        });
        return;
    }
    setIsPending(true);

    try {
        const idToken = await user.getIdToken();
        const projectData = {
          name: data.name,
          description: data.description,
          category: data.category,
          dates: {
            from: data.dates.from.toISOString(),
            to: data.dates.to?.toISOString(),
          },
          learningOutcomes: data.learningOutcomes,
          personalGoals: data.personalGoals,
        };
        
        await createProjectAction(idToken, projectData);
        toast({
            title: "¡Proyecto Creado!",
            description: "Tu nuevo proyecto CAS ha sido guardado exitosamente.",
        });
    } catch(e: any) {
        console.error(e);
        toast({
            title: "Error al crear proyecto",
            description: e.message || "No se pudo crear el proyecto. Por favor, inténtalo de nuevo.",
            variant: 'destructive',
        });
    } finally {
        setIsPending(false);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Detalles del Proyecto</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre del Proyecto</FormLabel>
                  <FormControl>
                    <Input placeholder="p. ej., Pintura de Mural Comunitario" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descripción</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cuéntanos un poco sobre tu proyecto"
                      className="resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="dates"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Fechas del Proyecto</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant={'outline'}
                          className={cn(
                            'w-full pl-3 text-left font-normal',
                            !field.value?.from && 'text-muted-foreground'
                          )}
                        >
                          {field.value?.from ? (
                            <>
                              {format(field.value.from, 'd LLL, y', { locale: es })} -{' '}
                              {field.value.to ? format(field.value.to, 'd LLL, y', { locale: es }) : '...'}
                            </>
                          ) : (
                            <span>Elige un rango de fechas</span>
                          )}
                          <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        locale={es}
                        mode="range"
                        selected={field.value}
                        onSelect={field.onChange}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Categoría CAS</CardTitle>
          </CardHeader>
          <CardContent>
            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem className="space-y-3">
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                      className="grid grid-cols-1 md:grid-cols-3 gap-4"
                    >
                      {(['Creatividad', 'Actividad', 'Servicio'] as const).map((category: CASCategory) => (
                        <FormItem key={category}>
                            <Label className="[&:has([data-state=checked])>div]:border-primary [&:has([data-state=checked])>div]:bg-primary/10">
                                <FormControl>
                                    <RadioGroupItem value={category} className="sr-only" />
                                </FormControl>
                                <div className="flex flex-col items-center justify-center p-4 border-2 border-muted bg-transparent rounded-lg cursor-pointer">
                                    <CasCategoryIcon category={category} className="w-8 h-8 mb-2" />
                                    <span className="font-semibold">{category}</span>
                                </div>
                            </Label>
                        </FormItem>
                      ))}
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>
        
        <Card>
            <CardHeader>
                <CardTitle>Metas y Resultados</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="personalGoals"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Metas Personales</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="¿Qué esperas lograr con este proyecto?"
                      className="resize-y"
                      {...field}
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="learningOutcomes"
              render={() => (
                <FormItem>
                  <div className="mb-4">
                    <FormLabel className="text-base">Resultados de Aprendizaje</FormLabel>
                    <FormDescription>
                      Selecciona todos los resultados de aprendizaje que buscas alcanzar.
                    </FormDescription>
                  </div>
                  <div className="space-y-2">
                  {learningOutcomes.map(item => (
                    <FormField
                      key={item}
                      control={form.control}
                      name="learningOutcomes"
                      render={({ field }) => {
                        return (
                          <FormItem
                            key={item}
                            className="flex flex-row items-start space-x-3 space-y-0"
                          >
                            <FormControl>
                              <Checkbox
                                checked={field.value?.includes(item)}
                                onCheckedChange={checked => {
                                  return checked
                                    ? field.onChange([...(field.value || []), item])
                                    : field.onChange(
                                        field.value?.filter(
                                          value => value !== item
                                        )
                                      );
                                }}
                              />
                            </FormControl>
                            <FormLabel className="font-normal">{item}</FormLabel>
                          </FormItem>
                        );
                      }}
                    />
                  ))}
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
            </CardContent>
        </Card>

        <Button type="submit" className="w-full md:w-auto" disabled={isPending}>
          {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Crear Proyecto
        </Button>
      </form>
    </Form>
  );
}
