// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: "chirimoya-crochet.firebaseapp.com",
  projectId: "chirimoya-crochet",
  storageBucket: "chirimoya-crochet.firebasestorage.app",
  messagingSenderId: "1004525565097",
  appId: "1:1004525565097:web:72ad3ebfa6ddfbd0bda5b8",
  measurementId: "G-S55XFTKMH2"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()
export const db = getFirestore(app)