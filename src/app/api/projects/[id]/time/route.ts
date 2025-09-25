
import { NextResponse } from 'next/server';
import { getFirebaseAdmin } from '@/lib/firebase-admin';
import { revalidatePath } from 'next/cache';
import { z } from 'zod';

const TimeEntrySchema = z.object({
  startTime: z.string().datetime(),
  endTime: z.string().datetime().nullable(),
  manual: z.boolean().optional(),
  durationHours: z.number().optional(),
});

const UpdateRequestSchema = z.object({
  timeEntries: z.array(TimeEntrySchema),
});


export async function POST(request: Request, { params }: { params: { id: string } }) {
  const projectId = params.id;
  
  try {
    // 1. Authentication
    const { adminAuth, adminDb } = await getFirebaseAdmin();
    const authorization = request.headers.get('Authorization');

    if (!authorization?.startsWith('Bearer ')) {
      return NextResponse.json({ message: 'Unauthorized. No bearer token provided.' }, { status: 401 });
    }

    const token = authorization.substring(7);
    let decodedToken;
    try {
        decodedToken = await adminAuth.verifyIdToken(token);
    } catch (error: any) {
        console.error('Error verifying ID token:', error);
        return NextResponse.json({ message: 'Unauthorized. Invalid token.' }, { status: 401 });
    }
    
    const uid = decodedToken.uid;

    // 2. Authorization (Check Project Ownership)
    const projectRef = adminDb.collection('projects').doc(projectId);
    const projectDoc = await projectRef.get();

    if (!projectDoc.exists) {
      return NextResponse.json({ message: 'Project not found.' }, { status: 404 });
    }

    if (projectDoc.data()?.userId !== uid) {
      return NextResponse.json({ message: 'Permission denied. You do not own this project.' }, { status: 403 });
    }

    // 3. Validation
    const body = await request.json();
    const validation = UpdateRequestSchema.safeParse(body);

    if (!validation.success) {
      return NextResponse.json({ message: 'Invalid request body', errors: validation.error.flatten() }, { status: 400 });
    }
    
    // 4. Update
    await projectRef.update({
      timeEntries: validation.data.timeEntries,
    });

    // 5. Revalidate and Respond
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
