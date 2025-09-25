
'use server';

import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

// --- Singleton instances to avoid re-initialization ---
let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;

function getServiceAccount() {
    const privateKeyRaw = process.env.AUTH_FIREBASE_PRIVATE_KEY;

    if (!privateKeyRaw) {
        throw new Error('Firebase private key not found in environment variables.');
    }
    
    // This is the robust way to handle the private key, which can be formatted differently
    // in local .env files vs. production environment variables.
    // It ensures the final key has the correct newlines for parsing.
    const privateKey = privateKeyRaw.replace(/\\n/g, '\n');

    const serviceAccount = {
        projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
        privateKey,
        clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
    };

    if (!serviceAccount.projectId || !serviceAccount.clientEmail) {
        throw new Error('Firebase project ID or client email not found in environment variables.');
    }

    return serviceAccount;
}

function getStorageBucket() {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${process.env.AUTH_FIREBASE_PROJECT_ID}.appspot.com`;
    if (!bucketName) {
        throw new Error('Firebase Storage bucket name could not be determined.');
    }
    return bucketName;
}


function initializeAdmin() {
  if (adminApp) {
    return;
  }

  const serviceAccount = getServiceAccount();
  const storageBucket = getStorageBucket();

  if (getApps().length === 0) {
    adminApp = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: storageBucket,
    });
  } else {
    adminApp = getApps()[0];
  }
    
  adminAuth = getAuth(adminApp);
  adminDb = getFirestore(adminApp);
  adminStorage = getStorage(adminApp);
}

// Export a function that initializes and returns the admin instances
export async function getFirebaseAdmin() {
  if (!adminApp) {
    initializeAdmin();
  }
  return { adminAuth: adminAuth!, adminDb: adminDb!, adminApp: adminApp!, adminStorage: adminStorage! };
}
