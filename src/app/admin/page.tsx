"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { FileText, Users, Handshake, CreditCard, TrendingUp, Eye, MessageSquare, Sparkles, Loader2 } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

interface Stats {
  projects: number
  users: number
  pendingCollabs: number
  activeSubs: number
  monthlyRevenue: number
  weeklyProjects: number
  weeklyUsers: number
}

interface RecentProject {
  id: string
  title: string
  status: string
  views: number
  comments_count: number
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({
    projects: 0,
    users: 0,
    pendingCollabs: 0,
    activeSubs: 0,
    monthlyRevenue: 0,
    weeklyProjects: 0,
    weeklyUsers: 0,
  })
  const [recentProjects, setRecentProjects] = useState<RecentProject[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      const supabase = createClient()

      // Fetch all data in parallel
      const [
        projectsRes,
        usersRes,
        collabsRes,
        subsRes,
        recentProjectsRes,
      ] = await Promise.all([
        supabase.from("projects").select("*", { count: "exact" }),
        supabase.from("profiles").select("*", { count: "exact" }),
        supabase
          .from("project_collaborators")
          .select("*", { count: "exact" })
          .eq("status", "pending"),
        supabase
          .from("subscriptions")
          .select("*")
          .eq("status", "active"),
        supabase
          .from("projects")
          .select("*, comments(count)")
          .order("created_at", { ascending: false })
          .limit(5),
      ])

      // Calculate monthly revenue
      const monthlyRevenue = subsRes.data?.reduce((sum: number, sub: { plan: string }) => {
        return sum + (sub.plan === "创业者" ? 29 : sub.plan === "合伙人" ? 89 : 0)
      }, 0) || 0

      setStats({
        projects: projectsRes.count || 0,
        users: usersRes.count || 0,
        pendingCollabs: collabsRes.count || 0,
        activeSubs: subsRes.count || 0,
        monthlyRevenue,
        weeklyProjects: 0, // TODO: filter by this week
        weeklyUsers: 0, // TODO: filter by this week
      })

      setRecentProjects(
        recentProjectsRes.data?.map((p: any) => ({
          id: p.id,
          title: p.title,
          status: p.status,
          views: 0, // TODO: track views
          comments_count: p.comments?.[0]?.count || 0,
        })) || []
      )

      setLoading(false)
    }

    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  const statCards = [
    {
      label: "项目总数",
      value: stats.projects.toString(),
      sub: `+${stats.weeklyProjects} 本周`,
      icon: FileText,
      color: "text-blue-600",
      bg: "bg-blue-50",
    },
    {
      label: "注册用户",
      value: stats.users.toString(),
      sub: `+${stats.weeklyUsers} 本周`,
      icon: Users,
      color: "text-purple-600",
      bg: "bg-purple-50",
    },
    {
      label: "协作申请",
      value: stats.pendingCollabs.toString(),
      sub: "待处理",
      icon: Handshake,
      color: "text-amber-600",
      bg: "bg-amber-50",
    },
    {
      label: "付费订阅",
      value: stats.activeSubs.toString(),
      sub: `月收入 ¥${stats.monthlyRevenue}`,
      icon: CreditCard,
      color: "text-green-600",
      bg: "bg-green-50",
    },
  ]

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">仪表盘</h1>
          <p className="text-muted-foreground mt-1">欢迎回来，这里是你的管理后台</p>
        </div>
        <Link href="/" className="text-sm text-primary hover:underline">
          查看前台网站 →
        </Link>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat) => (
          <Card key={stat.label} className="card-hover">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">{stat.label}</span>
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`h-5 w-5 ${stat.color}`} />
                </div>
              </div>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground mt-1">{stat.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 最近项目 */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-base">最近项目</CardTitle>
            <Link href="/admin/projects" className="text-sm text-primary hover:underline">
              管理项目 →
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {recentProjects.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                暂无项目，<Link href="/admin/projects" className="text-primary hover:underline">去创建第一个项目</Link>
              </p>
            ) : (
              recentProjects.map((proj) => (
                <div key={proj.id} className="flex items-center justify-between py-2 border-b last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`w-2 h-2 rounded-full ${proj.status === "published" ? "bg-green-500" : "bg-amber-400"}`} />
                    <span className="text-sm">{proj.title}</span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <Badge variant={proj.status === "published" ? "success" : "warning"}>
                      {proj.status === "published" ? "已发布" : "草稿"}
                    </Badge>
                    <span className="flex items-center gap-1">
                      <Eye className="h-3 w-3" /> {proj.views}
                    </span>
                    <span className="flex items-center gap-1">
                      <MessageSquare className="h-3 w-3" /> {proj.comments_count}
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* 快捷操作 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">快捷操作</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link
              href="/admin/projects"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-primary" />
              </div>
              <div>
                <p className="text-sm font-medium">发布新项目</p>
                <p className="text-xs text-muted-foreground">创建创业项目内容</p>
              </div>
            </Link>
            <Link
              href="/admin/subscriptions"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-green-50 flex items-center justify-center">
                <CreditCard className="h-4 w-4 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium">查看订阅</p>
                <p className="text-xs text-muted-foreground">订阅用户与收入</p>
              </div>
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-muted transition-colors"
            >
              <div className="w-9 h-9 rounded-lg bg-purple-50 flex items-center justify-center">
                <Users className="h-4 w-4 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium">用户管理</p>
                <p className="text-xs text-muted-foreground">查看用户信息</p>
              </div>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
