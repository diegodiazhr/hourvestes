
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const TimeEntrySchema = z.object({
  startTime: z.string(), // Use string validation, ISO format is handled by `new Date()`
  endTime: z.string().nullable(),
});

const UpdateRequestSchema = z.object({
  timeEntries: z.array(TimeEntrySchema),
});


export async function POST(request: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  
  try {
    const { adminAuth, adminDb } = getFirebaseAdmin();
    const authorization = request.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized. No bearer token provided.' }, { status: 401 });
    }

    const token = authorization.substring(7);
    const decodedToken = await adminAuth.verifyIdToken(token);
    const uid = decodedToken.uid;

    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists || projectDoc.data()?.userId !== uid) {
      return NextResponse.json({ message: 'Permission denied. You do not own this project.' }, { status: 403 });
    }

    const body = await request.json();
    const validation = UpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.flatten() }, { status: 400 });
    }
    
    await projectRef.update({
      timeEntries: validation.data.timeEntries,
    });

    // Revalidate paths to reflect updated data immediately
    revalidatePath(`/projects/${projectId}`);
    revalidatePath(`/`);

    return NextResponse.json({ message: 'Time entries updated successfully' });

  } catch (error: any) {
    console.error('Error in /api/projects/[id]/time:', error);
    
    if (error.code === 'auth/id-token-expired' || error.code === 'auth/argument-error') {
        return NextResponse.json({ message: 'Invalid authentication token.' }, { status: 401 });
    }

    if (error instanceof z.ZodError) {
        return NextResponse.json({ message: 'Invalid request body', errors: error.flatten() }, { status: 400 });
    }

    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
