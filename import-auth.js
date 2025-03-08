// 認証付き会員データインポートスクリプト
const dotenv = require('dotenv');
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, addDoc, Timestamp } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');

// 環境変数をロード
dotenv.config({ path: '.env.local' });

// Firebase設定
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

// Firebaseを初期化
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 会員データは同じなので省略...
const members = []; // 既存の会員データを設定

// 認証してからFirestoreにデータを追加
async function importWithAuth() {
  try {
    const email = process.env.FIREBASE_AUTH_EMAIL || prompt("Firebase認証用メールアドレス: ");
    const password = process.env.FIREBASE_AUTH_PASSWORD || prompt("Firebase認証用パスワード: ");
    
    console.log("Firebaseにログインしています...");
    await signInWithEmailAndPassword(auth, email, password);
    console.log("ログイン成功！");
    
    await addMembers();
  } catch (error) {
    console.error('認証エラー:', error);
  }
}

// Firestoreに追加
async function addMembers() {
  try {
    console.log('会員データの追加を開始します...');
    const membersRef = collection(db, 'members');
    
    for (const member of members) {
      const now = Timestamp.now();
      const newMember = {
        ...member,
        createdAt: now,
        updatedAt: now,
      };
      
      const docRef = await addDoc(membersRef, newMember);
      console.log(`会員を追加しました: ${member.name}, ID: ${docRef.id}`);
    }
    
    console.log('すべての会員データの追加が完了しました！');
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 認証付きインポートを実行
importWithAuth(); 