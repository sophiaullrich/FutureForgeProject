import { initializeApp, getApps, getApp } from "firebase/app";
import {
  getAuth,
  setPersistence,
  browserLocalPersistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getAnalytics, isSupported } from "firebase/analytics";

const firebaseConfig = {
  apiKey: "AIzaSyDESg4qPECfsld-G8dZ5a0AN3ARSVtUWw8",
  authDomain: "gobear-c15ba.firebaseapp.com",
  databaseURL:
    "https://gobear-c15ba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gobear-c15ba",
  storageBucket: "gobear-c15ba.appspot.com",
  messagingSenderId: "1097677749104",
  appId: "1:1097677749104:web:25e9a2d8720c90ecdaadb5",
  measurementId: "G-PE3YGMH0W3",
};


const app = getApps().length ? getApp() : initializeApp(firebaseConfig);



export const auth = getAuth(app);
export const db = getFirestore(app);

// Make auth persist across refreshes for this origin
setPersistence(auth, browserLocalPersistence).catch(() => {
  // ignore if already set or unsupported
});

// Analytics only when supported (and in the browser)
export let analytics = null;
isSupported().then((ok) => {
  if (ok) analytics = getAnalytics(app);
});

// handy debug hook (DevTools):
//   window.__fb.auth.currentUser?.uid
//   window.__fb.app.options.projectId
if (typeof window !== "undefined") {
  window.__fb = { app, auth, db };
}

export default app;
