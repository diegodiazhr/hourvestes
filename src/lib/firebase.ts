
import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app";
import { getFirestore, Firestore } from "firebase/firestore";
import { getAuth, Auth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// This config is guaranteed to work in this environment.
const firebaseConfig = {
  "projectId": "studio-6718836827-4de5a",
  "appId": "1:577171585378:web:740c8bbd265d2f36f0143b",
  "apiKey": "AIzaSyAFMYISF-g2onEeORtvwVxaoONyiHJupl0",
  "authDomain": "studio-6718836827-4de5a.firebaseapp.com",
  "measurementId": "G-ZP3WVY5QMQ",
  "messagingSenderId": "577171585378"
};


// Initialize Firebase only on the client side
let app: FirebaseApp;
let db: Firestore;
let auth: Auth;

if (typeof window !== 'undefined') {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    auth = getAuth(app);
}

// @ts-ignore db and auth will be defined on the client.
export { app, db, auth };
