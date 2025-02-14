import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth"

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// クライアントサイドでのみFirebaseを初期化
if (typeof window !== "undefined") {
  const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  }

  app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
  db = getFirestore(app)
  auth = getAuth(app)

  if (process.env.NODE_ENV === "development") {
    try {
      connectAuthEmulator(auth, "http://localhost:9099")
      connectFirestoreEmulator(db, 'localhost', 8080)
    } catch {
      // エラーは無視
    }
  }
}

export { app, db, auth } 