import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, Auth, connectAuthEmulator } from "firebase/auth"

let app: FirebaseApp | undefined;
let db: Firestore | undefined;
let auth: Auth | undefined;

// サーバーサイドレンダリング時は初期化をスキップ
if (typeof window !== 'undefined') {
  try {
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

    // 開発環境の場合はエミュレーターを使用
    if (process.env.NODE_ENV === "development") {
      connectAuthEmulator(auth, "http://localhost:9099")
      connectFirestoreEmulator(db, 'localhost', 8080)
    }
  } catch (error) {
    console.error('Firebase initialization error:', error)
  }
}

export { app, db, auth } 