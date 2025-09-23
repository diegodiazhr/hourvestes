
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import { getFirestore } from 'firebase-admin/firestore';

const serviceAccount = {
    "type": "service_account",
    "project_id": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
    "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    "client_email": process.env.FIREBASE_CLIENT_EMAIL,
    "client_id": process.env.FIREBASE_CLIENT_ID,
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
};

function initFirebaseAdmin(): App {
  // Evita que la app crashee en el build si las variables de entorno no están presentes.
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.warn(
      'Firebase Admin SDK non-initialized. Service account environment variables are missing.'
    );
    // Return a dummy app or handle it gracefully, but for server actions, we need it.
    // In a build process, this might be ok, but not for runtime.
    // Throwing an error might be better in some cases.
    throw new Error('Missing Firebase Admin credentials. Cannot initialize Admin SDK.');
  }

  if (getApps().length) {
    return getApps()[0];
  }
  
  return initializeApp({
    credential: cert(serviceAccount as any),
  });
};

export const adminApp = initFirebaseAdmin();
export const adminAuth = getAuth(adminApp);
export const adminDb = getFirestore(adminApp);
