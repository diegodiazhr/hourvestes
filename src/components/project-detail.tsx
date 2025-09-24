
'use client';

import { getProject } from '@/lib/data';
import { notFound, useParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { Project } from '@/lib/types';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from '@/components/ui/badge';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { CasCategoryIcon } from '@/components/cas-category-icon';
import { CheckCircle2, Save, Pencil, Undo2 } from 'lucide-react';
import { EvidenceSection } from '@/components/evidence-section';
import { ReflectionPrompts } from '@/components/reflection-prompts';
import { TimeTracker } from '@/components/time-tracker';
import { DashboardSkeleton } from './dashboard-skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal, Loader2 } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { updateProjectDetailsAction } from '@/lib/actions';
import { useToast } from '@/hooks/use-toast';
import { Label } from '@/components/ui/label';

export function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const { toast } = useToast();
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // State for editable fields
  const [description, setDescription] = useState('');
  const [personalGoals, setPersonalGoals] = useState('');
  const [reflections, setReflections] = useState('');
  
  // State for edit modes
  const [isEditingDescription, setIsEditingDescription] = useState(false);
  const [isEditingGoals, setIsEditingGoals] = useState(false);
  const [isEditingReflections, setIsEditingReflections] = useState(false);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        setLoading(true);
        setError(null);
        try {
          const projectData = await getProject(projectId);
          if (projectData) {
            setProject(projectData);
            // Initialize editable fields state
            setDescription(projectData.description);
            setPersonalGoals(projectData.personalGoals);
            setReflections(projectData.reflections);
          } else {
            setError('No se pudo encontrar el proyecto solicitado.');
          }
        } catch (e: any) {
          console.error(e);
          setError('Ocurrió un error al cargar el proyecto.');
        } finally {
          setLoading(false);
        }
      };
      fetchProject();
    }
  }, [projectId]);
  
  const handleSaveChanges = async () => {
    if (!project) return;
    setIsSaving(true);
    try {
        await updateProjectDetailsAction(project.id, {
            description,
            personalGoals,
            reflections
        });
        toast({
            title: '¡Proyecto Actualizado!',
            description: 'Tus cambios han sido guardados correctamente.',
        });
        setIsEditingDescription(false);
        setIsEditingGoals(false);
        setIsEditingReflections(false);

    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'Error al Guardar',
            description: e.message || 'No se pudieron guardar los cambios.',
        });
    } finally {
        setIsSaving(false);
    }
  };

  const cancelEdit = (field: 'description' | 'goals' | 'reflections') => {
      if (!project) return;
      if (field === 'description') {
          setDescription(project.description);
          setIsEditingDescription(false);
      } else if (field === 'goals') {
          setPersonalGoals(project.personalGoals);
          setIsEditingGoals(false);
      } else if (field === 'reflections') {
        setReflections(project.reflections);
        setIsEditingReflections(false);
      }
  }


  if (loading) {
    return <DashboardSkeleton />;
  }

  if (error) {
    return (
        <Alert variant="destructive">
            <Terminal className="h-4 w-4" />
            <AlertTitle>Error al cargar el proyecto</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
        </Alert>
    )
  }

  if (!project) {
    // This case should be covered by the error state, but as a fallback:
    return notFound();
  }

  const isAnythingEditing = isEditingDescription || isEditingGoals || isEditingReflections;

  return (
    <div className="space-y-8">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4">
        <div>
            <h1 className="text-4xl font-bold font-headline text-foreground">
                {project.name}
            </h1>
            <p className="text-muted-foreground capitalize">
            {project.startDate ? format(project.startDate, 'd MMMM, yyyy', { locale: es }) : ''} -{' '}
            {project.endDate
                ? format(project.endDate, 'd MMMM, yyyy', { locale: es })
                : 'Actual'}
            </p>
        </div>
        <div className="flex gap-4 items-center">
             {isAnythingEditing && (
                <Button onClick={handleSaveChanges} disabled={isSaving}>
                    {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Guardar Cambios
                </Button>
             )}
            <Badge
                variant="secondary"
                className="flex items-center gap-2 text-base px-4 py-2 shrink-0 capitalize"
            >
                <CasCategoryIcon
                category={project.category}
                className="h-5 w-5"
                />
                {project.category}
            </Badge>
        </div>
      </div>

      <Separator />

      <div className="grid md:grid-cols-3 gap-8 items-start">
        <div className="md:col-span-2 space-y-8">
          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="font-headline">
                Descripción del Proyecto
              </CardTitle>
               {isEditingDescription ? (
                    <Button variant="ghost" size="sm" onClick={() => cancelEdit('description')}>
                        <Undo2 className="mr-2" /> Cancelar
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingDescription(true)}>
                        <Pencil className="mr-2" /> Editar
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isEditingDescription ? (
                    <>
                        <Label htmlFor="description" className="sr-only">Descripción del Proyecto</Label>
                        <Textarea
                            id="description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Describe tu proyecto..."
                            className="min-h-[120px] text-base"
                        />
                    </>
                ) : (
                    <p className="text-base text-foreground/80 whitespace-pre-wrap min-h-[120px]">{description || 'No hay descripción todavía.'}</p>
                )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="font-headline">
                Metas y Resultados de Aprendizaje
              </CardTitle>
                {isEditingGoals ? (
                    <Button variant="ghost" size="sm" onClick={() => cancelEdit('goals')}>
                        <Undo2 className="mr-2" /> Cancelar
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingGoals(true)}>
                        <Pencil className="mr-2" /> Editar
                    </Button>
                )}
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Metas Personales</h3>
                {isEditingGoals ? (
                    <>
                        <Label htmlFor="personalGoals" className="sr-only">Metas Personales</Label>
                        <Textarea
                            id="personalGoals"
                            value={personalGoals}
                            onChange={(e) => setPersonalGoals(e.target.value)}
                            placeholder="¿Cuáles son tus metas personales para este proyecto?"
                            className="min-h-[100px] text-base"
                        />
                    </>
                ) : (
                    <p className="text-base text-foreground/80 whitespace-pre-wrap min-h-[100px]">{personalGoals || 'No se han definido metas personales.'}</p>
                )}
              </div>
              <Separator />
              <div>
                <h3 className="font-semibold mb-3 text-foreground">
                  Resultados de Aprendizaje Alcanzados
                </h3>
                <ul className="space-y-3">
                  {project.learningOutcomes.map((outcome, i) => (
                    <li key={i} className="flex items-start gap-3">
                      <CheckCircle2 className="h-5 w-5 text-green-500 mt-0.5 shrink-0" />
                      <span className="text-foreground/80">{outcome}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row justify-between items-center">
              <CardTitle className="font-headline">Reflexiones</CardTitle>
                {isEditingReflections ? (
                    <Button variant="ghost" size="sm" onClick={() => cancelEdit('reflections')}>
                        <Undo2 className="mr-2" /> Cancelar
                    </Button>
                ) : (
                    <Button variant="outline" size="sm" onClick={() => setIsEditingReflections(true)}>
                        <Pencil className="mr-2" /> Editar
                    </Button>
                )}
            </CardHeader>
            <CardContent>
                {isEditingReflections ? (
                    <>
                        <Label htmlFor="reflections" className="sr-only">Reflexiones</Label>
                        <Textarea
                            id="reflections"
                            value={reflections}
                            onChange={(e) => setReflections(e.target.value)}
                            placeholder="Escribe aquí tus reflexiones sobre el proyecto..."
                            className="min-h-[200px] text-base"
                        />
                    </>
                ) : (
                     <p className="text-base text-foreground/80 whitespace-pre-wrap min-h-[200px]">{reflections || 'Aún no has escrito ninguna reflexión.'}</p>
                )}
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 sticky top-24">
          <TimeTracker project={project} />
          <EvidenceSection project={project} />
          <ReflectionPrompts project={project} />
        </div>
      </div>
    </div>
  );
}