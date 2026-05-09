"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { useEffect, useState, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import {
  User as UserIcon,
  LogOut,
  Settings,
  CreditCard,
  ChevronDown,
  Crown,
  Zap,
} from "lucide-react"

const navItems = [
  { label: "项目库", href: "/projects" },
  { label: "AI助手", href: "/ai-assistant" },
  { label: "协作广场", href: "/collaborate" },
  { label: "社区", href: "/community" },
  { label: "关于", href: "/about" },
]

interface Profile {
  nickname: string
  role: string
}

interface Subscription {
  plan: string
  status: string
}

export function Header() {
  const pathname = usePathname()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const fetchUserData = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        // Get profile
        const { data: profileData } = await supabase
          .from("profiles")
          .select("nickname, role")
          .eq("id", user.id)
          .single()

        if (profileData) {
          setProfile(profileData)
        }

        // Get subscription
        const { data: subData } = await supabase
          .from("subscriptions")
          .select("plan, status")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()

        if (subData) {
          setSubscription(subData)
        }
      }
    }

    fetchUserData()
  }, [])

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    window.location.href = "/"
  }

  const getSubscriptionBadge = () => {
    if (!subscription) return null
    if (subscription.plan === "合伙人") {
      return (
        <span className="text-xs bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2 py-0.5 rounded-full flex items-center gap-1">
          <Crown className="h-3 w-3" /> 合伙人
        </span>
      )
    }
    return (
      <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full flex items-center gap-1">
        <Zap className="h-3 w-3" /> 创业者
      </span>
    )
  }

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <Logo size="sm" />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                pathname.startsWith(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="hidden md:flex items-center gap-3">
          {user ? (
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2 px-3 py-1.5 rounded-full hover:bg-muted transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-sm font-medium">
                  {profile?.nickname?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
                </div>
                <span className="text-sm font-medium">
                  {profile?.nickname || user?.email?.split("@")[0] || "用户"}
                </span>
                {getSubscriptionBadge()}
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 bg-background rounded-lg border shadow-lg py-1">
                  <div className="px-4 py-2 border-b">
                    <p className="text-sm font-medium truncate">{user.email}</p>
                    <p className="text-xs text-muted-foreground">
                      {profile?.role === "admin" ? "管理员" : "用户"}
                    </p>
                  </div>
                  <Link
                    href="/dashboard"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <UserIcon className="h-4 w-4" /> 个人中心
                  </Link>
                  <Link
                    href="/pricing"
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <CreditCard className="h-4 w-4" />{" "}
                    {subscription ? "我的订阅" : "升级订阅"}
                  </Link>
                  {profile?.role === "admin" && (
                    <Link
                      href="/admin"
                      className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted"
                      onClick={() => setDropdownOpen(false)}
                    >
                      <Settings className="h-4 w-4" /> 管理后台
                    </Link>
                  )}
                  <div className="border-t my-1" />
                  <button
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-4 py-2 text-sm hover:bg-muted w-full text-left text-red-600"
                  >
                    <LogOut className="h-4 w-4" /> 退出登录
                  </button>
                </div>
              )}
            </div>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="sm">
                  登录
                </Button>
              </Link>
              <Link href="/login?tab=register">
                <Button size="sm">注册</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            {mobileOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            )}
          </svg>
        </button>
      </div>

      {/* Mobile Nav */}
      {mobileOpen && (
        <div className="md:hidden border-t bg-background px-4 py-4 space-y-3">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "block text-sm font-medium py-2",
                pathname.startsWith(item.href)
                  ? "text-primary"
                  : "text-muted-foreground"
              )}
              onClick={() => setMobileOpen(false)}
            >
              {item.label}
            </Link>
          ))}
          <div className="pt-2 border-t flex gap-3">
            {user ? (
              <>
                <Link href="/dashboard" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    个人中心
                  </Button>
                </Link>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-red-600"
                  onClick={handleLogout}
                >
                  退出
                </Button>
              </>
            ) : (
              <>
                <Link href="/login" className="flex-1">
                  <Button variant="outline" size="sm" className="w-full">
                    登录
                  </Button>
                </Link>
                <Link href="/login?tab=register" className="flex-1">
                  <Button size="sm" className="w-full">
                    注册
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  )
}
