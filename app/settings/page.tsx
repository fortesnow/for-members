"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"
import { logout } from "@/lib/actions"
import { 
  getAuth, 
  updateEmail, 
  updatePassword, 
  reauthenticateWithCredential,
  EmailAuthProvider 
} from "firebase/auth"
import { Loader2, Map } from "lucide-react"
import Link from "next/link"

export default function SettingsPage() {
  const { toast } = useToast()
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newEmail, setNewEmail] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    setError(null)
    setIsLoading(true)

    try {
      const auth = getAuth();
      const user = auth.currentUser;

      if (!user) {
        throw new Error("ユーザーが認証されていません。再ログインしてください。");
      }

      // 新しいメールアドレスが入力されている場合のみ更新
      if (newEmail && user.email !== newEmail) {
        if (!currentPassword) {
          throw new Error("現在のパスワードを入力してください");
        }

        // 現在のユーザー認証情報を再確認
        const credential = EmailAuthProvider.credential(
          user.email!, 
          currentPassword
        );
        
        await reauthenticateWithCredential(user, credential);
        
        // メールアドレスの更新
        await updateEmail(user, newEmail);
        toast({
          title: "メールアドレスを更新しました",
          description: "新しいメールアドレスが保存されました。",
          duration: 3000,
        });
      }

      // 新しいパスワードが入力されている場合のみ更新
      if (newPassword) {
        if (newPassword !== confirmPassword) {
          throw new Error("新しいパスワードが一致しません");
        }

        if (!currentPassword) {
          throw new Error("現在のパスワードを入力してください");
        }

        // 現在のユーザー認証情報を再確認
        const credential = EmailAuthProvider.credential(
          user.email!, 
          currentPassword
        );
        
        await reauthenticateWithCredential(user, credential);
        
        // パスワードの更新
        await updatePassword(user, newPassword);
        toast({
          title: "パスワードを更新しました",
          description: "新しいパスワードが保存されました。",
          duration: 3000,
        });
      }

      // 何も入力されていない場合
      if (!newEmail && !newPassword) {
        throw new Error("新しいメールアドレスまたはパスワードを入力してください");
      }

      // 成功
      setCurrentPassword("");
      setNewEmail("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: unknown) {
      console.error("設定の更新に失敗しました:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("設定の更新に失敗しました");
      }
    } finally {
      setIsLoading(false);
    }
  }

  const handleLogout = async () => {
    try {
      await logout()
    } catch {
      console.error("ログアウトに失敗しました")
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 p-4">
      <h1 className="text-3xl font-bold text-primary">システム設定</h1>

      <Card>
        <CardHeader>
          <CardTitle>アカウント設定</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="currentPassword">現在のパスワード</Label>
              <Input
                id="currentPassword"
                name="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                className="rounded-full"
              />
            </div>
            
            <div className="pt-4 border-t border-gray-100">
              <h3 className="text-sm font-medium text-gray-500 mb-4">変更したい項目だけ入力してください</h3>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newEmail">新しいメールアドレス</Label>
              <Input
                id="newEmail"
                name="newEmail"
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                className="rounded-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="newPassword">新しいパスワード</Label>
              <Input
                id="newPassword"
                name="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="rounded-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">新しいパスワード（確認）</Label>
              <Input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="rounded-full"
              />
            </div>
            
            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}
            
            <div className="flex justify-end space-x-4 pt-2">
              <Button
                type="button"
                variant="outline"
                className="rounded-full"
                onClick={handleLogout}
              >
                ログアウト
              </Button>
              <Button 
                type="submit" 
                className="rounded-full" 
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    更新中...
                  </>
                ) : (
                  "設定を保存"
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>データ管理ツール</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col gap-2">
            <p className="text-sm text-muted-foreground">会員データの整理や修正を行うためのツールです。</p>
            
            <div className="rounded-lg border p-4 hover:bg-gray-50 transition-colors">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-orange-100 p-2">
                    <Map className="h-4 w-4 text-orange-600" />
                  </div>
                  <div>
                    <h3 className="font-medium">住所データ整理ツール</h3>
                    <p className="text-sm text-muted-foreground">住所と番地が混同している会員データを整理します</p>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href="/settings/address-fix">ツールを開く</Link>
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

