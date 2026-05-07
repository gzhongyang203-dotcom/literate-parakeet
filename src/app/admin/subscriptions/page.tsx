"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, TrendingUp, DollarSign, Users, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

const PLAN_CONFIG = [
  { name: "免费版", price: 0, features: "项目库浏览·社区讨论", color: "bg-gray-50 border-gray-200" },
  { name: "创业者", price: 29, features: "最新项目·完整指南·协作匹配·AI助手", color: "bg-purple-50 border-purple-200" },
  { name: "合伙人", price: 89, features: "全部内容·私密社群·1v1指导·源码模板", color: "bg-amber-50 border-amber-200" },
]

interface SubscriptionWithProfile {
  id: string
  user_id: string
  plan: string
  status: string
  lemon_squeezy_id: string | null
  start_date: string
  end_date: string | null
  profile: {
    email: string
    nickname: string
  } | null
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProfile[]>([])
  const [loading, setLoading] = useState(true)

  // 计算统计数据
  const activeSubs = subscriptions.filter((s) => s.status === "active")
  const monthlyRevenue = activeSubs.reduce((sum, sub) => {
    return sum + (sub.plan === "创业者" ? 29 : sub.plan === "合伙人" ? 89 : 0)
  }, 0)
  const entrepreneurCount = activeSubs.filter((s) => s.plan === "创业者").length
  const partnerCount = activeSubs.filter((s) => s.plan === "合伙人").length
  const planCounts = [
    subscriptions.length, // 免费版用户数（暂用总用户数估算）
    entrepreneurCount,
    partnerCount,
  ]

  useEffect(() => {
    const fetchSubscriptions = async () => {
      const supabase = createClient()

      const { data, error } = await supabase
        .from("subscriptions")
        .select(`
          *,
          profile:profiles(email, nickname)
        `)
        .order("start_date", { ascending: false })

      if (!error && data) {
        setSubscriptions(data)
      }
      setLoading(false)
    }

    fetchSubscriptions()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("zh-CN", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">订阅管理</h1>
          <p className="text-muted-foreground mt-1">管理付费方案和订阅用户</p>
        </div>
        <Link href="/pricing">
          <Button variant="outline" size="sm">查看定价页</Button>
        </Link>
      </div>

      {/* 收入概览 */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">月收入</span>
              <DollarSign className="h-5 w-5 text-green-600" />
            </div>
            <div className="text-2xl font-bold">¥ {monthlyRevenue}</div>
            <p className="text-xs text-muted-foreground mt-1">当前活跃订阅</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">付费用户</span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">{activeSubs.length}</div>
            <p className="text-xs text-muted-foreground mt-1">活跃订阅中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">续费率</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">--</div>
            <p className="text-xs text-muted-foreground mt-1">数据不足</p>
          </CardContent>
        </Card>
      </div>

      {/* 方案配置 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">订阅方案</CardTitle>
          <span className="text-xs text-muted-foreground">方案在代码中配置（pricing/page.tsx）</span>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLAN_CONFIG.map((plan, index) => (
              <div key={plan.name} className={`rounded-xl border-2 p-5 ${plan.color}`}>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="mt-2 mb-3">
                  <span className="text-3xl font-bold">¥{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/月</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Users className="h-4 w-4" />
                  {planCounts[index]} 位用户
                </div>
                <div className="text-xs text-muted-foreground bg-white/50 rounded-lg p-2">
                  {plan.features}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 订阅用户列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">订阅用户</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {subscriptions.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无订阅记录</p>
              <p className="text-xs text-muted-foreground mt-1">
                配置支付后，用户订阅将显示在这里
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-medium text-sm">
                      {sub.profile?.nickname?.[0] || sub.profile?.email?.[0].toUpperCase() || "?"}
                    </div>
                    <div>
                      <p className="text-sm font-medium">
                        {sub.profile?.nickname || sub.profile?.email || "未知用户"}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {sub.profile?.email || "无邮箱"} · {formatDate(sub.start_date)} 起订
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge variant={sub.plan === "合伙人" ? "warning" : "default"}>
                      {sub.plan}
                    </Badge>
                    <span className="text-sm font-medium">
                      ¥{sub.plan === "创业者" ? 29 : sub.plan === "合伙人" ? 89 : 0}/月
                    </span>
                    <Badge variant={sub.status === "active" ? "success" : "secondary"}>
                      {sub.status === "active" ? "活跃" : sub.status === "canceled" ? "已取消" : "已过期"}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
