"use client"

import { useEffect, useState } from "react"
import type { Member } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, MapPin } from "lucide-react"
import { onSnapshot, collection, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Firestoreからリアルタイムでデータを取得
    if (!db) {
      console.error("Firestore is not initialized")
      setIsLoading(false)
      return
    }

    // クリーンアップ関数を準備
    let unsubscribe: () => void = () => {}

    try {
      const membersRef = collection(db, "members")
      const q = query(membersRef, orderBy("createdAt", "desc"))
      
      // リアルタイムリスナーをセットアップ
      unsubscribe = onSnapshot(q, (snapshot) => {
        const memberData = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        })) as Member[]
        
        setMembers(memberData)
        setIsLoading(false)
      }, (error) => {
        console.error("Realtime data error:", error)
        setIsLoading(false)
      })
    } catch (error) {
      console.error("Error setting up realtime listener:", error)
      setIsLoading(false)
    }

    // コンポーネントのアンマウント時にリスナーを解除
    return () => unsubscribe()
  }, [])

  // 資格種別ごとの会員数を集計
  const qualificationCounts = members.reduce((acc, member) => {
    // types配列がある場合はそれぞれをカウント、なければtypeをカウント
    if (member.types?.length) {
      member.types.forEach(type => {
        acc[type] = (acc[type] || 0) + 1;
      });
    } else if (member.type) {
      acc[member.type] = (acc[member.type] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>)

  // 地域ごとの会員数を集計
  const regionCounts = members.reduce((acc, member) => {
    acc[member.prefecture] = (acc[member.prefecture] || 0) + 1
    return acc
  }, {} as Record<string, number>)

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">ダッシュボード</h1>

      <div className="grid gap-4 md:grid-cols-3">
        {/* 総会員数 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総会員数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{members.length}名</div>
          </CardContent>
        </Card>

        {/* 資格種別の分布 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">資格種別</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(qualificationCounts).map(([type, count]) => (
              <div key={type} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{type}</span>
                <span className="font-medium">{count}名</span>
              </div>
            ))}
            {Object.keys(qualificationCounts).length === 0 && (
              <div className="text-sm text-muted-foreground">データがありません</div>
            )}
          </CardContent>
        </Card>

        {/* 地域分布 */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">地域分布</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Object.entries(regionCounts).map(([prefecture, count]) => (
              <div key={prefecture} className="flex justify-between text-sm">
                <span className="text-muted-foreground">{prefecture}</span>
                <span className="font-medium">{count}名</span>
              </div>
            ))}
            {Object.keys(regionCounts).length === 0 && (
              <div className="text-sm text-muted-foreground">データがありません</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* 最近の登録 */}
      <Card>
        <CardHeader>
          <CardTitle>最近の登録</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {members.slice(0, 5).map((member) => (
              <div key={member.id} className="flex items-center justify-between border-b pb-2">
                <div>
                  <div className="font-medium">{member.name}</div>
                  <div className="text-sm text-muted-foreground">{member.furigana}</div>
                </div>
                <div className="text-sm">
                  <div>{member.type}</div>
                  <div className="text-muted-foreground">{member.prefecture}</div>
                </div>
              </div>
            ))}
            {members.length === 0 && (
              <div className="text-sm text-muted-foreground">最近の登録がありません</div>
            )}
          </div>
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
        </div>
      )}
    </div>
  )
} 