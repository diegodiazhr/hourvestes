'use client';
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, PlayCircle, StopCircle, Timer } from 'lucide-react';
import type { Project, TimeEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';

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
  const [activeEntry, setActiveEntry] = useState<TimeEntry | null>(null);
  const [totalTime, setTotalTime] = useState(0);
  const [elapsedTime, setElapsedTime] = useState(0);

  useEffect(() => {
    const active = timeEntries.find(entry => entry.endTime === null) || null;
    setActiveEntry(active);

    const calculateTotalTime = () => {
      return timeEntries.reduce((acc, entry) => {
        if (entry.endTime) {
          const start = new Date(entry.startTime).getTime();
          const end = new Date(entry.endTime).getTime();
          return acc + (end - start);
        }
        return acc;
      }, 0);
    };
    setTotalTime(calculateTotalTime());
  }, [timeEntries]);

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

  const handleClockIn = () => {
    if(activeEntry) return;
    const newEntry: TimeEntry = {
      startTime: new Date().toISOString(),
      endTime: null,
    };
    // In a real app, this would be persisted to a database
    setTimeEntries([...timeEntries, newEntry]);
    toast({
      title: '¡Fichaje de entrada!',
      description: 'Has empezado a registrar tu tiempo para este proyecto.',
    });
  };

  const handleClockOut = () => {
    if(!activeEntry) return;

    const updatedEntries = timeEntries.map(entry =>
      entry.startTime === activeEntry.startTime
        ? { ...entry, endTime: new Date().toISOString() }
        : entry
    );
     // In a real app, this would be persisted to a database
    setTimeEntries(updatedEntries);
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
            <Button onClick={handleClockIn} disabled={!!activeEntry} variant="outline">
                <PlayCircle className="mr-2" /> Fichar
            </Button>
            <Button onClick={handleClockOut} disabled={!activeEntry} variant="destructive">
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
