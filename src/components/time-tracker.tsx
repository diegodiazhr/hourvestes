
'use client';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, PlayCircle, StopCircle, Timer, PlusCircle, Calendar as CalendarIcon, Loader2, ListCollapse } from 'lucide-react';
import type { Project, TimeEntry } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/hooks/use-auth';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { es } from 'date-fns/locale';
import { format, formatDistanceToNowStrict } from 'date-fns';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

function formatDuration(milliseconds: number) {
  if (milliseconds < 0) milliseconds = 0;
  const totalSeconds = Math.floor(milliseconds / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes
    .toString()
    .padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function ManualTimeEntryDialog({ onAddTime }: { onAddTime: (date: Date, hours: number) => void }) {
    const [date, setDate] = useState<Date | undefined>(new Date());
    const [hours, setHours] = useState('');
    const [isOpen, setIsOpen] = useState(false);
    const { toast } = useToast();

    const handleSave = () => {
        const numHours = parseFloat(hours);
        if (!date || !hours || isNaN(numHours) || numHours <= 0 || numHours > 24) {
            toast({
                variant: 'destructive',
                title: 'Datos inválidos',
                description: 'Por favor, selecciona una fecha e introduce un número de horas válido (entre 0 y 24).',
            });
            return;
        }
        onAddTime(date, numHours);
        setIsOpen(false);
        setDate(new Date());
        setHours('');
    }

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="outline" size="sm"><PlusCircle className="mr-2"/>Añadir Manualmente</Button>
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Añadir Tiempo Manualmente</DialogTitle>
                    <DialogDescription>
                        Registra horas que no cronometraste en tiempo real.
                    </DialogDescription>
                </DialogHeader>
                <div className="space-y-4 py-4">
                    <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                         <Popover>
                            <PopoverTrigger asChild>
                                <Button
                                variant={'outline'}
                                className={cn(
                                    "w-full justify-start text-left font-normal",
                                    !date && "text-muted-foreground"
                                )}
                                >
                                <CalendarIcon className="mr-2 h-4 w-4" />
                                {date ? format(date, "PPP", { locale: es}) : <span>Elige una fecha</span>}
                                </Button>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0">
                                <Calendar
                                mode="single"
                                selected={date}
                                onSelect={setDate}
                                initialFocus
                                locale={es}
                                disabled={(d) => d > new Date() || d < new Date("1900-01-01")}
                                />
                            </PopoverContent>
                        </Popover>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="hours">Horas Dedicadas</Label>
                        <Input 
                            id="hours" 
                            type="number"
                            value={hours}
                            onChange={(e) => setHours(e.target.value)}
                            placeholder="p. ej. 2.5"
                        />
                    </div>
                </div>
                <DialogFooter>
                    <DialogClose asChild><Button type="button" variant="secondary">Cancelar</Button></DialogClose>
                    <Button onClick={handleSave}>Guardar Tiempo</Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}

export function TimeTracker({ project }: { project: Project }) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(project.timeEntries || []);
  const [isUpdating, setIsUpdating] = useState(false);

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
    if (!user) {
        toast({
            variant: 'destructive',
            title: 'Error de autenticación',
            description: 'Debes iniciar sesión para registrar tiempo.',
        });
        return;
    }

    setIsUpdating(true);
    try {
        const token = await user.getIdToken();
        const response = await fetch(`/api/projects/${project.id}/time`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`,
          },
          body: JSON.stringify({ timeEntries: updatedEntries }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.message || 'No se pudo actualizar el registro de tiempo.');
        }

        setTimeEntries(updatedEntries.sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime()));
    } catch (e: any) {
        toast({
            variant: 'destructive',
            title: 'Error',
            description: e.message || 'No se pudo actualizar el registro de tiempo.',
        });
    } finally {
        setIsUpdating(false);
    }
  }

  const handleClockIn = () => {
    if(activeEntry || isUpdating) return;
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
    if(!activeEntry || isUpdating) return;

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

  const handleAddManualTime = (date: Date, hours: number) => {
    const durationMs = hours * 60 * 60 * 1000;
    const startTime = date.toISOString();
    const endTime = new Date(date.getTime() + durationMs).toISOString();

    const newEntry: TimeEntry = {
        startTime,
        endTime,
        manual: true,
        durationHours: hours
    };
    const updatedEntries = [...timeEntries, newEntry];
    handleTimeUpdate(updatedEntries);
    toast({
        title: '¡Tiempo añadido!',
        description: `Se han añadido ${hours} horas el día ${format(date, "d 'de' MMMM", { locale: es })}.`
    })
  }

  const displayTime = formatDuration(totalTime + elapsedTime);

  const sortedEntries = useMemo(() => {
    return [...timeEntries].sort((a, b) => new Date(b.startTime).getTime() - new Date(a.startTime).getTime());
  }, [timeEntries]);

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
          <div className="text-4xl font-bold font-mono tracking-tighter flex items-center justify-center gap-2">
            {isUpdating ? <Loader2 className="h-8 w-8 animate-spin" /> : displayTime }
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
            <Button onClick={handleClockIn} disabled={!!activeEntry || isUpdating} variant="outline">
                <PlayCircle className="mr-2" /> Fichar
            </Button>
            <Button onClick={handleClockOut} disabled={!activeEntry || isUpdating} variant="destructive">
                <StopCircle className="mr-2" /> Parar
            </Button>
        </div>
        <div className="flex justify-center">
            <ManualTimeEntryDialog onAddTime={handleAddManualTime} />
        </div>
        {activeEntry && (
            <div className="text-center text-sm text-primary animate-pulse">
                <p>Registro en curso...</p>
            </div>
        )}
        <Separator />
        <div className="space-y-3">
            <h4 className="font-semibold flex items-center gap-2 text-sm text-muted-foreground"><ListCollapse /> Historial de Actividad</h4>
            {sortedEntries.length > 0 ? (
                <div className="space-y-2 max-h-48 overflow-y-auto pr-2">
                    {sortedEntries.map(entry => {
                         const durationMs = new Date(entry.endTime!).getTime() - new Date(entry.startTime).getTime();
                         const durationStr = formatDistanceToNowStrict(new Date().getTime() - durationMs, { locale: es, unit: 'hour' });
                        
                        return (
                            <div key={entry.startTime} className="flex justify-between items-center text-sm p-2 rounded-md bg-muted/50">
                                <div>
                                    <p className="font-medium">{format(new Date(entry.startTime), "d MMM, yyyy", { locale: es })}</p>
                                    <p className="text-xs text-muted-foreground">{entry.manual ? 'Entrada manual' : `De ${format(new Date(entry.startTime), 'HH:mm')} a ${format(new Date(entry.endTime!), 'HH:mm')}`}</p>
                                </div>
                                <div className="font-mono text-right">
                                    {formatDuration(durationMs)}
                                </div>
                            </div>
                        )
                    })}
                </div>
            ) : (
                <p className="text-sm text-muted-foreground text-center py-4">No hay registros de tiempo todavía.</p>
            )}
        </div>
      </CardContent>
    </Card>
  );
}
