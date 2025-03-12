"use client"

import { useEffect, useState } from "react"
import type { Member } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, MapPin, BookOpen } from "lucide-react"
import { onSnapshot, collection, query, orderBy } from "firebase/firestore"
import { db } from "@/lib/firebase"
import Link from "next/link"

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

  // 講師として登録されているメンバーをフィルタリング
  const instructors = members.filter(member => member.isInstructor)

  return (
    <div className="space-y-8 px-1 py-4 md:px-4 md:py-6">
      <header className="border-b border-accent pb-4 mb-6">
        <h1 className="text-3xl">会員管理ダッシュボード</h1>
        <p className="text-muted-foreground mt-3">現在の会員情報と分布を確認できます</p>
      </header>

      <div className="grid gap-6 md:grid-cols-3">
        {/* 総会員数 */}
        <Card className="overflow-hidden border-accent/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-accent/20">
            <CardTitle className="text-sm font-medium">総会員数</CardTitle>
            <Users className="h-5 w-5 text-primary/80" />
          </CardHeader>
          <CardContent className="pt-6">
            <div className="text-3xl font-serif font-medium">{members.length}<span className="text-lg ml-1">名</span></div>
            <p className="text-xs text-muted-foreground mt-2">登録されているすべての会員</p>
          </CardContent>
        </Card>

        {/* 資格種別の分布 */}
        <Card className="overflow-hidden border-accent/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-accent/20">
            <CardTitle className="text-sm font-medium">資格種別</CardTitle>
            <Award className="h-5 w-5 text-primary/80" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {Object.entries(qualificationCounts).map(([type, count]) => (
                <div key={type} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">{type}</span>
                  <div className="flex items-center">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden mr-3">
                      <div 
                        className="h-full bg-primary/70 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (count / members.length) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="font-serif">{count}<span className="text-xs ml-0.5">名</span></span>
                  </div>
                </div>
              ))}
              {Object.keys(qualificationCounts).length === 0 && (
                <div className="text-sm text-muted-foreground italic">データがありません</div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* 地域分布 */}
        <Card className="overflow-hidden border-accent/40 shadow-sm hover:shadow-md transition-shadow duration-300">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 bg-accent/20">
            <CardTitle className="text-sm font-medium">地域分布</CardTitle>
            <MapPin className="h-5 w-5 text-primary/80" />
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-3">
              {Object.entries(regionCounts).map(([prefecture, count]) => (
                <div key={prefecture} className="flex justify-between items-center text-sm">
                  <span className="text-muted-foreground font-medium">{prefecture}</span>
                  <div className="flex items-center">
                    <div className="w-16 h-1.5 bg-secondary rounded-full overflow-hidden mr-3">
                      <div 
                        className="h-full bg-primary/70 rounded-full" 
                        style={{ 
                          width: `${Math.min(100, (count / members.length) * 100)}%` 
                        }}
                      />
                    </div>
                    <span className="font-serif">{count}<span className="text-xs ml-0.5">名</span></span>
                  </div>
                </div>
              ))}
              {Object.keys(regionCounts).length === 0 && (
                <div className="text-sm text-muted-foreground italic">データがありません</div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 講師一覧 */}
      <Card className="border-accent/40 shadow-sm overflow-hidden">
        <CardHeader className="bg-accent/20">
          <div className="flex items-center justify-between">
            <CardTitle className="text-primary text-lg">講師担当</CardTitle>
            <BookOpen className="h-5 w-5 text-primary/80" />
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          {instructors.length > 0 ? (
            <div className="space-y-5">
              {instructors.map((instructor) => (
                <div key={instructor.id} className="flex items-center justify-between border-b border-accent/30 pb-4">
                  <div>
                    <div className="font-medium">{instructor.name}</div>
                    <div className="text-xs text-muted-foreground mt-0.5">{instructor.furigana}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-sm">
                      <span className="inline-flex items-center justify-center rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium">
                        {instructor.instructorDetails?.specialties?.join(', ') || '専門分野未設定'}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-1.5 flex items-center justify-end">
                      <MapPin className="h-3 w-3 mr-1 inline-block" /> 
                      {instructor.prefecture}
                    </div>
                  </div>
                  <div className="ml-4">
                    <Link href={`/members/${instructor.id}`} className="text-primary hover:text-primary/80 text-sm underline">
                      詳細
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground">登録されている講師はいません</p>
              <p className="text-sm mt-2">
                会員詳細画面から講師として設定することができます
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {isLoading && (
        <div className="flex justify-center py-8">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-primary border-t-transparent"></div>
        </div>
      )}
    </div>
  )
} 