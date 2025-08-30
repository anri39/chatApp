// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9wGMB5T2g64wVZgrwBn7AXr77qXY8k4U",
  authDomain: "chat-app-6501a.firebaseapp.com",
  projectId: "chat-app-6501a",
  storageBucket: "chat-app-6501a.appspot.com",
  messagingSenderId: "1070440069595",
  appId: "1:1070440069595:web:d37881774ffcfc717c4ffe",
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);

// Export Firebase services
export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export default app;
