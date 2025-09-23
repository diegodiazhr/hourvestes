'use client';

import { useMemo } from 'react';
import type { Project } from '@/lib/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Clock, Hourglass, Target } from 'lucide-react';

const GOAL_HOURS = 300;

export function StatsCards({ projects }: { projects: Project[] }) {
  const totalHours = useMemo(() => {
    const totalMilliseconds = projects.reduce((acc, project) => {
      const projectTime =
        project.timeEntries?.reduce((timeAcc, entry) => {
          if (entry.endTime) {
            const start = new Date(entry.startTime).getTime();
            const end = new Date(entry.endTime).getTime();
            return timeAcc + (end - start);
          }
          return timeAcc;
        }, 0) || 0;
      return acc + projectTime;
    }, 0);

    return Math.round(totalMilliseconds / (1000 * 60 * 60));
  }, [projects]);

  const progressPercentage = Math.min((totalHours / GOAL_HOURS) * 100, 100);
  const hoursRemaining = Math.max(GOAL_HOURS - totalHours, 0);

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Horas Totales</CardTitle>
          <Clock className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{totalHours}h</div>
          <p className="text-xs text-muted-foreground">
            Has completado un total de {totalHours} horas.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Progreso General</CardTitle>
          <Target className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{progressPercentage.toFixed(1)}%</div>
          <Progress value={progressPercentage} className="h-2 mt-2" />
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Horas Restantes</CardTitle>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{hoursRemaining}h</div>
          <p className="text-xs text-muted-foreground">
            Para alcanzar la meta de {GOAL_HOURS} horas.
          </p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Proyectos Activos</CardTitle>
          <Hourglass className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">
            {projects.filter(p => p.progress !== 'Completado').length}
          </div>
          <p className="text-xs text-muted-foreground">
            Proyectos actualmente en curso o planificación.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

    