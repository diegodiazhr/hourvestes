
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, PlayCircle, StopCircle, Timer } from 'lucide-react';
import type { Project, TimeEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { updateTimeEntriesAction } from '@/lib/actions';

function formatDuration(milliseconds: number) {
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

export function TimeTracker({ project }: { project: Project }) {
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(project.timeEntries || []);
  const [isPending, setIsPending] = useState(false);

  const activeEntry = useMemo(() => timeEntries.find(entry => entry.endTime === null) || null, [timeEntries]);
  
  const totalTime = useMemo(() => {
    return timeEntries.reduce((acc, entry) => {
      if (entry.endTime) {
        const start = new Date(entry.startTime).getTime();
        const end = new Date(entry.endTime).getTime();
        return acc + (end - start);
      }
      return acc;
    }, 0);
  }, [timeEntries]);


  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null;
    if (activeEntry) {
      interval = setInterval(() => {
        const start = new Date(activeEntry.startTime).getTime();
        const now = new Date().getTime();
        setElapsedTime(now - start);
      }, 1000);
    } else {
      setElapsedTime(0);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [activeEntry]);

  const handleTimeUpdate = async (updatedEntries: TimeEntry[]) => {
    setIsPending(true);
    try {
        await updateTimeEntriesAction(project.id, updatedEntries);
        setTimeEntries(updatedEntries);
    } catch (e) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: 'No se pudo actualizar el registro de tiempo.',
        });
    } finally {
        setIsPending(false);
    }
  }

  const handleClockIn = () => {
    if(activeEntry || isPending) return;
    const newEntry: TimeEntry = {
      startTime: new Date().toISOString(),
      endTime: null,
    };
    const updatedEntries = [...timeEntries, newEntry];
    handleTimeUpdate(updatedEntries);
    toast({
      title: '¡Fichaje de entrada!',
      description: 'Has empezado a registrar tu tiempo para este proyecto.',
    });
  };

  const handleClockOut = () => {
    if(!activeEntry || isPending) return;

    const updatedEntries = timeEntries.map(entry =>
      entry.startTime === activeEntry.startTime
        ? { ...entry, endTime: new Date().toISOString() }
        : entry
    );
    handleTimeUpdate(updatedEntries);
    toast({
      title: '¡Fichaje de salida!',
      description: 'Has detenido el registro de tiempo.',
    });
  };

  const displayTime = formatDuration(totalTime + elapsedTime);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Timer />
          Registro de Tiempo
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="text-center bg-muted rounded-lg p-4">
          <p className="text-sm text-muted-foreground">Tiempo Total Registrado</p>
          <p className="text-4xl font-bold font-mono tracking-tighter">{displayTime}</p>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleClockIn} disabled={!!activeEntry || isPending} variant="outline">
                <PlayCircle className="mr-2" /> Fichar
            </Button>
            <Button onClick={handleClockOut} disabled={!activeEntry || isPending} variant="destructive">
                <StopCircle className="mr-2" /> Parar
            </Button>
        </div>
        {activeEntry && (
            <div className="text-center text-sm text-primary animate-pulse">
                <p>Registro en curso...</p>
            </div>
        )}
      </CardContent>
    </Card>
  );
}
