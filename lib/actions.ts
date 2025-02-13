"use server"

import { cookies } from "next/headers"
import { redirect } from "next/navigation"

// 注: 実際のアプリケーションでは、これらの値は環境変数やデータベースで管理します
let SHARED_USERNAME = "admin"
let SHARED_PASSWORD = "1234"

// ログイン処理
export async function login(formData: FormData) {
  const username = formData.get("username")
  const password = formData.get("password")

  if (username === SHARED_USERNAME && password === SHARED_PASSWORD) {
    // セッションクッキーを設定
    cookies().set("auth", "authenticated", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7, // 1週間
    })
    return { success: true }
  }

  return { error: "ユーザーIDまたはパスワードが正しくありません" }
}

// ログアウト処理
export async function logout() {
  cookies().delete("auth")
  redirect("/login")
}

// 認証情報の更新
export async function updateCredentials(formData: FormData) {
  const newUsername = formData.get("newUsername")
  const newPassword = formData.get("newPassword")
  const confirmPassword = formData.get("confirmPassword")

  if (newPassword !== confirmPassword) {
    return { error: "パスワードが一致しません" }
  }

  if (typeof newUsername === "string" && typeof newPassword === "string") {
    // 認証情報を更新
    SHARED_USERNAME = newUsername
    SHARED_PASSWORD = newPassword
    return { success: true }
  }

  return { error: "無効な入力です" }
}

