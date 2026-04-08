import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getAuth, GoogleAuthProvider } from 'firebase/auth'

const firebaseConfig = {
  apiKey: "AIzaSyDBA-hUQvrBQnYOzz12NzXsufm1WM6kfAM",
  authDomain: "assam-innovates.firebaseapp.com",
  projectId: "assam-innovates",
  storageBucket: "assam-innovates.firebasestorage.app",
  messagingSenderId: "754997835032",
  appId: "1:754997835032:web:337ac4011addeb9f991a6d"
}

const app = initializeApp(firebaseConfig)
export const db   = getFirestore(app)
export const auth = getAuth(app)
export const googleProvider = new GoogleAuthProvider()