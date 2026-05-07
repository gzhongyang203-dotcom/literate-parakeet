"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, TrendingUp, DollarSign, Users, Loader2, Plus, Search, X } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Input } from "@/components/ui/input"

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

interface UserProfile {
  id: string
  email: string
  nickname: string
  created_at: string
}

export default function AdminSubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<SubscriptionWithProfile[]>([])
  const [users, setUsers] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddModal, setShowAddModal] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [addingPlan, setAddingPlan] = useState("")
  const [addingUserId, setAddingUserId] = useState("")
  const [saving, setSaving] = useState(false)

  const activeSubs = subscriptions.filter((s) => s.status === "active")
  const monthlyRevenue = activeSubs.reduce((sum, sub) => {
    return sum + (sub.plan === "创业者" ? 29 : sub.plan === "合伙人" ? 89 : 0)
  }, 0)

  useEffect(() => {
    fetchSubscriptions()
    fetchUsers()
  }, [])

  const fetchSubscriptions = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("subscriptions")
      .select(`
        *,
        profile:profiles(email, nickname)
      `)
      .order("start_date", { ascending: false })

    if (data) setSubscriptions(data)
    setLoading(false)
  }

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("profiles")
      .select("id, email, nickname, created_at")
      .order("created_at", { ascending: false })

    if (data) setUsers(data)
  }

  const handleManualSubscribe = async () => {
    if (!addingUserId || !addingPlan) {
      alert("请选择用户和套餐")
      return
    }

    setSaving(true)
    const supabase = createClient()

    // 检查是否已有订阅
    const { data: existing } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", addingUserId)
      .eq("status", "active")
      .single()

    if (existing) {
      alert("该用户已有活跃订阅")
      setSaving(false)
      return
    }

    // 计算订阅结束时间（一个月后）
    const startDate = new Date()
    const endDate = new Date()
    endDate.setMonth(endDate.getMonth() + 1)

    const { error } = await supabase
      .from("subscriptions")
      .insert({
        user_id: addingUserId,
        plan: addingPlan,
        status: "active",
        start_date: startDate.toISOString(),
        end_date: endDate.toISOString(),
      })

    setSaving(false)

    if (error) {
      alert("开通失败：" + error.message)
    } else {
      setShowAddModal(false)
      setAddingUserId("")
      setAddingPlan("")
      fetchSubscriptions()
      alert("订阅开通成功！")
    }
  }

  const handleCancelSubscription = async (subId: string) => {
    if (!confirm("确定要取消该订阅吗？")) return
    const supabase = createClient()
    await supabase
      .from("subscriptions")
      .update({ status: "canceled" })
      .eq("id", subId)
    fetchSubscriptions()
  }

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
        <div className="flex gap-3">
          <Button variant="outline" size="sm" onClick={() => setShowAddModal(true)} className="gap-1.5">
            <Plus className="h-4 w-4" /> 手动开通
          </Button>
          <Link href="/pricing">
            <Button variant="outline" size="sm">查看定价页</Button>
          </Link>
        </div>
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
              <span className="text-sm text-muted-foreground">已取消</span>
              <TrendingUp className="h-5 w-5 text-red-600" />
            </div>
            <div className="text-2xl font-bold">{subscriptions.filter(s => s.status === "canceled").length}</div>
            <p className="text-xs text-muted-foreground mt-1">取消订阅</p>
          </CardContent>
        </Card>
      </div>

      {/* 方案概览 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">订阅方案</CardTitle>
          <div className="text-xs text-muted-foreground">用户在定价页点击订阅后，联系客服微信开通</div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="rounded-xl border-2 border-gray-200 bg-gray-50 p-5">
              <h3 className="font-bold text-lg">免费版</h3>
              <div className="mt-2 mb-3">
                <span className="text-3xl font-bold">¥0</span>
                <span className="text-sm text-muted-foreground">/月</span>
              </div>
              <div className="text-xs text-muted-foreground">
                用户数：{users.length - activeSubs.length}
              </div>
            </div>
            <div className="rounded-xl border-2 border-purple-300 bg-purple-50 p-5">
              <h3 className="font-bold text-lg">创业者</h3>
              <div className="mt-2 mb-3">
                <span className="text-3xl font-bold">¥29</span>
                <span className="text-sm text-muted-foreground">/月</span>
              </div>
              <div className="text-xs text-muted-foreground">
                用户数：{activeSubs.filter(s => s.plan === "创业者").length}
              </div>
            </div>
            <div className="rounded-xl border-2 border-amber-300 bg-amber-50 p-5">
              <h3 className="font-bold text-lg">合伙人</h3>
              <div className="mt-2 mb-3">
                <span className="text-3xl font-bold">¥89</span>
                <span className="text-sm text-muted-foreground">/月</span>
              </div>
              <div className="text-xs text-muted-foreground">
                用户数：{activeSubs.filter(s => s.plan === "合伙人").length}
              </div>
            </div>
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
                用户微信转账后，点击右上角「手动开通」为其开通订阅
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {subscriptions.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-medium text-sm">
                      {sub.profile?.nickname?.[0] || sub.profile?.email?.[0]?.toUpperCase() || "?"}
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
                    {sub.status === "active" && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-500 hover:text-red-600"
                        onClick={() => handleCancelSubscription(sub.id)}
                      >
                        取消
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 手动开通弹窗 */}
      {showAddModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="font-bold">手动开通订阅</h2>
              <button onClick={() => setShowAddModal(false)}>
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="p-6 space-y-4">
              <p className="text-sm text-muted-foreground">
                用户微信转账后，在此处为其开通订阅权限。
              </p>

              <div>
                <label className="text-sm font-medium mb-1.5 block">选择用户 *</label>
                <select
                  value={addingUserId}
                  onChange={(e) => setAddingUserId(e.target.value)}
                  className="w-full h-10 rounded-md border px-3 text-sm bg-background"
                >
                  <option value="">-- 选择用户 --</option>
                  {users.map((u) => (
                    <option key={u.id} value={u.id}>
                      {u.nickname || u.email.split("@")[0]} ({u.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">选择套餐 *</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => setAddingPlan("创业者")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      addingPlan === "创业者"
                        ? "border-purple-400 bg-purple-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-bold">创业者</div>
                    <div className="text-2xl font-bold mt-1">¥29<span className="text-sm font-normal">/月</span></div>
                  </button>
                  <button
                    onClick={() => setAddingPlan("合伙人")}
                    className={`p-4 rounded-xl border-2 text-left transition-all ${
                      addingPlan === "合伙人"
                        ? "border-amber-400 bg-amber-50"
                        : "border-gray-200 hover:border-gray-300"
                    }`}
                  >
                    <div className="font-bold">合伙人</div>
                    <div className="text-2xl font-bold mt-1">¥89<span className="text-sm font-normal">/月</span></div>
                  </button>
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleManualSubscribe}
                disabled={saving || !addingUserId || !addingPlan}
              >
                {saving ? "开通中..." : "确认开通"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
