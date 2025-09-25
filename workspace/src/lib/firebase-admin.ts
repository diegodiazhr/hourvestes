
'use server';

import { initializeApp, getApps, App, cert, deleteApp } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';

function getServiceAccount() {
    const privateKeyRaw = process.env.AUTH_FIREBASE_PRIVATE_KEY;

    if (!privateKeyRaw) {
        throw new Error('Firebase private key not found in environment variables.');
    }
    
    // Replace literal \n with actual newlines for Vercel compatibility
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
    const bucketName = process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET;
    if (!bucketName) {
        throw new Error('Firebase Storage bucket name could not be determined. Make sure NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET is set.');
    }
    return bucketName;
}

// Export a function that initializes and returns the admin instances
// This approach is safer for serverless environments like Vercel
export async function getFirebaseAdmin() {
  const appName = 'firebase-admin-app-serverless';
  // Check if the app is already initialized
  let app = getApps().find(a => a.name === appName);

  if (!app) {
    const serviceAccount = getServiceAccount();
    const storageBucket = getStorageBucket();
    
    app = initializeApp({
      credential: cert(serviceAccount),
      storageBucket: storageBucket,
    }, appName);
  }

  const adminAuth = getAuth(app);
  const adminDb = getFirestore(app);
  const adminStorage = getStorage(app);
  
  return { adminAuth, adminDb, adminApp: app, adminStorage };
}
