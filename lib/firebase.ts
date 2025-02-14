import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth"

let app: FirebaseApp | undefined
let db: Firestore | undefined
let auth: Auth | undefined

// クライアントサイドでのみFirebaseを初期化
if (typeof window !== 'undefined') {
  try {
    // Firebase設定の検証
    const requiredEnvVars = [
      'NEXT_PUBLIC_FIREBASE_API_KEY',
      'NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN',
      'NEXT_PUBLIC_FIREBASE_PROJECT_ID',
    ] as const

    for (const envVar of requiredEnvVars) {
      if (!process.env[envVar]) {
        throw new Error(`${envVar} is not set in environment variables`)
      }
    }

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
    app = !getApps().length ? initializeApp(firebaseConfig) : getApp()
    db = getFirestore(app)
    auth = getAuth(app)

    console.log("Firebase Auth initialized:", !!auth) // デバッグ用
    console.log("Current environment:", process.env.NODE_ENV) // デバッグ用

    // 開発環境の場合はエミュレーターを使用
    if (process.env.NODE_ENV === "development") {
      connectAuthEmulator(auth, "http://localhost:9099")
      connectFirestoreEmulator(db, 'localhost', 8080)
      console.log("Firebase emulators connected")
    } else {
      console.log("Firebase initialized with project:", app.options.projectId)
    }
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

export { app, db, auth } 