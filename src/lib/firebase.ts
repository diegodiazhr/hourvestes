
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
    "projectId": process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    "appId": process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    "apiKey": process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    "authDomain": process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    "measurementId": process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
    "messagingSenderId": process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    "storageBucket": process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
};


// Singleton pattern to initialize Firebase on the client side
let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

function initializeFirebase() {
    if (typeof window !== 'undefined') {
        if (!getApps().length) {
            app = initializeApp(firebaseConfig);
        } else {
            app = getApp();
        }
        auth = getAuth(app);
        db = getFirestore(app);
    }
}

// Initialize on script load
initializeFirebase();

// Export instances. On the server, they will be undefined, which is handled
// by server-side code using firebase-admin.
export { app, auth, db };
