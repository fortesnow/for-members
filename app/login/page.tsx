"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useToast } from "@/components/ui/use-toast"
import { signInWithEmailAndPassword } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { FirebaseError } from 'firebase/app'

// プログレスバーのアニメーションを定義
const progressAnimation = `
@keyframes progress-indeterminate {
  0% { transform: translateX(-100%); }
  50% { transform: translateX(0); }
  100% { transform: translateX(100%); }
}
.animate-progress-indeterminate {
  animation: progress-indeterminate 1.5s infinite ease-in-out;
}

@keyframes float {
  0% { transform: translateY(0px); }
  50% { transform: translateY(-10px); }
  100% { transform: translateY(0px); }
}
.animate-float {
  animation: float 6s ease-in-out infinite;
}

@keyframes pulse-light {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}
.animate-pulse-light {
  animation: pulse-light 3s infinite;
}
`;

export default function LoginPage() {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  // Firebase エラーコードを人間が読みやすいメッセージに変換
  const getErrorMessage = (errorCode: string): string => {
    switch (errorCode) {
      case 'auth/wrong-password':
        return "パスワードが正しくありません。再度お試しください。";
      case 'auth/user-not-found':
        return "このメールアドレスは登録されていません。";
      case 'auth/invalid-email':
        return "メールアドレスの形式が正しくありません。";
      case 'auth/too-many-requests':
        return "ログイン試行回数が多すぎます。しばらく時間をおいてから再度お試しください。";
      case 'auth/network-request-failed':
        return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
      default:
        return "ログインに失敗しました。しばらく時間を置いてから再度お試しください。";
    }
  };

  async function handleSubmit(formData: FormData) {
    setIsLoading(true)
    try {
      if (!auth) {
        console.error("Firebase Auth is not initialized")
        throw new Error("認証システムが初期化されていません")
      }

      const email = formData.get("username") as string
      const password = formData.get("password") as string

      try {
        const userCredential = await signInWithEmailAndPassword(auth, email, password)
        
        const token = await userCredential.user.getIdToken()
        const response = await fetch("/api/auth/login", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ token }),
        })

        if (!response.ok) {
          throw new Error("セッションの作成に失敗しました")
        }

        // ログイン成功時のトースト通知
        toast({
          title: "ログイン成功",
          description: `${userCredential.user.email}としてログインしました`,
          variant: "default",
          duration: 3000, // 3秒間表示
        })

        // 少し遅延してからリダイレクト（トーストを表示する時間を確保）
        setTimeout(() => {
          router.push("/dashboard")
        }, 1500)
      } catch (error) {
        if (error instanceof FirebaseError) {
          console.error("Firebase login error:", error.code, error.message)
          throw new Error(getErrorMessage(error.code))
        }
        throw error
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "エラー",
        description: error instanceof Error ? error.message : "ログインに失敗しました",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <>
      <style jsx global>{progressAnimation}</style>
      <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-purple-50 flex items-center justify-center relative overflow-hidden">
        {/* 装飾的な背景要素 */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden opacity-30 pointer-events-none">
          <div className="absolute -top-20 -left-20 w-64 h-64 rounded-full bg-pink-200 animate-float" style={{ animationDelay: '0s' }}></div>
          <div className="absolute top-[20%] -right-20 w-80 h-80 rounded-full bg-purple-200 animate-float" style={{ animationDelay: '1s' }}></div>
          <div className="absolute bottom-[10%] left-[5%] w-72 h-72 rounded-full bg-indigo-200 animate-float" style={{ animationDelay: '2s' }}></div>
          <div className="absolute bottom-[20%] right-[15%] w-56 h-56 rounded-full bg-pink-200 animate-float" style={{ animationDelay: '3s' }}></div>
        </div>

        <div className="w-full max-w-[420px] space-y-6 px-4 z-10">
          <div className="space-y-4 text-center">
            <div className="inline-block animate-float">
              <div className="bg-white/80 backdrop-blur-sm p-4 rounded-full shadow-md">
                <div className="text-3xl">✨</div>
              </div>
            </div>
            <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent sm:text-4xl">
              会員管理システム
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              素敵な一日の始まりです。ログインしてください。
            </p>
          </div>

          <Card className="border-none shadow-xl rounded-2xl backdrop-blur-md bg-white/90">
            <CardContent className="p-6 sm:p-8">
              <form action={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label 
                    htmlFor="username" 
                    className="text-sm font-medium text-gray-700 sm:text-base"
                  >
                    メールアドレス
                  </Label>
                  <div className="relative">
                    <Input
                      id="username"
                      name="username"
                      type="email"
                      required
                      placeholder="your.email@example.com"
                      className="h-12 pl-12 rounded-xl border-gray-200 bg-gray-50/50 text-base transition-colors focus:bg-white focus:border-purple-400 focus:ring-purple-300"
                      disabled={isLoading}
                      autoComplete="email"
                      aria-describedby="email-description"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                      </svg>
                    </div>
                  </div>
                  <p id="email-description" className="text-xs text-gray-500">
                    管理者から提供されたメールアドレスを入力してください
                  </p>
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
                      className="h-12 pl-12 rounded-xl border-gray-200 bg-gray-50/50 text-base transition-colors focus:bg-white focus:border-purple-400 focus:ring-purple-300"
                      disabled={isLoading}
                      autoComplete="current-password"
                      aria-describedby="password-description"
                    />
                    <div className="absolute left-3 top-1/2 -translate-y-1/2 text-purple-400">
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </div>
                  </div>
                  <p id="password-description" className="text-xs text-gray-500">
                    パスワードは大文字・小文字を区別します
                  </p>
                </div>
                <Button 
                  type="submit" 
                  className={`h-12 w-full rounded-xl text-base font-semibold bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-pink-600 hover:via-purple-600 hover:to-indigo-600 transition-all duration-300 ${isLoading ? 'opacity-80 cursor-not-allowed' : 'shadow-md hover:shadow-lg'}`}
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
                
                {isLoading && (
                  <div className="mt-4 text-center text-sm text-purple-600 animate-pulse">
                    <div className="flex flex-col items-center space-y-2">
                      <div>ログイン情報を確認しています...</div>
                      <div className="h-1 w-36 bg-gray-200 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500 animate-progress-indeterminate"></div>
                      </div>
                    </div>
                  </div>
                )}
              </form>
            </CardContent>
          </Card>

          <div className="text-center text-xs text-gray-500 mt-6">
            <p className="animate-pulse-light">安全なログインを心がけています</p>
          </div>
        </div>
      </div>
    </>
  )
}

