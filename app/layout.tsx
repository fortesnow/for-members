"use client"

import { Inter } from "next/font/google"
import "./globals.css"
import { Toaster } from "@/components/ui/toaster"
import { Sidebar } from "@/components/sidebar"
import { usePathname } from "next/navigation"

const inter = Inter({ subsets: ["latin"] })

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isLoginPage = pathname === "/login"

  return (
    <html lang="ja">
      <body className={inter.className}>
        {isLoginPage ? (
          <main className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-amber-50">
            {children}
          </main>
        ) : (
          <div className="flex h-screen bg-gray-100">
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
