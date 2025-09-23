
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

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

if (typeof window !== 'undefined') {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  } else {
    app = getApp();
  }
  auth = getAuth(app);
  db = getFirestore(app);
}

// @ts-ignore: app, auth, and db will be defined on the client.
export { app, auth, db };
