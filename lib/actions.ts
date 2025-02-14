"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function login(formData: FormData) {
  if (process.env.NODE_ENV === "development") {
    const cookieStore = await cookies();
    cookieStore.set({
      name: "auth",
      value: "development-token",
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 7,
    });
    redirect("/dashboard");
  }

  const email = formData.get("username");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "メールアドレスとパスワードを入力してください" };
  }

  return { email, password };
}

export async function logout() {
  const cookieStore = await cookies();
  cookieStore.delete("auth");
  redirect("/login");
}
