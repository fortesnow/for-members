import { initializeApp, getApps, getApp, FirebaseApp } from "firebase/app"
import { getFirestore, Firestore, connectFirestoreEmulator } from "firebase/firestore"
import { getAuth, Auth, connectAuthEmulator, setPersistence, browserLocalPersistence } from "firebase/auth"

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

    // 認証持続性の設定（ページリロード後も認証状態を維持）
    if (auth) {
      setPersistence(auth, browserLocalPersistence)
        .then(() => {
          console.log("Auth persistence set to LOCAL")
        })
        .catch(error => {
          console.error("Error setting auth persistence:", error)
        })
    }

    // エミュレータ接続（開発環境のみ）
    if (process.env.NODE_ENV === "development" && process.env.USE_EMULATOR === "true") {
      if (auth) connectAuthEmulator(auth, "http://localhost:9099")
      if (db) connectFirestoreEmulator(db, 'localhost', 8080)
    }
    
    // デバッグログは開発環境でのみ表示
    if (process.env.NODE_ENV === "development") {
      console.log("Firebase initialized successfully")
    }
  } catch (error) {
    console.error("Firebase initialization error:", error)
  }
}

// 本番環境ではログ出力を削除
if (process.env.NODE_ENV === "development") {
  console.log("Firebase Auth initialized:", !!auth)
  console.log("Current environment:", process.env.NODE_ENV)
}

export { app, db, auth } 