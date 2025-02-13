"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { Menu, X, LayoutDashboard, Users, Settings, LogOut } from "lucide-react"
import { logout } from "@/lib/actions"

const menuItems = [
  {
    href: "/dashboard",
    title: "ダッシュボード",
    icon: LayoutDashboard,
  },
  {
    href: "/members",
    title: "会員管理",
    icon: Users,
  },
  {
    href: "/settings",
    title: "設定",
    icon: Settings,
  },
]

export function Sidebar() {
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      {/* モバイルメニューボタン */}
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 md:hidden"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? (
          <X className="h-6 w-6" />
        ) : (
          <Menu className="h-6 w-6" />
        )}
      </Button>

      {/* オーバーレイ */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* サイドバー */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-200 ease-in-out md:relative md:translate-x-0",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex h-full flex-col">
          <div className="p-6">
            <h1 className="text-xl font-bold">会員管理システム</h1>
          </div>

          <nav className="flex-1 space-y-1 px-3">
            {menuItems.map((item) => {
              const Icon = item.icon
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className={cn(
                    "flex items-center rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                    pathname === item.href
                      ? "bg-gray-100 text-gray-900"
                      : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                  )}
                >
                  <Icon className="mr-3 h-5 w-5" />
                  {item.title}
                </Link>
              )
            })}
          </nav>

          <div className="p-4">
            <form action={logout}>
              <Button
                type="submit"
                variant="ghost"
                className="w-full justify-start text-red-600 hover:bg-red-50 hover:text-red-700"
              >
                <LogOut className="mr-3 h-5 w-5" />
                ログアウト
              </Button>
            </form>
          </div>
        </div>
      </aside>
    </>
  )
}

