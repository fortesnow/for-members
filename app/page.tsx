"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { login } from "@/lib/actions"

export default function HomePage() {
  const router = useRouter()
  const [error, setError] = useState("")

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError("")

    const formData = new FormData(event.currentTarget)
    const result = await login(formData)

    if (result.error) {
      setError(result.error)
    } else {
      router.push("/dashboard")
      router.refresh()
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-2 text-center">
          <CardTitle className="text-2xl font-bold text-primary">会員管理システム</CardTitle>
          <p className="text-sm text-muted-foreground">ログインしてください</p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="username">ユーザーID</Label>
              <Input id="username" name="username" type="text" required className="rounded-full" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">パスワード</Label>
              <Input id="password" name="password" type="password" required className="rounded-full" />
            </div>
            {error && <p className="text-sm text-destructive text-center">{error}</p>}
            <Button type="submit" className="w-full rounded-full">
              ログイン
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
