
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

function getFirebaseClient() {
    if (!getApps().length) {
        if (!firebaseConfig.apiKey || !firebaseConfig.projectId) {
            console.error("Firebase config is missing or incomplete. Please check your environment variables.");
            // Return null or throw an error, depending on how you want to handle it.
            // For a client-side app, you might want to show an error message to the user.
            throw new Error("Firebase configuration is missing.");
        }
        app = initializeApp(firebaseConfig);
        auth = getAuth(app);
        db = getFirestore(app);
    } else {
        app = getApp();
        auth = getAuth(app);
        db = getFirestore(app);
    }
    return { app, auth, db };
}

// Initialize on first call
try {
    const client = getFirebaseClient();
    app = client.app;
    auth = client.auth;
    db = client.db;
} catch (e) {
    // This will catch the missing config error on server-side rendering if not careful,
    // but the main usage will be client-side where config should be available.
    console.warn((e as Error).message);
}


// Export instances. They might be undefined if initialization fails.
export { app, auth, db };
