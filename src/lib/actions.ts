
'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { getFirebaseAdmin } from './firebase-admin';
import { LearningOutcome, type Evidence } from './types';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { cookies } from 'next/headers';
import { randomUUID } from 'crypto';
import * as mime from 'mime-types';

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

// Action to add evidence
const EvidenceSchema = z.object({
  title: z.string().min(3, 'El título es requerido.'),
  file: z
    .any()
    .refine(file => file && file.size > 0, 'El archivo no puede estar vacío.'),
});

function getEvidenceType(mimeType: string): Evidence['type'] {
    if (mimeType.startsWith('image/')) return 'image';
    if (mimeType.startsWith('video/')) return 'video';
    if (mimeType === 'application/pdf' || mimeType.startsWith('application/vnd.openxmlformats-officedocument') || mimeType.startsWith('application/msword')) {
        return 'document';
    }
    return 'other';
}


export async function addEvidenceAction(projectId: string, formData: FormData) {
    const { adminDb, adminStorage } = getFirebaseAdmin();
    let uid: string;
    try {
        uid = await getUserIdFromToken();
    } catch (e: any) {
        return { success: false, error: e.message };
    }

    const validatedFields = EvidenceSchema.safeParse({
        title: formData.get('title'),
        file: formData.get('file'),
    });

    if (!validatedFields.success) {
        return { success: false, error: 'Datos de evidencia inválidos.', details: validatedFields.error.flatten() };
    }

    const { title, file } = validatedFields.data;

    // --- Authorization ---
    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();
    if (!projectDoc.exists || projectDoc.data()?.userId !== uid) {
        return { success: false, error: 'Permiso denegado.' };
    }
    // --- End Authorization ---

    try {
        const fileBuffer = Buffer.from(await file.arrayBuffer());
        const fileId = randomUUID();
        const fileExtension = mime.extension(file.type) || file.name.split('.').pop() || '';
        const fileName = `${fileId}.${fileExtension}`;
        const filePath = `evidence/${uid}/${projectId}/${fileName}`;

        const bucket = adminStorage.bucket();
        const storageFile = bucket.file(filePath);
        
        await storageFile.save(fileBuffer, {
            metadata: { contentType: file.type },
        });

        // Make the file public to get a URL
        await storageFile.makePublic();
        const publicUrl = storageFile.publicUrl();

        const newEvidence: Omit<Evidence, 'id' | 'date'> & { date: Timestamp } = {
            title,
            url: publicUrl,
            type: getEvidenceType(file.type),
            fileName: file.name,
            date: Timestamp.now(),
        };

        await projectRef.update({
            evidence: FieldValue.arrayUnion(newEvidence),
        });

        revalidatePath(`/projects/${projectId}`);
        return { success: true, data: { ...newEvidence, id: fileId, date: newEvidence.date.toDate().toISOString() }};

    } catch (error: any) {
        console.error('Error adding evidence:', error);
        return { success: false, error: 'No se pudo subir el archivo. ' + (error.message || '') };
    }
}

const CreateClassSchema = z.object({
  name: z.string().min(3, 'El nombre de la clase debe tener al menos 3 caracteres.'),
});

export async function createClassAction(formData: FormData) {
  const { adminDb } = getFirebaseAdmin();
  const uid = await getUserIdFromToken();
  const userProfile = (await adminDb.collection('users').doc(uid).get()).data();

  if (!userProfile || userProfile.role !== 'Profesor') {
    throw new Error('Solo los profesores pueden crear clases.');
  }

  const validatedFields = CreateClassSchema.safeParse({
    name: formData.get('name'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Nombre de clase inválido.',
      details: validatedFields.error.flatten(),
    };
  }

  try {
    await adminDb.collection('classes').add({
      name: validatedFields.data.name,
      teacherId: uid,
      school: userProfile.school || 'Institución no especificada',
    });
    revalidatePath('/teacher/students');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating class:', error);
    return { success: false, error: 'No se pudo crear la clase.' };
  }
}
