import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
const firebaseConfig = {
  apiKey: "AIzaSyAVx0a3m4MAjcV8DJUvcNMl_Jpbmxn7A2c",
  authDomain: "lalazarfamilyresort.firebaseapp.com",
  projectId: "lalazarfamilyresort",
  storageBucket: "lalazarfamilyresort.firebasestorage.app",
  messagingSenderId: "1010663976601",
  appId: "1:1010663976601:web:3c7b9cac69c072fbfcd208",
  measurementId: "G-8B775V2744"
};


const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

export default app;