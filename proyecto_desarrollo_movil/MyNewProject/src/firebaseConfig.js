import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getAuth } from 'firebase/auth';
import { getStorage } from 'firebase/storage'; // Importa Firebase Storage

const firebaseConfig = {
  apiKey: "AIzaSyDAoR0jNR5gNJOPtJayLpp_nXbZRprseAA",
  authDomain: "battaglia-db.firebaseapp.com",
  projectId: "battaglia-db",
  storageBucket: "battaglia-db.appspot.com",
  messagingSenderId: "900186092659",
  appId: "1:900186092659:android:3b763b04cba2d051086606",
};

// Inicializa Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
// Inicializa Firestore
export const db = getFirestore(app);
// Inicializa Firebase Storage
export const storage = getStorage(app); // Exporta el objeto de Storage