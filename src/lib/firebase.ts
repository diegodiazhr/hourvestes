import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  "projectId": "studio-6718836827-4de5a",
  "appId": "1:577171585378:web:740c8bbd265d2f36f0143b",
  "apiKey": "AIzaSyAFMYISF-g2onEeORtvwVxaoONyiHJupl0",
  "authDomain": "studio-6718836827-4de5a.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "577171585378"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);

export { app, db, auth };
