
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getFirebaseAdmin } from './firebase-admin';
import { LearningOutcome } from './types';
import { Timestamp } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';

async function getUserIdFromToken() {
  const { adminAuth } = getFirebaseAdmin();
  const token = cookies().get('fb-token')?.value;

  if (!token) {
    throw new Error('Authentication token not found.');
  }

  try {
    const decodedToken = await adminAuth.verifyIdToken(token);
    return decodedToken.uid;
  } catch (error) {
    console.error('Error verifying ID token:', error);
    throw new Error('Authentication token is invalid or expired.');
  }
}

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
  personalGoals: z.string().optional(),
});

type ProjectData = z.infer<typeof ProjectDataSchema>;


export async function createProjectAction(data: ProjectData) {
  const { adminDb } = getFirebaseAdmin();
  let uid: string;
  try {
     uid = await getUserIdFromToken();
  } catch(e: any) {
    throw e;
  }


  // Zod validation on the server
  const validatedFields = ProjectDataSchema.safeParse(data);

  if (!validatedFields.success) {
    console.error('Validation failed:', validatedFields.error.flatten().fieldErrors);
    throw new Error('Falló la validación del proyecto.');
  }

  const { name, description, category, dates, learningOutcomes, personalGoals } =
    validatedFields.data;

  try {
    await adminDb.collection('projects').add({
      userId: uid,
      name,
      description,
      category,
      startDate: Timestamp.fromDate(new Date(dates.from)),
      endDate: dates.to ? Timestamp.fromDate(new Date(dates.to)) : null,
      learningOutcomes: learningOutcomes as LearningOutcome[],
      personalGoals: personalGoals || '',
      progress: 'Planificación',
      reflections: '',
      evidence: [],
      timeEntries: [],
    });
  } catch (error) {
    console.error('Error creating project:', error);
    throw new Error('No se pudo crear el proyecto en la base de datos.');
  }

  revalidatePath('/');
}


const UpdateProjectDetailsSchema = z.object({
    description: z.string().min(10, { message: 'La descripción debe tener al menos 10 caracteres.' }).optional(),
    personalGoals: z.string().optional(),
    reflections: z.string().optional(),
});

export async function updateProjectDetailsAction(projectId: string, data: z.infer<typeof UpdateProjectDetailsSchema>) {
    const { adminDb } = getFirebaseAdmin();
    let uid: string;
    try {
        uid = await getUserIdFromToken();
    } catch(e: any) {
        throw e;
    }

    const validatedFields = UpdateProjectDetailsSchema.safeParse(data);

    if (!validatedFields.success) {
        throw new Error('Los datos proporcionados no son válidos.');
    }

    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
        throw new Error('Proyecto no encontrado.');
    }

    if (projectDoc.data()?.userId !== uid) {
        throw new Error('No tienes permiso para editar este proyecto.');
    }

    try {
        await projectRef.update(validatedFields.data);
    } catch (error) {
        console.error('Error updating project:', error);
        throw new Error('No se pudo actualizar el proyecto en la base de datos.');
    }

    revalidatePath(`/projects/${projectId}`);
    revalidatePath('/');
}
