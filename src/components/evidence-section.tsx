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
            title: "Evidence Added (Simulated)",
            description: "Your new evidence has been added to the project.",
        })
    };


  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2 font-headline">
          <Paperclip />
          Project Evidence
        </CardTitle>
        <CardDescription>
          Photos, videos, and documents from your project.
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
                Add Evidence
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <form onSubmit={handleAddEvidence}>
                    <DialogHeader>
                        <DialogTitle>Add New Evidence</DialogTitle>
                        <DialogDescription>
                        Upload a file or link to your evidence. This is a demo, no
                        files will be saved.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="grid gap-4 py-4">
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="title" className="text-right">
                            Title
                        </Label>
                        <Input
                            id="title"
                            placeholder="e.g., Team Planning Session"
                            className="col-span-3"
                        />
                        </div>
                        <div className="grid grid-cols-4 items-center gap-4">
                        <Label htmlFor="file" className="text-right">
                            File
                        </Label>
                        <Input id="file" type="file" className="col-span-3" />
                        </div>
                    </div>
                    <DialogFooter>
                        <DialogTrigger asChild>
                            <Button type="submit">Save Evidence</Button>
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
