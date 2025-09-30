
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
  const { adminAuth } = await getFirebaseAdmin();
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
  const { adminDb } = await getFirebaseAdmin();
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
    const { adminDb } = await getFirebaseAdmin();
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
    const { adminDb, adminStorage } = await getFirebaseAdmin();
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

        const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
        if (!bucketName) {
            throw new Error("Firebase Storage bucket name is not configured. Please set NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET environment variable.");
        }
        const bucket = adminStorage.bucket(bucketName);
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
  casEndDate: z.string().refine((date) => !isNaN(Date.parse(date)), { message: "La fecha de finalización es obligatoria."}),
});

export async function createClassAction(formData: FormData) {
  const { adminDb } = await getFirebaseAdmin();
  const uid = await getUserIdFromToken();
  const userProfile = (await adminDb.collection('users').doc(uid).get()).data();

  if (!userProfile || userProfile.role !== 'Profesor') {
    throw new Error('Solo los profesores pueden crear clases.');
  }

  const validatedFields = CreateClassSchema.safeParse({
    name: formData.get('name'),
    casEndDate: formData.get('casEndDate'),
  });

  if (!validatedFields.success) {
    return {
      success: false,
      error: 'Datos de clase inválidos.',
      details: validatedFields.error.flatten(),
    };
  }

  try {
    await adminDb.collection('classes').add({
      name: validatedFields.data.name,
      teacherId: uid,
      school: userProfile.school || 'Institución no especificada',
      casEndDate: Timestamp.fromDate(new Date(validatedFields.data.casEndDate)),
    });
    revalidatePath('/teacher/students');
    return { success: true };
  } catch (error: any) {
    console.error('Error creating class:', error);
    return { success: false, error: 'No se pudo crear la clase.' };
  }
}

const SchoolSettingsSchema = z.object({
    aiEnabled: z.boolean(),
    logoFile: z.any().optional(),
});

export async function updateSchoolSettingsAction(formData: FormData) {
    const { adminDb, adminStorage } = await getFirebaseAdmin();
    const uid = await getUserIdFromToken();

    const aiEnabled = formData.get('aiEnabled') === 'true';
    const logoFile = formData.get('logo');

    const validatedFields = SchoolSettingsSchema.safeParse({ aiEnabled, logoFile });

    if (!validatedFields.success) {
        return { success: false, error: "Datos inválidos.", details: validatedFields.error.flatten() };
    }

    const userProfile = (await adminDb.collection('users').doc(uid).get()).data();
    if (!userProfile || userProfile.role !== 'Profesor') {
        return { success: false, error: 'No autorizado.' };
    }

    const schoolId = userProfile.school;
    const schoolRef = adminDb.collection('schools').doc(schoolId);
    
    let logoUrl: string | undefined = undefined;

    try {
        if (logoFile && logoFile.size > 0) {
            const fileBuffer = Buffer.from(await logoFile.arrayBuffer());
            const fileId = randomUUID();
            const fileExtension = mime.extension(logoFile.type) || 'png';
            const fileName = `logos/${schoolId}-${fileId}.${fileExtension}`;
            
            const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
            if (!bucketName) {
                throw new Error("Firebase Storage bucket name is not configured.");
            }
            const bucket = adminStorage.bucket(bucketName);
            const storageFile = bucket.file(fileName);
            
            await storageFile.save(fileBuffer, { metadata: { contentType: logoFile.type, cacheControl: 'public, max-age=31536000' } });
            await storageFile.makePublic();
            logoUrl = storageFile.publicUrl();
        }

        const currentSchoolDoc = await schoolRef.get();
        const updateData: { aiEnabled: boolean; logoUrl?: string, name?: string, adminTeacherId?: string } = {
            aiEnabled: validatedFields.data.aiEnabled,
        };

        if (logoUrl) {
            updateData.logoUrl = logoUrl;
        }

        if (!currentSchoolDoc.exists) {
            updateData.name = schoolId;
            updateData.adminTeacherId = uid;
            await schoolRef.set(updateData);
        } else {
            await schoolRef.update(updateData);
        }

        revalidatePath('/teacher/school');
        revalidatePath('/');
        return { success: true, data: { logoUrl } };
    } catch (error: any) {
        console.error('Error updating school settings: ', error);
        return { success: false, error: 'No se pudieron guardar los ajustes. ' + error.message };
    }
}


const SignupStudentSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(6),
  classCode: z.string().min(8).max(20),
});


export async function signupStudentAction(data: unknown) {
    const { adminAuth, adminDb } = await getFirebaseAdmin();

    const validation = SignupStudentSchema.safeParse(data);
    if (!validation.success) {
        return { success: false, error: "Datos de registro inválidos." };
    }
    
    const { firstName, lastName, email, password, classCode } = validation.data;
    const fullName = `${firstName} ${lastName}`;

    try {
        // 1. Check if class code is valid
        const classRef = adminDb.collection('classes').doc(classCode);
        const classDoc = await classRef.get();

        if (!classDoc.exists) {
            return { success: false, error: "El código de clase no es válido." };
        }
        const classData = classDoc.data();
        if (!classData) {
             return { success: false, error: "No se pudieron obtener los datos de la clase." };
        }

        // 2. Create user in Firebase Auth
        const userRecord = await adminAuth.createUser({
            email,
            password,
            displayName: fullName,
        });

        // 3. Create user profile in Firestore
        await adminDb.collection('users').doc(userRecord.uid).set({
            name: fullName,
            email: email,
            role: 'Alumno',
            school: classData.school,
            teacherId: classData.teacherId,
            classId: classDoc.id,
        });

        revalidatePath('/teacher/students');
        return { success: true };

    } catch (error: any) {
        console.error('Student signup error:', error);
        if (error.code === 'auth/email-already-exists') {
            return { success: false, error: "Este correo electrónico ya está en uso." };
        }
        if (error.code === 'auth/invalid-password') {
            return { success: false, error: "La contraseña debe tener al menos 6 caracteres." };
        }
        return { success: false, error: "Ocurrió un error inesperado durante el registro." };
    }
}

// Admin action
const CreateSchoolSchema = z.object({
    schoolName: z.string().min(3, "El nombre de la institución es requerido."),
    teacherEmail: z.string().email("El correo del profesor no es válido."),
    teacherName: z.string().min(2, "El nombre del profesor es requerido."),
});

export async function createSchoolAndInviteTeacherAction(adminUid: string, formData: FormData) {
    const { adminDb, adminAuth } = await getFirebaseAdmin();

    const adminProfile = (await adminDb.collection('users').doc(adminUid).get()).data();
    if (!adminProfile || adminProfile.role !== 'Administrador') {
        return { success: false, error: 'No tienes permisos de administrador.' };
    }

    const validation = CreateSchoolSchema.safeParse({
        schoolName: formData.get('schoolName'),
        teacherEmail: formData.get('teacherEmail'),
        teacherName: formData.get('teacherName'),
    });

    if (!validation.success) {
        return { success: false, error: "Datos inválidos.", details: validation.error.flatten() };
    }

    const { schoolName, teacherEmail, teacherName } = validation.data;

    try {
        // Use a transaction to ensure all or nothing
        await adminDb.runTransaction(async (transaction) => {
            const schoolRef = adminDb.collection('schools').doc(schoolName);
            const schoolDoc = await transaction.get(schoolRef);

            if (schoolDoc.exists) {
                throw new Error(`La institución "${schoolName}" ya existe.`);
            }
            
            // Create a temporary password. The user will be forced to change it.
            const tempPassword = randomUUID().substring(0, 8);
            const teacherRecord = await adminAuth.createUser({
                email: teacherEmail,
                password: tempPassword,
                displayName: teacherName,
            });

            // In a real app, you would email this link to the user.
            // const actionLink = await adminAuth.generatePasswordResetLink(teacherEmail);
            console.log(`ACTION LINK FOR ${teacherEmail}: Set initial password with temp password: ${tempPassword}`);

            const teacherProfile = {
                name: teacherName,
                email: teacherEmail,
                role: 'Profesor' as const,
                school: schoolName,
            };
            transaction.set(adminDb.collection('users').doc(teacherRecord.uid), teacherProfile);

            const schoolData = {
                name: schoolName,
                adminTeacherId: teacherRecord.uid,
                aiEnabled: false,
            };
            transaction.set(schoolRef, schoolData);
        });

        revalidatePath('/'); // Revalidate admin dashboard
        return { success: true, data: { schoolName, teacherEmail } };

    } catch (error: any) {
        console.error("Error creating school and inviting teacher:", error);
        if (error.code === 'auth/email-already-exists') {
             return { success: false, error: 'El correo del profesor ya está en uso.' };
        }
        return { success: false, error: error.message || "Ocurrió un error inesperado." };
    }
}
