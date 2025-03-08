// 会員データのインポート実行用のファイル
import * as dotenv from 'dotenv';
import { initializeApp } from 'firebase/app';
import { getFirestore, collection, addDoc, Timestamp } from 'firebase/firestore';

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

// 会員データ
const members = [
  {
    name: "小松 沙織",
    furigana: "こまつ さおり",
    types: ["ベビーマッサージマスター", "ベビーヨガマスター"],
    type: "ベビーマッサージマスター",
    number: "19-00002",
    phone: "",
    prefecture: "",
    address: "",
  },
  {
    name: "桐谷 舞",
    furigana: "きりたに まい",
    types: ["ベビーマッサージマスター", "ベビーヨガマスター"],
    type: "ベビーマッサージマスター",
    phone: "090-9874-4033",
    prefecture: "大阪府",
    address: "大阪市淀川区新高4-3-11",
    number: "19-00003",
  },
  {
    name: "𠮷田 絢視",
    furigana: "よしだ あやみ",
    types: ["ベビーマッサージインストラクター", "ベビーヨガインストラクター"],
    type: "ベビーマッサージインストラクター",
    phone: "070-2422-8583",
    prefecture: "大阪府",
    address: "大阪市鶴見区放出東2-7-3 ブランシュネージュ101",
    number: "19-00004",
  },
  {
    name: "灘友 千紘",
    furigana: "なだとも ちひろ",
    types: ["ベビーヨガインストラクター"],
    type: "ベビーヨガインストラクター",
    phone: "090-4122-7293",
    prefecture: "京都府",
    address: "京都府向日市寺戸町寺田５０－１－４２１",
    number: "20-00005",
  },
  {
    name: "朝田 海瑠",
    furigana: "あさだ みる",
    types: ["ベビーマッサージ"],
    type: "ベビーマッサージ",
    phone: "",
    prefecture: "",
    address: "",
    number: "19-00005",
  },
  {
    name: "三原 亜里沙",
    furigana: "みはら ありさ",
    types: ["ベビーマッサージインストラクター", "ベビーヨガインストラクター"],
    type: "ベビーマッサージインストラクター",
    phone: "",
    prefecture: "",
    address: "",
    number: "19-00006",
  },
  {
    name: "中野 遥乃",
    furigana: "",
    types: ["ベビーマッサージインストラクター", "ベビーヨガインストラクター"],
    type: "ベビーマッサージインストラクター",
    phone: "",
    prefecture: "",
    address: "",
    number: "",
  },
  {
    name: "和田 久子",
    furigana: "わだ ひさこ",
    types: ["ベビーヨガインストラクター"],
    type: "ベビーヨガインストラクター",
    phone: "",
    prefecture: "",
    address: "",
    number: "20-00007",
  },
  {
    name: "松尾 ちか",
    furigana: "まつお ちか",
    types: ["ベビーマッサージインストラクター"],
    type: "ベビーマッサージインストラクター",
    phone: "",
    prefecture: "",
    address: "",
    number: "",
  },
  {
    name: "塚本 美穂",
    furigana: "",
    types: ["ベビーマッサージ", "ベビーヨガ"],
    type: "ベビーマッサージ",
    phone: "",
    prefecture: "",
    address: "",
    number: "",
  },
  // 残りのメンバーデータ...
  {
    name: "磯山 かおり",
    furigana: "いそやま かおり",
    types: ["開業サポート講座"],
    type: "開業サポート講座",
    phone: "",
    prefecture: "",
    address: "",
    number: "2304",
  }
];

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

// 会員データを追加
addMembers(); 