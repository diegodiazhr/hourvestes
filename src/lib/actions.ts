
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { collection, addDoc, doc, updateDoc, setDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Timestamp } from 'firebase/firestore';

const projectSchema = z.object({
  name: z.string().min(3, { message: 'El nombre debe tener al menos 3 caracteres.' }),
  description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }),
  category: z.enum(['Creatividad', 'Actividad', 'Servicio']),
  dates: z.object({
      from: z.string().transform((str) => new Date(str)),
      to: z.string().optional().transform((str) => str ? new Date(str) : undefined),
  }),
  learningOutcomes: z.string().min(1, { message: 'Debes seleccionar al menos un resultado de aprendizaje.'}).transform((str) => str.split(',')),
  personalGoals: z.string().optional(),
});


export async function createProjectAction(userId: string, formData: FormData) {
  if (!userId) {
    throw new Error('Debes iniciar sesión para crear un proyecto.');
  }

  const rawData = Object.fromEntries(formData);
  const parsedDates = JSON.parse(rawData.dates as string);
  
  const dataToValidate = {
    ...rawData,
    dates: {
        from: parsedDates.from,
        to: parsedDates.to,
    },
    learningOutcomes: rawData.learningOutcomes,
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
      endDate: dates.to ? Timestamp.fromDate(dates.to) : null,
      learningOutcomes,
      personalGoals: personalGoals || '', // Ensure it's an empty string if undefined
      progress: 'Planificación',
      reflections: '',
      evidence: [],
      timeEntries: [],
      userId: userId
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
