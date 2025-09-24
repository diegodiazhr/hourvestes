'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Wand2, Loader2, Sparkles } from 'lucide-react';
import { generateReflectionPrompts } from '@/ai/flows/intelligent-reflection-prompts';
import type { Project } from '@/lib/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Terminal } from 'lucide-react';
import { useAuth } from '@/hooks/use-auth';

export function ReflectionPrompts({ project }: { project: Project }) {
  const { schoolSettings } = useAuth();
  const [prompts, setPrompts] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleGenerate = async () => {
    setIsLoading(true);
    setError(null);
    setPrompts([]);
    try {
      const input = {
        projectType: project.category,
        projectProgress: project.progress,
        studentGoals: project.personalGoals,
        projectDescription: project.description,
      };
      const result = await generateReflectionPrompts(input);
      setPrompts(result.reflectionPrompts);
    } catch (e) {
      setError('No se pudieron generar las sugerencias. Por favor, inténtalo de nuevo.');
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  if (!schoolSettings?.aiEnabled) {
    return null;
  }

  return (
    <Card className="bg-accent/20 border-accent/50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline text-accent-foreground">
          <Sparkles className="text-amber-500" />
          Asistente de Reflexión
        </CardTitle>
        <CardDescription>
          Usa la IA para obtener sugerencias de reflexión personalizadas para tu proyecto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex flex-col gap-4">
          <Button onClick={handleGenerate} disabled={isLoading} className="bg-accent hover:bg-accent/90 text-accent-foreground">
            {isLoading ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Wand2 className="mr-2 h-4 w-4" />
            )}
            {isLoading ? 'Generando...' : 'Generar Sugerencias'}
          </Button>

          {error && (
            <Alert variant="destructive">
              <Terminal className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {prompts.length > 0 && (
            <div className="mt-4 space-y-3">
              <h4 className="font-semibold text-foreground">
                Aquí tienes algunas sugerencias para empezar:
              </h4>
              <ul className="list-disc list-inside space-y-2 text-sm text-foreground/80">
                {prompts.map((prompt, index) => (
                  <li key={index}>{prompt}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
