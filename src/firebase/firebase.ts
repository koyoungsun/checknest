// src/firebase/firebase.ts
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDLkXhGGNuPrRdIz75wTP9rO4Ix7x7wSGE",
  authDomain: "checknest-web.firebaseapp.com",
  projectId: "checknest-web",
  storageBucket: "checknest-web.appspot.com",
  messagingSenderId: "822662756160",
  appId: "1:822662756160:web:c16f5d5d6e02789e01aca5"
};

// 🔥 Firebase 앱은 딱 한 번만 초기화
const app = initializeApp(firebaseConfig);

// 🔐 Auth
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

// 📦 Firestore
export const db = getFirestore(app);

// 📁 Storage (프로필 이미지용)
export const storage = getStorage(app);