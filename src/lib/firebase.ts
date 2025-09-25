
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID
};


// Singleton pattern to initialize Firebase on the client side
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            // Check if all required config values are present
            if (firebaseConfig.apiKey && firebaseConfig.projectId) {
                app = initializeApp(firebaseConfig);
                auth = getAuth(app);
                db = getFirestore(app);
            } else {
                console.error("Firebase config is missing or incomplete. Please check your environment variables.");
            }
        } else {
            app = getApp();
            auth = getAuth(app);
            db = getFirestore(app);
        }
    }
}

// Initialize on script load
initializeFirebase();

// Export instances. On the server, they will be undefined, which is handled
// by server-side code using firebase-admin.
export { app, auth, db };
