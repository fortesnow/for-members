import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth"

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// クライアントサイドでのみ初期化
if (typeof window !== 'undefined') {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  try {
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    db = getFirestore(app)
    auth = getAuth(app)

    // エミュレータ接続を一時的に無効化
    if (process.env.NODE_ENV === "development" && process.env.USE_EMULATOR === "true") {
      connectAuthEmulator(auth, "http://localhost:9099")
      connectFirestoreEmulator(db, 'localhost', 8080)
    }

    console.log("Firebase initialized successfully")
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

console.log("Firebase Auth initialized:", !!auth)
console.log("Current environment:", process.env.NODE_ENV)
console.log("Firebase project ID:", app?.options.projectId)

export { app, db, auth } 