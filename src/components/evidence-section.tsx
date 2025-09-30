
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
import { PlusCircle, Paperclip, Loader2, File as FileIcon, Video, Music, Download } from 'lucide-react';
import type { Evidence, Project } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
  DialogClose,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { useState } from 'react';
import { addEvidenceAction } from '@/lib/actions';
import Link from 'next/link';
import { useAuth } from '@/hooks/use-auth';

function EvidenceItem({ item }: { item: Evidence }) {
    const renderContent = () => {
      switch (item.type) {
        case 'image':
          return (
            <Image
              src={item.url}
              alt={item.title}
              width={600}
              height={400}
              className="object-cover w-full h-full transition-transform duration-300 group-hover:scale-105"
            />
          );
        case 'video':
            return <div className="bg-slate-800 h-full w-full flex items-center justify-center"><Video className="h-12 w-12 text-slate-400" /></div>;
        case 'document':
            return <div className="bg-slate-200 h-full w-full flex items-center justify-center"><FileIcon className="h-12 w-12 text-slate-500" /></div>;
        default:
          return <div className="bg-gray-200 h-full w-full flex items-center justify-center"><FileIcon className="h-12 w-12 text-gray-500" /></div>;
      }
    };
  
    return (
        <div key={item.id} className="group relative overflow-hidden rounded-lg aspect-w-4 aspect-h-3">
            {renderContent()}
            <div className="absolute inset-0 bg-black/70 flex flex-col justify-between p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs font-semibold">{item.title}</p>
                <Button asChild size="sm" className="self-end">
                    <Link href={item.url} target="_blank" rel="noopener noreferrer">
                        <Download className="mr-2 h-4 w-4" /> Ver
                    </Link>
                </Button>
            </div>
        </div>
    )
  }
  

export function EvidenceSection({ project }: { project: Project }) {
    const { toast } = useToast();
    const { user } = useAuth();
    const [isPending, setIsPending] = useState(false);
    const [isDialogOpen, setIsDialogOpen] = useState(false);

    const handleAddEvidence = async (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        setIsPending(true);

        if (!user) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes iniciar sesión para añadir evidencia.' });
            setIsPending(false);
            return;
        }

        const formData = new FormData(event.currentTarget);
        const file = formData.get('file') as File;
        const title = formData.get('title') as string;

        if (!file || file.size === 0) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes seleccionar un archivo.' });
            setIsPending(false);
            return;
        }
         if (!title) {
            toast({ variant: 'destructive', title: 'Error', description: 'Debes añadir un título.' });
            setIsPending(false);
            return;
        }

        try {
            const token = await user.getIdToken();
            const result = await addEvidenceAction(project.id, user.uid, token, formData);

            if (result.success) {
                toast({
                    title: "¡Evidencia Añadida!",
                    description: "Tu nueva evidencia ha sido subida y guardada.",
                });
                setIsDialogOpen(false);
            } else {
                toast({
                    variant: 'destructive',
                    title: 'Error al subir evidencia',
                    description: result.error || 'No se pudo procesar la subida.',
                });
            }
        } catch (error: any) {
             toast({
                variant: 'destructive',
                title: 'Error de Autenticación',
                description: error.message || 'No se pudo obtener el token de autenticación.',
            });
        } finally {
            setIsPending(false);
        }
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
        {project.evidence && project.evidence.length > 0 ? (
            <div className="grid grid-cols-2 gap-4">
                {project.evidence.map(item => <EvidenceItem key={item.id} item={item} />)}
            </div>
            ) : (
            <div className="text-center text-sm text-muted-foreground py-8">
                No hay evidencias todavía.
            </div>
         )}

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
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
                            Sube un archivo para documentar tu proyecto.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="title" className="text-right">
                                Título
                            </Label>
                            <Input
                                id="title"
                                name="title"
                                placeholder="p. ej., Sesión de Planificación"
                                className="col-span-3"
                                required
                            />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                            <Label htmlFor="file" className="text-right">
                                Archivo
                            </Label>
                            <Input id="file" name="file" type="file" className="col-span-3" required />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogClose asChild>
                            <Button type="button" variant="secondary" disabled={isPending}>
                                Cancelar
                            </Button>
                        </DialogClose>
                        <Button type="submit" disabled={isPending}>
                            {isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            {isPending ? 'Subiendo...' : 'Guardar Evidencia'}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
}
