
import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getAuth, type Auth } from "firebase/auth";

const firebaseConfig = {
    "projectId": "studio-6718836827-4de5a",
    "appId": "1:577171585378:web:740c8bbd265d2f36f0143b",
    "apiKey": "AIzaSyAFMYISF-g2onEeORtvwVxaoONyiHJupl0",
    "authDomain": "studio-6718836827-4de5a.firebaseapp.com",
    "measurementId": "G-ZP3WVY5QMQ",
    "messagingSenderId": "577171585378"
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
