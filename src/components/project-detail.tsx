
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
import { CheckCircle2, Save } from 'lucide-react';
import { EvidenceSection } from '@/components/evidence-section';
import { ReflectionPrompts } from '@/components/reflection-prompts';
import { TimeTracker } from '@/components/time-tracker';
import { PlaceHolderImages } from '@/lib/placeholder-images';
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

  // Use placeholder evidence for now
  const evidence = PlaceHolderImages.map((img, index) => ({
    id: img.id,
    title: img.description,
    url: img.imageUrl,
    type: 'image' as 'image' | 'video' | 'document',
    date: new Date(),
  }));

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
            <Button onClick={handleSaveChanges} disabled={isSaving}>
                {isSaving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                Guardar Cambios
            </Button>
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
            <CardHeader>
              <CardTitle className="font-headline">
                Descripción del Proyecto
              </CardTitle>
            </CardHeader>
            <CardContent>
                <Label htmlFor="description" className="sr-only">Descripción del Proyecto</Label>
                <Textarea
                    id="description"
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Describe tu proyecto..."
                    className="min-h-[120px] text-base"
                />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="font-headline">
                Metas y Resultados de Aprendizaje
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="font-semibold mb-2 text-foreground">Metas Personales</h3>
                <Label htmlFor="personalGoals" className="sr-only">Metas Personales</Label>
                 <Textarea
                    id="personalGoals"
                    value={personalGoals}
                    onChange={(e) => setPersonalGoals(e.target.value)}
                    placeholder="¿Cuáles son tus metas personales para este proyecto?"
                    className="min-h-[100px] text-base"
                />
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
            <CardHeader>
              <CardTitle className="font-headline">Reflexiones</CardTitle>
            </CardHeader>
            <CardContent>
                <Label htmlFor="reflections" className="sr-only">Reflexiones</Label>
                <Textarea
                    id="reflections"
                    value={reflections}
                    onChange={(e) => setReflections(e.target.value)}
                    placeholder="Escribe aquí tus reflexiones sobre el proyecto..."
                    className="min-h-[200px] text-base"
                />
            </CardContent>
          </Card>
        </div>

        <div className="space-y-8 sticky top-24">
          <TimeTracker project={project} />
          <EvidenceSection evidence={evidence} />
          <ReflectionPrompts project={project} />
        </div>
      </div>
    </div>
  );
}
