// ベビーマッサージ関連の資格をベビマに変換するスクリプト
const { initializeApp } = require('firebase/app');
const { getFirestore, collection, getDocs, doc, updateDoc } = require('firebase/firestore');
const { getAuth, signInWithEmailAndPassword } = require('firebase/auth');
require('dotenv').config({ path: '.env.local' });

// Firebaseの初期化
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);

// 変換対象の資格種別
const oldTypes = [
  'ベビーマッサージマスター',
  'ベビーマッサージインストラクター',
  'ベビーマッサージ'
];

// 変換先の資格種別
const newType = 'ベビマ';

// 認証と変換を実行する関数
async function authenticateAndConvert() {
  try {
    // 管理者の認証情報（コマンドライン引数または環境変数から取得）
    const email = process.argv[2] || process.env.FIREBASE_ADMIN_EMAIL;
    const password = process.argv[3] || process.env.FIREBASE_ADMIN_PASSWORD;
    
    if (!email || !password) {
      console.error('認証情報が不足しています。');
      console.log('使用方法: node update-members.js メールアドレス パスワード');
      console.log('または、.env.localファイルにFIREBASE_ADMIN_EMAIL、FIREBASE_ADMIN_PASSWORDを設定してください。');
      return;
    }
    
    console.log('Firebase認証中...');
    await signInWithEmailAndPassword(auth, email, password);
    console.log('認証成功。データ変換を開始します。');
    
    // 変換処理を実行
    await convertMemberTypes();
  } catch (error) {
    console.error('認証エラー:', error);
  }
}

// 変換処理
async function convertMemberTypes() {
  try {
    console.log('会員データを取得中...');
    const membersRef = collection(db, 'members');
    const snapshot = await getDocs(membersRef);
    
    if (snapshot.empty) {
      console.log('会員データが見つかりませんでした。');
      return;
    }
    
    console.log(`全${snapshot.size}件の会員データを確認します。`);
    let updatedCount = 0;
    
    // 各会員データを処理
    for (const docSnapshot of snapshot.docs) {
      const member = docSnapshot.data();
      const memberRef = doc(db, 'members', docSnapshot.id);
      
      // typesフィールドがある場合
      if (Array.isArray(member.types)) {
        const oldTypesFound = member.types.filter(type => oldTypes.includes(type));
        if (oldTypesFound.length > 0) {
          // 古い資格種別を削除
          const newTypes = member.types.filter(type => !oldTypes.includes(type));
          // 新しい資格種別を追加（既に存在する場合は追加しない）
          if (!newTypes.includes(newType)) {
            newTypes.push(newType);
          }
          
          // 更新
          await updateDoc(memberRef, { 
            types: newTypes,
            // typeフィールドも更新（配列の最初の要素を使用）
            type: newTypes.length > 0 ? newTypes[0] : ''
          });
          
          console.log(`更新: ${member.name} (ID: ${docSnapshot.id})`);
          console.log(`  変更前: ${member.types.join(', ')}`);
          console.log(`  変更後: ${newTypes.join(', ')}`);
          updatedCount++;
          continue;
        }
      }
      
      // typeフィールドのみがある場合
      if (member.type && oldTypes.includes(member.type)) {
        const types = [newType];
        await updateDoc(memberRef, { 
          type: newType,
          // typesフィールドも設定
          types: types
        });
        
        console.log(`更新: ${member.name} (ID: ${docSnapshot.id})`);
        console.log(`  変更前: ${member.type}`);
        console.log(`  変更後: ${newType}`);
        updatedCount++;
      }
    }
    
    console.log(`更新完了: ${updatedCount}件の会員データを更新しました。`);
  } catch (error) {
    console.error('エラーが発生しました:', error);
  }
}

// 認証付きで実行
authenticateAndConvert()
  .then(() => console.log('全ての処理が完了しました。'))
  .catch(error => console.error('処理中にエラーが発生しました:', error));
