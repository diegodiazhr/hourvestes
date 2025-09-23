
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { collection, addDoc, doc, updateDoc, arrayUnion } from 'firebase/firestore';
import { db } from './firebase';
import { Timestamp } from 'firebase/firestore';

const projectSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(['Creatividad', 'Actividad', 'Servicio']),
  dates: z.object({
      from: z.date(),
      to: z.date().optional(),
  }),
  learningOutcomes: z.array(z.string()).min(1),
  personalGoals: z.string().optional(),
});

export async function createProjectAction(formData: FormData) {
  const rawData = Object.fromEntries(formData);
  const parsedDates = JSON.parse(rawData.dates as string);
  
  const dataToValidate = {
    name: rawData.name,
    description: rawData.description,
    category: rawData.category,
    dates: {
        from: new Date(parsedDates.from),
        to: parsedDates.to ? new Date(parsedDates.to) : undefined,
    },
    learningOutcomes: (rawData.learningOutcomes as string).split(','),
    personalGoals: rawData.personalGoals,
  };

  const validatedFields = projectSchema.safeParse(dataToValidate);

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    throw new Error('Falló la validación del proyecto.');
  }

  const { name, description, category, dates, learningOutcomes, personalGoals } = validatedFields.data;

  try {
    await addDoc(collection(db, 'projects'), {
      name,
      description,
      category,
      startDate: Timestamp.fromDate(dates.from),
      endDate: dates.to ? Timestamp.fromDate(dates.to) : Timestamp.fromDate(dates.from),
      learningOutcomes,
      personalGoals: personalGoals || '',
      progress: 'Planificación',
      reflections: '',
      evidence: [],
      timeEntries: [],
    });
  } catch (error) {
    console.error("Error creating project:", error);
    throw new Error('No se pudo crear el proyecto en la base de datos.');
  }

  revalidatePath('/');
  redirect('/');
}

export async function updateTimeEntriesAction(projectId: string, timeEntries: any[]) {
    const projectRef = doc(db, 'projects', projectId);
    try {
        await updateDoc(projectRef, {
            timeEntries: timeEntries
        });
        revalidatePath(`/projects/${projectId}`);
        revalidatePath(`/`);
    } catch (error) {
        console.error("Error updating time entries:", error);
        throw new Error('No se pudieron actualizar las entradas de tiempo.');
    }
}
