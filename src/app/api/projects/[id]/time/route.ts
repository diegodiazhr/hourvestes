
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const TimeEntrySchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable(),
});

const UpdateRequestSchema = z.object({
  timeEntries: z.array(TimeEntrySchema),
});


export async function POST(request: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  const { adminAuth, adminDb } = getFirebaseAdmin();

  try {
    const authorization = request.headers.get('Authorization');
    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 401 });
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

  } catch (error) {
    console.error('Error updating time entries:', error);
    if (error instanceof Error && (error.name === 'auth/id-token-expired' || error.name === 'auth/argument-error')) {
        return NextResponse.json({ message: 'Invalid authentication token.' }, { status: 401 });
    }
    return NextResponse.json({ message: 'An internal server error occurred.' }, { status: 500 });
  }
}
