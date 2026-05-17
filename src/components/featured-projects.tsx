"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { TrendingUp, Zap, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@supabase/ssr"

// 降级数据 - Supabase 不可用时使用
const DEMO_PROJECTS = [
  {
    id: "1", title: "闲鱼AI代写服务", hook: "用AI帮人写工作总结、小红书文案，0成本启动月入2000+",
    category: "闲鱼", difficulty: "初级", income_estimate: "月入500-3000",
    likes: 128, comments: 36, views: "2.3k", trending: true,
  },
  {
    id: "2", title: "小红书AI壁纸号", hook: "AI生成精美壁纸，发小红书引流私域变现",
    category: "小红书", difficulty: "初级", income_estimate: "月入1000-5000",
    likes: 95, comments: 22, views: "1.8k", trending: false,
  },
  {
    id: "3", title: "情侣情绪价值小程序", hook: "微信小程序+知识付费，情侣关系赛道稳赚",
    category: "AI工具", difficulty: "中级", income_estimate: "月入2000-10000",
    likes: 156, comments: 48, views: "3.1k", trending: true,
  },
  {
    id: "4", title: "短视频解压动画号", hook: "用剪映制作解压动画，抖音/快手流量变现",
    category: "短视频", difficulty: "初级", income_estimate: "月入500-2000",
    likes: 73, comments: 15, views: "1.2k", trending: false,
  },
]

export function FeaturedProjectsSection() {
  const [projects, setProjects] = useState(DEMO_PROJECTS)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false
    const controller = new AbortController()

    async function fetchProjects() {
      try {
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
        const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

        if (!supabaseUrl || !supabaseKey || supabaseUrl === "your_supabase_url") {
          if (!cancelled) setLoading(false)
          return
        }

        const supabase = createBrowserClient(supabaseUrl, supabaseKey)

        // 3秒超时
        const timeout = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("timeout")), 3000)
        )

        const query = supabase
          .from("projects")
          .select("*")
          .eq("status", "published")
          .order("created_at", { ascending: false })
          .limit(4)

        const { data } = await Promise.race([query, timeout]) as any

        if (!cancelled && data && data.length > 0) {
          setProjects(data)
        }
      } catch {
        // 使用降级数据即可
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    fetchProjects()
    return () => {
      cancelled = true
      controller.abort()
    }
  }, [])

  const trendingProjects = projects.filter((p: any) => p.trending)

  return (
    <section className="pb-16">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-bold">精选项目</h2>
              {trendingProjects.length > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" /> 热门
                </Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">马上可以开干的创业方向</p>
          </div>
          <Link
            href="/projects"
            className="text-sm text-primary hover:underline flex items-center gap-1 font-medium"
          >
            查看全部项目 <ArrowRight className="h-3 w-3" />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="rounded-xl border p-6 animate-pulse">
                <div className="flex justify-between">
                  <div className="h-6 w-16 bg-muted rounded-full" />
                  <div className="h-6 w-12 bg-muted rounded-full" />
                </div>
                <div className="h-6 w-3/4 mt-3 bg-muted rounded" />
                <div className="h-4 w-full mt-2 bg-muted rounded" />
                <div className="flex justify-between mt-4">
                  <div className="h-5 w-24 bg-muted rounded" />
                  <div className="h-5 w-32 bg-muted rounded" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project: any, index: number) => {
              const isBlurred = index >= 3

              if (!isBlurred) {
                return (
                  <Link key={project.id} href={`/projects/${project.id}`}>
                    <Card className={`h-full hover:border-primary/30 transition-all card-hover animate-fade-up-delay-${Math.min(index, 3)}`}>
                      <CardHeader>
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="secondary" className="gap-1">{project.category}</Badge>
                            {project.trending && (
                              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
                                <Zap className="h-3 w-3" /> 热门
                              </Badge>
                            )}
                            <Badge variant="outline" className="text-xs text-green-600 border-green-200 bg-green-50">免费可见</Badge>
                          </div>
                          <Badge variant={project.difficulty === "初级" ? "success" : project.difficulty === "中级" ? "warning" : "default"} className="shrink-0">
                            {project.difficulty}
                          </Badge>
                        </div>
                        <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">{project.title}</CardTitle>
                        <p className="text-sm text-muted-foreground line-clamp-2">{project.hook}</p>
                      </CardHeader>
                      <CardContent>
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="font-semibold text-primary">{project.income_estimate}</span>
                            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">启动成本 0元</span>
                          </div>
                          <div className="flex items-center gap-3 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                              {project.likes || 0}
                            </span>
                            <span className="flex items-center gap-1">
                              <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                              {project.comments || 0}
                            </span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                )
              }

              // Blurred 4th card
              return (
                <div key={project.id} className="relative group">
                  <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/60 backdrop-blur-md rounded-xl border border-dashed border-purple-300">
                    <div className="text-center px-4">
                      <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                          <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                        </svg>
                      </div>
                      <p className="font-bold text-sm text-purple-700 mb-1">解锁全部项目</p>
                      <p className="text-xs text-muted-foreground mb-3">还有 20+ 项目等你发现</p>
                      <Link href="/pricing">
                        <span className="inline-flex items-center gap-1.5 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white text-sm font-medium rounded-xl hover:from-purple-700 hover:to-pink-700 transition-all shadow-md">
                          立即查看 <ArrowRight className="h-3.5 w-3.5" />
                        </span>
                      </Link>
                    </div>
                  </div>
                  <Card className="h-full opacity-30 pointer-events-none">
                    <CardHeader>
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <Badge variant="secondary" className="gap-1">{project.category}</Badge>
                          <Badge variant="outline" className="text-xs text-purple-600 border-purple-200 bg-purple-50">付费专享</Badge>
                        </div>
                        <Badge variant="secondary" className="shrink-0">{project.difficulty}</Badge>
                      </div>
                      <CardTitle className="text-lg mt-2">{project.title}</CardTitle>
                      <p className="text-sm text-muted-foreground line-clamp-2">{project.hook}</p>
                    </CardHeader>
                    <CardContent>
                      <div className="flex items-center justify-between">
                        <span className="font-semibold text-primary">{project.income_estimate}</span>
                        <span className="text-xs text-muted-foreground">付费可见</span>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
