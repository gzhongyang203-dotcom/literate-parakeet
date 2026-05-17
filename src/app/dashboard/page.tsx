"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { User as UserIcon, FileText, Users, LogOut, CreditCard, Crown, Zap, Clock, CheckCircle2, XCircle } from "lucide-react"
import Link from "next/link"

interface Profile {
  id: string
  email: string
  nickname: string
  role: string
}

interface Subscription {
  id: string
  plan: string
  status: string
  end_date: string | null
}

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [subscription, setSubscription] = useState<Subscription | null>(null)
  const [pendingSubmissions, setPendingSubmissions] = useState<Array<{
    id: string; plan: string; amount: number; status: string; created_at: string; notes: string | null;
  }>>([])
  const [myProjectCount, setMyProjectCount] = useState(0)
  const [publishedProjectCount, setPublishedProjectCount] = useState(0)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Step 1: Auth check
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setLoading(false)
        return
      }
      setUser(user)

      // Step 2: All data queries in parallel (was 4 sequential round-trips)
      const [
        profileRes,
        subRes,
        paymentRes,
        myProjectsRes,
        pubCountRes,
      ] = await Promise.all([
        supabase.from("profiles").select("*").eq("id", user.id).single(),
        supabase.from("subscriptions").select("*").eq("user_id", user.id).eq("status", "active").single(),
        fetch("/api/payment-status").then(r => r.ok ? r.json() : null).catch(() => null),
        fetch("/api/projects").then(r => r.ok ? r.json() : null).catch(() => null),
        supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "published"),
      ])

      if (profileRes.data) setProfile(profileRes.data)
      if (subRes.data) setSubscription(subRes.data)
      if (paymentRes) setPendingSubmissions(paymentRes.submissions || [])
      if (myProjectsRes) setMyProjectCount(myProjectsRes.projects?.length || 0)
      if (!pubCountRes.error) setPublishedProjectCount(pubCountRes.count || 0)

      setLoading(false)
    }

    fetchData()
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 animate-pulse">
        {/* Profile skeleton */}
        <div className="flex items-center gap-4 mb-8">
          <div className="w-16 h-16 rounded-full bg-muted" />
          <div className="space-y-2">
            <div className="h-6 w-32 bg-muted rounded" />
            <div className="h-4 w-48 bg-muted rounded" />
          </div>
        </div>
        {/* Subscription skeleton */}
        <div className="h-24 bg-muted rounded-xl mb-8" />
        {/* Stats skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-32 bg-muted rounded-xl" />
          ))}
        </div>
        {/* Quick links skeleton */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-24 bg-muted rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  if (!user) {
    router.push("/login?redirect=/dashboard")
    return null
  }

  const getPlanBadge = () => {
    if (!subscription) {
      return (
        <Badge variant="outline" className="gap-1">
          <Zap className="h-3 w-3" /> 免费用户
        </Badge>
      )
    }

    if (subscription.plan === "合伙人") {
      return (
        <Badge className="gap-1 bg-gradient-to-r from-amber-500 to-orange-500">
          <Crown className="h-3 w-3" /> 合伙人
        </Badge>
      )
    }

    return (
      <Badge variant="secondary" className="gap-1">
        <Zap className="h-3 w-3" /> 创业者
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-2xl font-bold">
            {profile?.nickname?.[0] || user?.email?.[0]?.toUpperCase() || "?"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">{profile?.nickname || "用户"}</h1>
              {getPlanBadge()}
            </div>
            <p className="text-muted-foreground">{user.email}</p>
            {profile?.role === "admin" && (
              <Badge variant="outline" className="mt-1">管理员</Badge>
            )}
          </div>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> 退出登录
        </Button>
      </div>

      {/* 订阅状态 */}
      {subscription ? (
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="font-medium">
                    {subscription.plan === "合伙人" ? "合伙人套餐" : "创业者套餐"}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    订阅有效期至 {subscription.end_date
                      ? new Date(subscription.end_date).toLocaleDateString("zh-CN")
                      : "长期"}
                  </p>
                </div>
              </div>
              <Badge variant="success">有效</Badge>
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="mb-8 border-dashed">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center">
                  <CreditCard className="h-6 w-6 text-gray-400" />
                </div>
                <div>
                  <p className="font-medium">免费用户</p>
                  <p className="text-sm text-muted-foreground">
                    升级订阅解锁更多内容
                  </p>
                </div>
              </div>
              <Link href="/pricing">
                <Button size="sm">升级订阅</Button>
              </Link>
            </div>
            {/* 支付提交状态 */}
            {pendingSubmissions.length > 0 && (
              <div className="mt-4 pt-4 border-t">
                <p className="text-sm font-medium mb-2">支付审核状态</p>
                <div className="space-y-2">
                  {pendingSubmissions.map((s) => (
                    <div key={s.id} className="flex items-center justify-between bg-white rounded-lg p-3 border text-xs">
                      <div>
                        <span className="font-medium">{s.plan}</span>
                        <span className="text-muted-foreground ml-2">¥{(s.amount / 100).toFixed(0)}</span>
                        <span className="text-muted-foreground ml-2">
                          {new Date(s.created_at).toLocaleDateString("zh-CN")}
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        {s.status === "pending" && (
                          <Badge className="bg-amber-100 text-amber-700 gap-1 text-[10px]">
                            <Clock className="h-3 w-3" /> 审核中
                          </Badge>
                        )}
                        {s.status === "approved" && (
                          <Badge className="bg-green-100 text-green-700 gap-1 text-[10px]">
                            <CheckCircle2 className="h-3 w-3" /> 已通过
                          </Badge>
                        )}
                        {s.status === "rejected" && (
                          <Badge className="bg-red-100 text-red-700 gap-1 text-[10px]">
                            <XCircle className="h-3 w-3" /> 已拒绝
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">浏览的项目</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{publishedProjectCount}</p>
            <p className="text-xs text-muted-foreground">平台已发布项目</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">协作申请</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">-</p>
            <p className="text-xs text-muted-foreground">参与项目协作</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <UserIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">我的项目</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{myProjectCount}</p>
            <p className="text-xs text-muted-foreground">发布自己的项目</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/projects">
          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">浏览项目库</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">发现可落地的创业项目</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/collaborate">
          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">协作广场</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">找队友一起干项目</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/dashboard/agent">
          <Card className="hover:border-primary/50 transition-all cursor-pointer border-amber-200 bg-gradient-to-br from-amber-50/50 to-orange-50/30">
            <CardHeader>
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">代理中心</CardTitle>
                <Badge variant="secondary" className="text-[10px] bg-amber-100 text-amber-700">NEW</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">发展下级代理，统一结算分佣</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
