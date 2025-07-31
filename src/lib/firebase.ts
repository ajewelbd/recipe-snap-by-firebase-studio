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
const getAppInstance = (): FirebaseApp => {
    if (!getApps().length) {
        return initializeApp(firebaseConfig);
    }
    return getApp();
}

export const getFirestoreInstance = (): Firestore => {
    return getFirestore(getAppInstance());
}

export const getStorageInstance = (): FirebaseStorage => {
    return getStorage(getAppInstance());
}

export const getAuthInstance = (): Auth => {
    return getAuth(getAppInstance());
}
