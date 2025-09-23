
'use server';

import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { Timestamp } from 'firebase/firestore';
import { LearningOutcome } from './types';
import { getSession } from './session';

// Define the shape of the data coming from the form
const ProjectDataSchema = z.object({
  name: z.string().min(3),
  description: z.string().min(10),
  category: z.enum(['Creatividad', 'Actividad', 'Servicio']),
  dates: z.object({
      from: z.string(), // ISO string
      to: z.string().optional(), // ISO string
  }),
  learningOutcomes: z.array(z.string()),
  personalGoals: z.string(),
});

type ProjectData = z.infer<typeof ProjectDataSchema>;

export async function createProjectAction(data: ProjectData) {
  const session = await getSession();

  if (!session) {
    throw new Error('Debes iniciar sesión para crear un proyecto.');
  }

  // Zod validation on the server
  const validatedFields = ProjectDataSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    throw new Error('Falló la validación del proyecto.');
  }

  const { name, description, category, dates, learningOutcomes, personalGoals } = validatedFields.data;

  try {
    await addDoc(collection(db, 'projects'), {
      userId: session.uid,
      name,
      description,
      category,
      startDate: Timestamp.fromDate(new Date(dates.from)),
      endDate: dates.to ? Timestamp.fromDate(new Date(dates.to)) : null,
      learningOutcomes: learningOutcomes as LearningOutcome[],
      personalGoals,
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
