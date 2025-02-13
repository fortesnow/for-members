"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { updateCredentials, logout } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"

export default function SettingsPage() {
  const { toast } = useToast()
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const result = await updateCredentials(formData)

    if (result.error) {
      setError(result.error)
    } else {
      toast({
        title: "設定を更新しました",
        description: "新しい認証情報が保存されました。",
      })
      // フォームをリセット
      event.currentTarget.reset()
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-4 space-y-6">
      <h1 className="text-3xl font-bold text-primary">システム設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>共有アカウント設定</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="newUsername">新しいユーザーID</Label>
              <Input id="newUsername" name="newUsername" type="text" required className="rounded-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <Input id="newPassword" name="newPassword" type="password" required className="rounded-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">パスワード（確認）</Label>
              <Input id="confirmPassword" name="confirmPassword" type="password" required className="rounded-full" />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <div className="flex justify-end space-x-4">
              <Button type="button" variant="outline" className="rounded-full" onClick={() => logout()}>
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

