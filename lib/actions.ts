"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// 注: 実際のアプリケーションでは、これらの値は環境変数やデータベースで管理します
let SHARED_USERNAME = "admin"
let SHARED_PASSWORD = "aoi1234"

// ログイン処理
export async function login(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")

  if (!username || !password) {
    return { error: "ユーザーIDとパスワードを入力してください" }
  }

  if (username === SHARED_USERNAME && password === SHARED_PASSWORD) {
    const cookieStore = await cookies()
    cookieStore.set("auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1週間
    })
    redirect("/dashboard") // ログイン成功時はダッシュボードへ
  }

  return { error: "ユーザーIDまたはパスワードが正しくありません" }
}

// ログアウト処理
export async function logout() {
  const cookieStore = await cookies()
  cookieStore.delete("auth")
  redirect("/login")
}

// 認証情報の更新処理
export async function updateCredentials(formData: FormData) {
  const newUsername = formData.get("newUsername")
  const newPassword = formData.get("newPassword")
  const confirmPassword = formData.get("confirmPassword")

  if (!newUsername || !newPassword || !confirmPassword) {
    return { error: "すべての項目を入力してください" }
  }

  if (newPassword !== confirmPassword) {
    return { error: "パスワードが一致しません" }
  }

  SHARED_USERNAME = newUsername.toString()
  SHARED_PASSWORD = newPassword.toString()
  return { success: true }
}

