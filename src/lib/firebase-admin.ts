
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import * as functions from 'firebase-functions';
import dotenv from 'dotenv';
import path from 'path';

// --- Singleton instances to avoid re-initialization ---
let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;

function getServiceAccount() {
    // Check if running in Firebase Functions environment
    const functionsConfig = functions.config();
    if (Object.keys(functionsConfig).length && functionsConfig.firebase) {
        return functionsConfig.firebase;
    }

    // Fallback for local development: load from .env file
    dotenv.config({ path: path.resolve(process.cwd(), '.env') });
    
    const requiredEnvVars = [
        'FIREBASE_PROJECT_ID',
        'FIREBASE_PRIVATE_KEY',
        'FIREBASE_CLIENT_EMAIL',
    ];

    const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);
    if (missingEnvVars.length > 0) {
        const errorMessage = `Firebase Admin SDK configuration is missing for local development. Check .env file. Missing: ${missingEnvVars.join(', ')}`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    
    return {
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    };
}

function getStorageBucket() {
    const functionsConfig = functions.config();
    if (Object.keys(functionsConfig).length && functionsConfig.firebase) {
        // In production, the bucket name is often part of the service account or default config
        return functionsConfig.firebase.storageBucket || `${functionsConfig.firebase.projectId}.appspot.com`;
    }
    // Local development
    return process.env.FIREBASE_STORAGE_BUCKET;
}


function initializeAdmin() {
    const serviceAccount = getServiceAccount();
    const storageBucket = getStorageBucket();

    if (!storageBucket) {
        const errorMessage = `Firebase Storage bucket name is missing. Please set FIREBASE_STORAGE_BUCKET in your .env file for local development.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }

    if (!getApps().length) {
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
export function getFirebaseAdmin() {
  if (!adminApp) {
    initializeAdmin();
  }
  return { adminAuth: adminAuth!, adminDb: adminDb!, adminApp: adminApp!, adminStorage: adminStorage! };
}
