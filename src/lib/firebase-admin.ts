
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

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

let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function initFirebaseAdmin() {
  if (!serviceAccount.project_id || !serviceAccount.private_key || !serviceAccount.client_email) {
    console.warn(
      'Firebase Admin SDK not initialized. Service account environment variables are missing.'
    );
    return;
  }

  if (getApps().length) {
    adminApp = getApps()[0];
  } else {
    adminApp = initializeApp({
      credential: cert(serviceAccount as any),
    });
  }
  
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
};

initFirebaseAdmin();

export { adminApp, adminAuth, adminDb };
