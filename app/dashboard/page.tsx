"use client"

import { useEffect } from "react"
import { Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, MapPin, Award } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

function LoginNotification() {
  const { toast } = useToast()
  const searchParams = useSearchParams()

  useEffect(() => {
    if (searchParams.get("login") === "success") {
      toast({
        title: "ログイン成功",
        description: "ようこそ、会員管理システムへ",
        duration: 3000,
      })
    }
  }, [searchParams, toast])

  return null
}

export default function DashboardPage() {
  return (
    <div className="space-y-4 p-4 md:space-y-6 md:p-6">
      <Suspense>
        <LoginNotification />
      </Suspense>
      <h1 className="text-2xl font-bold md:text-3xl">ダッシュボード</h1>
      <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 md:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">総会員数</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold md:text-2xl">123</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">資格保有者数</CardTitle>
            <Award className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">45</div>
            <p className="text-xs text-muted-foreground mt-1">
              ベビーマッサージマスター
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">地域別会員数</CardTitle>
            <MapPin className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">35</div>
            <p className="text-xs text-muted-foreground mt-1">
              東京都
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-3 md:grid-cols-2 md:gap-4">
        <Card className="overflow-hidden">
          <CardHeader>
            <CardTitle className="text-lg md:text-xl">資格種別内訳</CardTitle>
          </CardHeader>
          <CardContent className="px-2 md:px-6">
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ベビーマッサージマスター</span>
                <span className="font-medium">45名</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">ベビーヨガインストラクター</span>
                <span className="font-medium">78名</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>地域分布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">東京都</span>
                <span className="font-medium">35名</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">大阪府</span>
                <span className="font-medium">28名</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">その他</span>
                <span className="font-medium">60名</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
} 