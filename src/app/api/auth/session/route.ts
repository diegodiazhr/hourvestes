
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { encrypt, decrypt } from '@/lib/auth-crypt';
import { auth } from 'firebase-admin';
import { initFirebaseAdmin } from '@/lib/firebase-admin';

initFirebaseAdmin();

// Set session
export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null);
  const idToken = body?.idToken || request.headers.get('Authorization')?.split('Bearer ')[1];

  if (!idToken) {
    return NextResponse.json({ isLogged: false }, { status: 400 });
  }

  try {
    const decodedIdToken = await auth().verifyIdToken(idToken);
    const expiresIn = 60 * 60 * 24 * 5 * 1000; // 5 days
    const session = await encrypt({ ...decodedIdToken, uid: decodedIdToken.uid });

    cookies().set('session', session, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      sameSite: 'lax',
    });

    return NextResponse.json({ isLogged: true }, { status: 200 });
  } catch (error) {
    console.error('Error verifying ID token:', error);
    return NextResponse.json({ isLogged: false, error: 'Invalid token' }, { status: 401 });
  }
}

// Get session
export async function GET(request: NextRequest) {
  const session = await decrypt(cookies().get('session')?.value);
  if (!session) {
    return NextResponse.json({ isLogged: false }, { status: 401 });
  }
  return NextResponse.json({ isLogged: true, user: session }, { status: 200 });
}

// Delete session
export async function DELETE(request: NextRequest) {
  cookies().delete('session');
  return NextResponse.json({ isLogged: false }, { status: 200 });
}
