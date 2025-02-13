"use client"

import Link from "next/link"
import { Home, Users, Settings, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { logout } from "@/lib/actions"
import { usePathname } from "next/navigation"

export function Sidebar() {
  const pathname = usePathname()

  return (
    <aside className="w-64 bg-white/50 backdrop-blur-sm border-r border-primary/10 flex flex-col">
      <div className="p-6">
        <h2 className="text-xl font-bold text-primary">会員管理システム</h2>
      </div>
      <nav className="px-4 flex-1">
        <ul className="space-y-2">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center space-x-3 px-4 py-2 rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors ${
                pathname === '/dashboard' ? 'bg-blue-500 text-white' : ''
              }`}
            >
              <Home className="h-5 w-5" />
              <span>ホーム</span>
            </Link>
          </li>
          <li>
            <Link
              href="/members"
              className={`flex items-center space-x-3 px-4 py-2 rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors ${
                pathname === '/members' ? 'bg-blue-500 text-white' : ''
              }`}
            >
              <Users className="h-5 w-5" />
              <span>会員一覧</span>
            </Link>
          </li>
          <li>
            <Link
              href="/settings"
              className={`flex items-center space-x-3 px-4 py-2 rounded-full text-foreground hover:bg-accent hover:text-primary transition-colors ${
                pathname === '/settings' ? 'bg-blue-500 text-white' : ''
              }`}
            >
              <Settings className="h-5 w-5" />
              <span>設定</span>
            </Link>
          </li>
        </ul>
      </nav>
      <div className="p-4">
        <Button
          variant="ghost"
          className="w-full rounded-full flex items-center justify-center space-x-2"
          onClick={() => logout()}
        >
          <LogOut className="h-5 w-5" />
          <span>ログアウト</span>
        </Button>
      </div>
    </aside>
  )
}

