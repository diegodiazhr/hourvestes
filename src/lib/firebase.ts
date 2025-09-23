
import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getAnalytics } from "firebase/analytics";

// TODO: It is strongly recommended to move this configuration to environment variables
// for security and flexibility. This is a temporary measure for debugging.
const firebaseConfig = {
  "projectId": "studio-6718836827-4de5a",
  "appId": "1:577171585378:web:740c8bbd265d2f36f0143b",
  "apiKey": "AIzaSyAFMYISF-g2onEeORtvwVxaoONyiHJupl0",
  "authDomain": "studio-6718836827-4de5a.firebaseapp.com",
  "measurementId": "G-ZP3WVY5QMQ",
  "messagingSenderId": "577171585378"
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
