"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/" || pathname === "/login" || pathname.startsWith("/login/")

  return (
    <html lang="ja">
      <body className={inter.className}>
        {isLoginPage ? (
          <main className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-amber-100">
            {children}
          </main>
        ) : (
          <div className="flex h-screen bg-amber-50">
            <Sidebar />
            <main className="flex-1 overflow-y-auto p-8">
              {children}
            </main>
          </div>
        )}
        <Toaster />
      </body>
    </html>
  )
}
