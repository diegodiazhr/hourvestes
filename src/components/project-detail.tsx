
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
import { CheckCircle2 } from 'lucide-react';
import { EvidenceSection } from '@/components/evidence-section';
import { ReflectionPrompts } from '@/components/reflection-prompts';
import { TimeTracker } from '@/components/time-tracker';
import { PlaceHolderImages } from '@/lib/placeholder-images';
import { DashboardSkeleton } from './dashboard-skeleton';
import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Terminal } from 'lucide-react';

export function ProjectDetail() {
  const params = useParams();
  const projectId = params.id as string;
  const [project, setProject] = useState<Project | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (projectId) {
      const fetchProject = async () => {
        setLoading(true);
        setError(null);
        try {
          const projectData = await getProject(projectId);
          if (projectData) {
            setProject(projectData);
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
      <div>
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-4 mb-2">
          <h1 className="text-4xl font-bold font-headline text-foreground">
            {project.name}
          </h1>
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
        <p className="text-muted-foreground capitalize">
          {project.startDate ? format(project.startDate, 'd MMMM, yyyy', { locale: es }) : ''} -{' '}
          {project.endDate
            ? format(project.endDate, 'd MMMM, yyyy', { locale: es })
            : 'Actual'}
        </p>
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
              <p className="text-foreground/80 whitespace-pre-wrap">
                {project.description}
              </p>
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
                <p className="text-foreground/80 whitespace-pre-wrap">
                  {project.personalGoals}
                </p>
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
              <p className="text-foreground/80 whitespace-pre-wrap">
                {project.reflections}
              </p>
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
