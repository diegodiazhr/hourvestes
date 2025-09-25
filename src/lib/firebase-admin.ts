
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
    const serviceAccount = {
        projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
        privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
    };

    if (!serviceAccount.projectId || !serviceAccount.privateKey || !serviceAccount.clientEmail) {
        throw new Error('Firebase admin credentials not found in environment variables.');
    }

    return serviceAccount;
}

function getStorageBucket() {
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || `${getServiceAccount().projectId}.appspot.com`;
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
