"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// 注: 実際のアプリケーションでは、これらの値は環境変数やデータベースで管理します
const VALID_EMAIL = "test@example.com"
const VALID_PASSWORD = "password"

// ログイン処理
export async function login(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  // ここで実際の認証処理を行う
  if (email === VALID_EMAIL && password === VALID_PASSWORD) {
    // セッションクッキーを設定
    const cookieStore = cookies()
    cookieStore.set("session", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1週間
    })

    // ログイン成功時にダッシュボードにリダイレクト
    redirect("/dashboard?login=success")
  }

  return { error: "メールアドレスまたはパスワードが正しくありません" }
}

// ログアウト処理
export async function logout() {
  const cookieStore = cookies()
  cookieStore.delete("session")
  redirect("/login")
}

// 認証情報の更新処理は削除（不要な場合）

