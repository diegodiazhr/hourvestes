import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyAFMYISF-g2onEeORtvwVxaoONyiHJupl0",
  authDomain: "studio-6718836827-4de5a.firebaseapp.com",
  projectId: "studio-6718836827-4de5a",
  storageBucket: "studio-6718836827-4de5a.firebasestorage.app",
  messagingSenderId: "577171585378",
  appId: "1:577171585378:web:740c8bbd265d2f36f0143b",
  measurementId: "G-ZP3WVY5QMQ"
};

// Initialize Firebase
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const db = getFirestore(app);
const auth = getAuth(app);
// In a real app, you would check if window is defined before calling this
// but for the sake of this example we will assume it is.
// if (typeof window !== 'undefined') {
//     getAnalytics(app);
// }


export { app, db, auth };
