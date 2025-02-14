export async function POST(request: Request) {
  const { token } = await request.json();

  // Cookieの有効期限を設定
  const maxAge = 60 * 60 * 24 * 7; // 1週間
  const expires = new Date(Date.now() + maxAge * 1000).toUTCString();
  
  // Cookieのオプションを設定
  let cookieValue = `auth=${token}; HttpOnly; Path=/; Max-Age=${maxAge}; Expires=${expires}; SameSite=Lax`;
  
  // 本番環境の場合はSecureフラグを追加
  if (process.env.NODE_ENV === "production") {
    cookieValue += "; Secure";
  }

  // レスポンスヘッダーにCookieを設定
  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": cookieValue,
    },
  });
}
