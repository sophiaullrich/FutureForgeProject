import { initializeApp } from "firebase/app";
import { getAnalytics } from "firebase/analytics";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyDESg4qPECfsld-G8dZ5a0AN3ARSVtUWw8",
  authDomain: "gobear-c15ba.firebaseapp.com",
  databaseURL: "https://gobear-c15ba-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "gobear-c15ba",
  storageBucket: "gobear-c15ba.appspot.com",
  messagingSenderId: "1097677749104",
  appId: "1:1097677749104:web:25e9a2d8720c90ecdaadb5",
  measurementId: "G-PE3YGMH0W3"
};

// Initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
getAnalytics(firebaseApp);

export const auth = getAuth(firebaseApp);
export default firebaseApp;
