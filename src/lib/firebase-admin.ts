
import { initializeApp, getApps, App, cert } from 'firebase-admin/app';
import { getAuth, Auth } from 'firebase-admin/auth';
import { getFirestore, Firestore } from 'firebase-admin/firestore';
import { getStorage, Storage } from 'firebase-admin/storage';
import * as functions from 'firebase-functions';

// --- Singleton instances to avoid re-initialization ---
let adminApp: App | null = null;
let adminAuth: Auth | null = null;
let adminDb: Firestore | null = null;
let adminStorage: Storage | null = null;

function getServiceAccount() {
    // Check if running in Firebase Functions environment
    const functionsConfig = functions.config();
    if (Object.keys(functionsConfig).length && functionsConfig.firebase) {
        console.log('Initializing Admin SDK with Functions config.');
        return functionsConfig.firebase;
    }

    // Fallback for local/server development using prefixed environment variables
    console.log('Initializing Admin SDK with local environment variables.');
    
    const requiredEnvVars = [
        'AUTH_FIREBASE_PROJECT_ID',
        'AUTH_FIREBASE_PRIVATE_KEY',
        'AUTH_FIREBASE_CLIENT_EMAIL',
    ];

    const missingEnvVars = requiredEnvVars.filter(key => !process.env[key]);

    if (missingEnvVars.length > 0) {
        const errorMessage = `Firebase Admin SDK configuration is missing. Check .env.local file. Missing: ${missingEnvVars.join(', ')}`;
        console.error(errorMessage);
        // We throw the error here to ensure the application fails fast if configuration is missing.
        throw new Error(errorMessage);
    }
    
    return {
        projectId: process.env.AUTH_FIREBASE_PROJECT_ID,
        privateKey: process.env.AUTH_FIREBASE_PRIVATE_KEY!.replace(/\\n/g, '\n'),
        clientEmail: process.env.AUTH_FIREBASE_CLIENT_EMAIL,
    };
}

function getStorageBucket() {
    const functionsConfig = functions.config();
    if (Object.keys(functionsConfig).length && functionsConfig.firebase) {
        return functionsConfig.firebase.storageBucket || `${functionsConfig.firebase.projectId}.appspot.com`;
    }
    // Local/server development
    const bucketName = process.env.AUTH_FIREBASE_STORAGE_BUCKET;
     if (!bucketName) {
        const errorMessage = `Firebase Storage bucket name is missing. Please set AUTH_FIREBASE_STORAGE_BUCKET in your .env.local file.`;
        console.error(errorMessage);
        throw new Error(errorMessage);
    }
    return bucketName;
}


function initializeAdmin() {
    const serviceAccount = getServiceAccount();
    const storageBucket = getStorageBucket();

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
