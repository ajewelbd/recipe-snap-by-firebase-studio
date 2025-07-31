// Import the functions you need from the SDKs you need
import { initializeApp, getApp, getApps, type FirebaseApp } from "firebase/app";
import { getFirestore, type Firestore } from "firebase/firestore";
import { getStorage, type FirebaseStorage } from "firebase/storage";
import { getAuth, type Auth } from "firebase/auth";

// Your web app's Firebase configuration
export const firebaseConfig = {
  projectId: "recipe-snap-zavua",
  appId: "1:187840532515:web:f70fdc459f89529448e196",
  storageBucket: "recipe-snap-zavua.appspot.com",
  apiKey: "AIzaSyDXg3B03aFLASL_CbhA8E9bl9f9EB_emOc",
  authDomain: "recipe-snap-zavua.firebaseapp.com",
  messagingSenderId: "187840532515",
};

// Initialize Firebase
const app: FirebaseApp = getApps().length ? getApp() : initializeApp(firebaseConfig);

const firestore: Firestore = getFirestore(app);
const storage: FirebaseStorage = getStorage(app);
const auth: Auth = getAuth(app);


export { app, firestore, storage, auth };