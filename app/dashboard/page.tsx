"use client"

import { useEffect, useState } from "react"
import { getMembers } from "@/lib/db"
import type { Member } from "@/lib/db"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Award, MapPin } from "lucide-react"

export default function DashboardPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 開発環境ではダミーデータを使用
    if (process.env.NODE_ENV === "development") {
      setMembers([
        {
          id: "1",
          name: "テストユーザー1",
          furigana: "てすとゆーざー1",
          type: "ベビーマッサージマスター",
          phone: "090-1234-5678",
          prefecture: "大阪府",
          number: "23-0001",
        },
        // 必要に応じて追加のダミーデータ
      ])
      setIsLoading(false)
      return
    }

    // 本番環境では実際のデータを取得
    async function loadMembers() {
      try {
        const data = await getMembers()
        setMembers(data)
      } catch (error) {
        console.error("Error loading members:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadMembers()
  }, [])

  // 資格種別ごとの会員数を集計
  const qualificationCounts = members.reduce((acc, member) => {
    acc[member.type] = (acc[member.type] || 0) + 1
    return acc
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