
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';

// Singleton instances to avoid re-initialization
let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;

function initializeAdmin() {
    const serviceAccount = {
        type: process.env.FIREBASE_TYPE,
        project_id: process.env.FIREBASE_PROJECT_ID,
        private_key_id: process.env.FIREBASE_PRIVATE_KEY_ID,
        private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        client_email: process.env.FIREBASE_CLIENT_EMAIL,
        client_id: process.env.FIREBASE_CLIENT_ID,
        auth_uri: process.env.FIREBASE_AUTH_URI,
        token_uri: process.env.FIREBASE_TOKEN_URI,
        auth_provider_x509_cert_url: process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        client_x509_cert_url: process.env.FIREBASE_CLIENT_X509_CERT_URL
    };

    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
    ];

    const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

    if (missingEnvVars.length > 0) {
        const errorMessage = `Firebase Admin SDK configuration is missing. Check server environment variables. Missing: ${missingEnvVars.join(', ')}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    if (!getApps().length) {
        adminApp = initializeApp({
          credential: cert(serviceAccount as any),
        });
      } else {
        adminApp = getApps()[0];
      }
      
    adminAuth = getAuth(adminApp);
    adminDb = getFirestore(adminApp);
}

// Export a function that initializes and returns the admin instances
export function getFirebaseAdmin() {
  if (!adminApp) {
    initializeAdmin();
  }
  return { adminAuth: adminAuth!, adminDb: adminDb!, adminApp: adminApp! };
}
