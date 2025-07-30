// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { getAuth, GoogleAuthProvider } from "firebase/auth";

// Your web app's Firebase configuration
const firebaseConfig = {
  projectId: "recipe-snap-zavua",
  appId: "1:187840532515:web:f70fdc459f89529448e196",
  storageBucket: "recipe-snap-zavua.firebasestorage.app",
  apiKey: "AIzaSyDXg3B03aFLASL_CbhA8E9bl9f9EB_emOc",
  authDomain: "recipe-snap-zavua.firebaseapp.com",
  messagingSenderId: "187840532515",
};

// Initialize Firebase for SSR
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
const firestore = getFirestore(app);
const storage = getStorage(app);
const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export { app, firestore, storage, auth, googleProvider };
