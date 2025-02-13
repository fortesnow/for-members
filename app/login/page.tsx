"use client"

import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { login } from "@/lib/actions"
import { useToast } from "@/components/ui/use-toast"
import { useState } from "react"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      const result = await login(formData)
      if (result.error) {
        toast({
          variant: "destructive",
          title: "エラー",
          description: result.error,
        })
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="grid min-h-screen place-items-center bg-gradient-to-br from-orange-50 via-white to-amber-50">
      <div className="w-full max-w-[380px] space-y-8 px-4">
        <div className="space-y-4">
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-orange-600 to-amber-600 bg-clip-text text-transparent sm:text-4xl">
              会員管理システム
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              ✨ ログインしてはじめる ✨
            </p>
          </div>
        </div>

        <Card className="border-none shadow-lg backdrop-blur-sm bg-white/90">
          <CardContent className="p-6 sm:p-8">
            <form action={handleSubmit} className="space-y-6">
              <div className="space-y-2">
                <Label 
                  htmlFor="username" 
                  className="text-sm font-medium text-gray-700 sm:text-base"
                >
                  ユーザーID
                </Label>
                <div className="relative">
                  <Input
                    id="username"
                    name="username"
                    type="text"
                    required
                    placeholder="admin"
                    className="h-12 pl-10 rounded-xl border-gray-200 bg-orange-50/50 text-base transition-colors focus:bg-white focus:border-orange-500"
                    disabled={isLoading}
                    autoComplete="username"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    👤
                  </span>
                </div>
              </div>
              <div className="space-y-2">
                <Label 
                  htmlFor="password"
                  className="text-sm font-medium text-gray-700 sm:text-base"
                >
                  パスワード
                </Label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    required
                    className="h-12 pl-10 rounded-xl border-gray-200 bg-orange-50/50 text-base transition-colors focus:bg-white focus:border-orange-500"
                    disabled={isLoading}
                    autoComplete="current-password"
                  />
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
                    🔒
                  </span>
                </div>
              </div>
              <Button 
                type="submit" 
                className="h-12 w-full rounded-xl text-base font-semibold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 transition-all duration-300"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ログイン中...
                  </>
                ) : (
                  "ログイン"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

