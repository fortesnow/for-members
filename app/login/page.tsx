"use client"

import { useState } from "react"
import { login } from "@/lib/actions"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/components/ui/use-toast"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const { toast } = useToast()

  async function handleSubmit(formData: FormData) {
    const result = await login(formData)
    
    if (result?.error) {
      setError(result.error)
      toast({
        variant: "destructive",
        title: "エラー",
        description: result.error,
      })
    }
  }

  return (
    <div className="flex h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md space-y-8 bg-white p-8 rounded-xl shadow-lg">
        <div className="text-center">
          <h1 className="text-2xl font-bold">ログイン</h1>
          <p className="text-sm text-muted-foreground mt-2">
            会員管理システムにログイン
          </p>
        </div>

        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Input
              type="email"
              name="email"
              placeholder="メールアドレス"
              required
              className="rounded-full"
            />
          </div>
          <div className="space-y-2">
            <Input
              type="password"
              name="password"
              placeholder="パスワード"
              required
              className="rounded-full"
            />
          </div>
          {error && (
            <p className="text-sm text-red-500">{error}</p>
          )}
          <Button type="submit" className="w-full rounded-full">
            ログイン
          </Button>
        </form>
      </div>
    </div>
  )
}

