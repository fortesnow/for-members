"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { logout } from "@/lib/actions"

export default function SettingsPage() {
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)

    const formData = new FormData(event.currentTarget)
    const newPassword = formData.get("newPassword") as string
    const confirmPassword = formData.get("confirmPassword") as string

    if (newPassword !== confirmPassword) {
      setError("パスワードが一致しません")
      return
    }

    try {
      toast({
        title: "設定を更新しました",
        description: "新しい認証情報が保存されました。",
        duration: 3000,
      })
      event.currentTarget.reset()
    } catch (err) {
      setError("設定の更新に失敗しました")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-3xl font-bold text-primary">システム設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>共有アカウント設定</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername">新しいユーザーID</Label>
              <Input
                id="newUsername"
                name="newUsername"
                type="text"
                required
                className="rounded-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                required
                className="rounded-full"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                className="rounded-full"
              />
            </div>
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={() => void logout()}
              >
                ログアウト
              </Button>
              <Button type="submit" className="rounded-full">
                設定を保存
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

