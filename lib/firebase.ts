import { initializeApp, getApps, getApp } from "firebase/app"
import { getFirestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, connectAuthEmulator } from "firebase/auth"

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
}

// アプリケーションの初期化
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
const db = getFirestore(app)
const auth = getAuth(app)

// 開発環境の場合はエミュレーターを使用
if (typeof window !== 'undefined' && process.env.NODE_ENV === "development") {
  try {
    connectAuthEmulator(auth, "http://localhost:9099")
    connectFirestoreEmulator(db, 'localhost', 8080)
    console.log("Firebase emulators connected")
  } catch (error) {
    console.error("Firebase emulator connection error:", error)
  }
}

console.log("Firebase Auth initialized:", !!auth)
console.log("Current environment:", process.env.NODE_ENV)
console.log("Firebase project ID:", app.options.projectId)

export { app, db, auth } 