"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CreditCard, TrendingUp, DollarSign, Users, Edit3 } from "lucide-react"
import Link from "next/link"

const PLAN_CONFIG = [
  { name: "免费版", price: "0", users: 186, features: "项目库浏览·社区讨论", color: "bg-gray-50 border-gray-200" },
  { name: "创业者", price: "29", users: 18, features: "最新项目·完整指南·协作匹配·AI助手", color: "bg-purple-50 border-purple-200" },
  { name: "合伙人", price: "89", users: 5, features: "全部内容·私密社群·1v1指导·源码模板", color: "bg-amber-50 border-amber-200" },
]

const SUBSCRIBERS = [
  { id: "1", email: "user1@example.com", plan: "创业者", status: "active", start: "2026-04-01", amount: 29 },
  { id: "2", email: "user3@example.com", plan: "创业者", status: "active", start: "2026-04-10", amount: 29 },
  { id: "3", email: "user5@example.com", plan: "合伙人", status: "active", start: "2026-04-15", amount: 89 },
  { id: "4", email: "user6@example.com", plan: "创业者", status: "canceled", start: "2026-04-20", amount: 29 },
]

export default function AdminSubscriptionsPage() {
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
            <div className="text-2xl font-bold">¥ 690</div>
            <p className="text-xs text-muted-foreground mt-1">预计月收入</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">付费用户</span>
              <Users className="h-5 w-5 text-blue-600" />
            </div>
            <div className="text-2xl font-bold">23</div>
            <p className="text-xs text-muted-foreground mt-1">活跃订阅中</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-muted-foreground">续费率</span>
              <TrendingUp className="h-5 w-5 text-purple-600" />
            </div>
            <div className="text-2xl font-bold">78%</div>
            <p className="text-xs text-muted-foreground mt-1">上月续费</p>
          </CardContent>
        </Card>
      </div>

      {/* 方案配置 */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">订阅方案</CardTitle>
          <Button variant="outline" size="sm" className="gap-1">
            <Edit3 className="h-3 w-3" /> 修改方案
          </Button>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {PLAN_CONFIG.map((plan) => (
              <div key={plan.name} className={`rounded-xl border-2 p-5 ${plan.color}`}>
                <h3 className="font-bold text-lg">{plan.name}</h3>
                <div className="mt-2 mb-3">
                  <span className="text-3xl font-bold">¥{plan.price}</span>
                  <span className="text-sm text-muted-foreground">/月</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                  <Users className="h-4 w-4" />
                  {plan.users} 位用户
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
          <div className="divide-y">
            {SUBSCRIBERS.map((sub) => (
              <div key={sub.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-400 flex items-center justify-center text-white font-medium text-sm">
                    {sub.email[0].toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{sub.email}</p>
                    <p className="text-xs text-muted-foreground">{sub.start} 起订</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={sub.plan === "合伙人" ? "warning" : "default"}>{sub.plan}</Badge>
                  <span className="text-sm font-medium">¥{sub.amount}/月</span>
                  <Badge variant={sub.status === "active" ? "success" : "secondary"}>
                    {sub.status === "active" ? "活跃" : "已取消"}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
