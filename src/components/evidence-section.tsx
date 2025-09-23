'use client';
import Image from 'next/image';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, Paperclip } from 'lucide-react';
import type { Evidence } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';

export function EvidenceSection({ evidence }: { evidence: Evidence[] }) {
    const { toast } = useToast();

    const handleAddEvidence = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        // In a real app, this would handle file upload and data saving.
        // For this demo, we just show a toast message.
        toast({
            title: "Evidencia Añadida (Simulado)",
            description: "Tu nueva evidencia ha sido añadida al proyecto.",
        })
    };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Paperclip />
          Evidencia del Proyecto
        </CardTitle>
        <CardDescription>
          Fotos, videos y documentos de tu proyecto.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {evidence.map(item => (
              <div
                key={item.id}
                className="group relative overflow-hidden rounded-lg aspect-w-4 aspect-h-3"
              >
                <Image
                  src={item.url}
                  alt={item.title}
                  width={600}
                  height={400}
                  className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
                  data-ai-hint="project evidence"
                />
                <div className="absolute inset-0 bg-black/60 flex items-end p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <p className="text-white text-xs font-semibold">{item.title}</p>
                </div>
              </div>
            ))}
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" />
                Añadir Evidencia
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddEvidence}>
                    <DialogHeader>
                        <DialogTitle>Añadir Nueva Evidencia</DialogTitle>
                        <DialogDescription>
                        Sube un archivo o enlace a tu evidencia. Esto es una demo, no se guardarán archivos.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Título
                        </Label>
                        <Input
                            id="title"
                            placeholder="p. ej., Sesión de Planificación"
                            className="col-span-3"
                        />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">
                            Archivo
                        </Label>
                        <Input id="file" type="file" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogTrigger asChild>
                            <Button type="submit">Guardar Evidencia</Button>
                        </DialogTrigger>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
