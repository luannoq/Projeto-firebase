import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyArVfxXPCs-EOBtf2m3Nf5J6YwTTvl9WHM",
  authDomain: "cp4-mobile-notas.firebaseapp.com",
  projectId: "cp4-mobile-notas",
  storageBucket: "cp4-mobile-notas.firebasestorage.app",
  messagingSenderId: "655911990375",
  appId: "1:655911990375:web:2138fe643e8781c52b90c2"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);