"use client"

import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { Logo } from "@/components/logo"
import {
  LayoutDashboard,
  FileText,
  Users,
  Handshake,
  CreditCard,
  Settings,
  LogOut,
  Menu,
  X,
  ArrowLeft,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { useState } from "react"

const sidebarItems = [
  { label: "仪表盘", href: "/admin", icon: LayoutDashboard },
  { label: "项目管理", href: "/admin/projects", icon: FileText },
  { label: "用户管理", href: "/admin/users", icon: Users },
  { label: "协作管理", href: "/admin/collaborations", icon: Handshake },
  { label: "订阅管理", href: "/admin/subscriptions", icon: CreditCard },
  { label: "系统设置", href: "/admin/settings", icon: Settings },
]

export function AdminSidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const [collapsed, setCollapsed] = useState(false)

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && (
        <div
          className="fixed inset-0 bg-black/20 z-40 lg:hidden"
          onClick={() => setCollapsed(true)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full bg-white border-r flex flex-col transition-all duration-200",
          collapsed ? "w-0 lg:w-[70px] overflow-hidden" : "w-[240px]"
        )}
      >
        {/* Logo */}
        <div className="flex items-center justify-between h-16 px-4 border-b shrink-0">
          <div className={cn("flex items-center gap-2", collapsed && "lg:justify-center")}>
            <div className="shrink-0">
              <svg width="28" height="28" viewBox="0 0 36 36" fill="none">
                <circle cx="18" cy="18" r="16.5" stroke="#CECBF6" strokeWidth="1.2" />
                <circle cx="18" cy="18" r="12" fill="#8B5CF6" />
                <polygon points="18,8 15.5,18 18,16.5 20.5,18" fill="white" opacity="0.95" />
                <polygon points="18,28 15.5,18 18,19.5 20.5,18" fill="white" opacity="0.3" />
                <text x="18" y="21" textAnchor="middle" fontFamily="system-ui" fontSize="16" fontWeight="600" fill="white">创</text>
              </svg>
            </div>
            {!collapsed && <span className="font-bold text-sm whitespace-nowrap">管理后台</span>}
          </div>
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="p-1.5 rounded-md hover:bg-muted lg:hidden"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
          {sidebarItems.map((item) => {
            const active = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href))
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  collapsed && "lg:justify-center lg:px-2"
                )}
                title={collapsed ? item.label : undefined}
              >
                <item.icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span className="whitespace-nowrap">{item.label}</span>}
              </Link>
            )
          })}
        </nav>

        {/* Bottom */}
        <div className="p-3 border-t space-y-2">
          <Link
            href="/"
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors",
              collapsed && "lg:justify-center lg:px-2"
            )}
            title="返回网站"
          >
            <ArrowLeft className="h-4 w-4 shrink-0" />
            {!collapsed && "返回网站"}
          </Link>
          <button
            onClick={handleLogout}
            className={cn(
              "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-500 hover:bg-red-50 transition-colors w-full text-left",
              collapsed && "lg:justify-center lg:px-2"
            )}
            title="退出登录"
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && "退出登录"}
          </button>
        </div>

        {/* Collapse toggle - desktop */}
        <button
          className="hidden lg:flex absolute -right-3 top-20 w-6 h-6 rounded-full border bg-background shadow-sm items-center justify-center hover:bg-muted z-50"
          onClick={() => setCollapsed(!collapsed)}
        >
          <svg className={cn("h-3 w-3 transition-transform", collapsed && "rotate-180")} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
      </aside>

      {/* Mobile trigger */}
      {collapsed && (
        <button
          className="fixed top-4 left-4 z-40 p-2 bg-white border rounded-lg shadow-sm lg:hidden"
          onClick={() => setCollapsed(false)}
        >
          <Menu className="h-5 w-5" />
        </button>
      )}
    </>
  )
}
