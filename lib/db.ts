import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  getDocs,
  getDoc,
  query,
  where,
  orderBy,
  Timestamp,
} from "firebase/firestore"
import { db } from "./firebase"

export interface Member {
  id?: string
  name: string
  furigana: string
  type?: string
  types?: string[]
  phone: string
  prefecture: string
  number: string
  email?: string
  address?: string
  postalCode?: string
  streetAddress?: string
  notes?: string
  instructor?: string  // 担当講師
  enrollmentDate?: string  // 受講年月
  isInstructor?: boolean
  instructorDetails?: {
    specialties?: string[]
    experience?: number
    bio?: string
  }
  createdAt?: Timestamp
  updatedAt?: Timestamp
}

// 会員一覧を取得
export async function getMembers() {
  if (!db) throw new Error("Firestore is not initialized")

  try {
    const membersRef = collection(db, "members")
    const q = query(membersRef, orderBy("createdAt", "desc"))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Member[]
  } catch (error) {
    console.error("Error getting members:", error)
    throw new Error("会員情報の取得に失敗しました")
  }
}

// 会員を追加
export async function addMember(member: Omit<Member, "id" | "createdAt" | "updatedAt">) {
  if (!db) throw new Error("Firestore is not initialized")

  try {
    const membersRef = collection(db, "members")
    const now = Timestamp.now()
    const newMember = {
      ...member,
      createdAt: now,
      updatedAt: now,
    }
    const docRef = await addDoc(membersRef, newMember)
    return docRef.id
  } catch (error) {
    console.error("Error adding member:", error)
    throw new Error("会員の追加に失敗しました")
  }
}

// 会員を更新
export async function updateMember(id: string, member: Partial<Member>) {
  if (!db) throw new Error("Firestore is not initialized")

  try {
    const memberRef = doc(db, "members", id)
    const updates = {
      ...member,
      updatedAt: Timestamp.now(),
    }
    await updateDoc(memberRef, updates)
  } catch (error) {
    console.error("Error updating member:", error)
    throw new Error("会員情報の更新に失敗しました")
  }
}

// 会員を削除
export async function deleteMember(id: string) {
  if (!db) throw new Error("Firestore is not initialized")

  try {
    const memberRef = doc(db, "members", id)
    await deleteDoc(memberRef)
  } catch (error) {
    console.error("Error deleting member:", error)
    throw new Error("会員の削除に失敗しました")
  }
}

// 会員を検索
export async function searchMembers(searchTerm: string) {
  if (!db) throw new Error("Firestore is not initialized")

  try {
    const membersRef = collection(db, "members")
    const q = query(
      membersRef,
      where("furigana", ">=", searchTerm),
      where("furigana", "<=", searchTerm + "\uf8ff")
    )
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Member[]
  } catch (error) {
    console.error("Error searching members:", error)
    throw new Error("会員の検索に失敗しました")
  }
}

// 会員詳細を取得
export async function getMember(id: string) {
  if (!db) throw new Error("Firestore is not initialized")

  try {
    const memberRef = doc(db, "members", id)
    const snapshot = await getDoc(memberRef)
    if (!snapshot.exists()) {
      throw new Error("会員が見つかりません")
    }
    return {
      id: snapshot.id,
      ...snapshot.data()
    } as Member
  } catch (error) {
    console.error("Error getting member:", error)
    throw new Error("会員情報の取得に失敗しました")
  }
}

// 講師として登録されているメンバーを取得
export async function getInstructors() {
  if (!db) throw new Error("Firestore is not initialized")

  try {
    const membersRef = collection(db, "members")
    const q = query(membersRef, where("isInstructor", "==", true))
    const snapshot = await getDocs(q)
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })) as Member[]
  } catch (error) {
    console.error("Error getting instructors:", error)
    throw new Error("講師情報の取得に失敗しました")
  }
}

// 認定証番号を新しいフォーマットに変換する関数
export function formatCertificateNumber(number: string): string {
  // 数字でない場合はそのまま返す
  if (!/^\d+$/.test(number)) {
    return number;
  }
  
  // 4桁未満の場合はそのまま返す
  if (number.length < 4) {
    return number;
  }
  
  // 最初の2桁を抽出
  const prefix = number.slice(0, 2);
  
  // 残りの数字を抽出し、3桁になるように0埋め
  const suffix = number.slice(2).padStart(3, '0');
  
  // 新しいフォーマットで返す（xx-00xxx）
  return `${prefix}-${suffix.padStart(5, '0')}`;
} 