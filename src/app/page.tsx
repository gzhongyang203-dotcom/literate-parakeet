import Link from "next/link"
import { ArrowRight, Sparkles, Users, BookOpen, TrendingUp, Star, Zap } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { HeroBackground, SectionBackground } from "@/components/decorations"
import { TrustStats, ActivityIndicator } from "@/components/trust-stats"
import { DailyUpdatePreview } from "@/components/daily-update"
import { SmartRecommendation } from "@/components/smart-recommendation"
import { VirtualStats, OrderScroll, HotTags } from "@/components/virtual-data"
import { MiniReviews } from "@/components/project-reviews"
import { WechatQRCodeFloating } from "@/components/wechat-qrcode"

const categories = [
  { name: "抖音", count: 8, icon: "🎵", color: "bg-black text-white border-gray-800/50", hoverColor: "group-hover:bg-gray-800" },
  { name: "快手", count: 5, icon: "📱", color: "bg-pink-50 text-pink-600 border-pink-200/50", hoverColor: "group-hover:bg-pink-100" },
  { name: "闲鱼", count: 12, icon: "🏪", color: "bg-orange-50 text-orange-600 border-orange-200/50", hoverColor: "group-hover:bg-orange-100" },
  { name: "小红书", count: 8, icon: "📕", color: "bg-pink-50 text-pink-600 border-pink-200/50", hoverColor: "group-hover:bg-pink-100" },
  { name: "AI工具", count: 15, icon: "🤖", color: "bg-purple-50 text-purple-600 border-purple-200/50", hoverColor: "group-hover:bg-purple-100" },
  { name: "电商", count: 6, icon: "🛒", color: "bg-green-50 text-green-600 border-green-200/50", hoverColor: "group-hover:bg-green-100" },
]

const DEMO_PROJECTS = [
  {
    id: "1",
    title: "闲鱼AI代写服务",
    hook: "用AI帮人写工作总结、小红书文案，0成本启动月入2000+",
    category: "闲鱼",
    difficulty: "初级",
    income_estimate: "月入500-3000",
    tools_required: ["ChatGPT", "闲鱼"],
    likes: 128,
    comments: 36,
    views: "2.3k",
    trending: true,
  },
  {
    id: "2",
    title: "小红书AI壁纸号",
    hook: "AI生成精美壁纸，发小红书引流私域变现",
    category: "小红书",
    difficulty: "初级",
    income_estimate: "月入1000-5000",
    tools_required: ["Midjourney", "小红书"],
    likes: 95,
    comments: 22,
    views: "1.8k",
    trending: false,
  },
  {
    id: "3",
    title: "情侣情绪价值小程序",
    hook: "微信小程序+知识付费，情侣关系赛道稳赚",
    category: "AI工具",
    difficulty: "中级",
    income_estimate: "月入2000-10000",
    tools_required: ["微信小程序", "Coze"],
    likes: 156,
    comments: 48,
    views: "3.1k",
    trending: true,
  },
  {
    id: "4",
    title: "短视频解压动画号",
    hook: "用剪映制作解压动画，抖音/快手流量变现",
    category: "短视频",
    difficulty: "初级",
    income_estimate: "月入500-2000",
    tools_required: ["剪映", "抖音"],
    likes: 73,
    comments: 15,
    views: "1.2k",
    trending: false,
  },
]

export default async function HomePage() {
  let projects = DEMO_PROJECTS
  try {
    const supabase = await createClient()
    const { data } = await supabase
      .from("projects")
      .select("*")
      .eq("status", "published")
      .order("created_at", { ascending: false })
      .limit(4)
    if (data && data.length > 0) {
      projects = data as any
    }
  } catch {}

  const trendingProjects = projects.filter((p: any) => p.trending)

  return (
    <div>
      {/* ========== Hero ========== */}
      <section className="relative overflow-hidden py-20 md:py-28">
        <HeroBackground />
        <div className="container mx-auto relative px-4 z-10">
          <div className="max-w-3xl mx-auto text-center">
            {/* 活动标识 */}
            <div className="flex justify-center mb-6">
              <ActivityIndicator />
            </div>

            <Badge variant="secondary" className="mb-5 px-4 py-1.5 text-sm gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
              持续更新的创业项目库
            </Badge>

            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight mb-6 leading-tight">
              找到了不起的
              <span className="text-primary relative">
                {" "}创业项目{" "}
                <svg className="absolute -bottom-1 left-0 w-full h-3 text-primary/20" viewBox="0 0 100 12" preserveAspectRatio="none">
                  <path d="M0 8 Q25 0 50 8 Q75 16 100 8" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"/>
                </svg>
              </span>
              <br />
              和一起干的人
            </h1>

            <p className="text-lg text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
              每一个项目都是可落地的。有步骤、有工具、有预期收入。
              <br className="hidden md:block" />
              不再是一个人瞎摸索，找到项目，找到队友，一起干。
            </p>

            <div className="flex items-center justify-center gap-4 flex-wrap">
              <Link href="/projects">
                <Button size="lg" className="gap-2 shadow-lg shadow-primary/20">
                  浏览项目库 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login?tab=register">
                <Button variant="outline" size="lg" className="gap-2">
                  免费注册
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========== Trust Stats ========== */}
      <TrustStats />

      {/* ========== 虚拟数据展示 ========== */}
      <section className="py-8 bg-gradient-to-b from-white to-muted/20">
        <div className="container mx-auto px-4 space-y-6">
          {/* 实时数据 */}
          <VirtualStats />

          {/* 订单滚动 */}
          <OrderScroll />

          {/* 热门标签 */}
          <HotTags />
        </div>
      </section>

      {/* ========== 每日更新预告 ========== */}
      <DailyUpdatePreview />

      {/* ========== 分类导航 ========== */}
      <section className="py-16 relative">
        <SectionBackground />
        <div className="container mx-auto relative px-4 z-10">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold">按分类找项目</h2>
              <p className="text-sm text-muted-foreground mt-1">找到最适合你的创业方向</p>
            </div>
            <div className="gradient-accent-bar w-16" />
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/projects?category=${cat.name}`}
                className={`group flex flex-col items-center gap-2.5 p-6 rounded-xl border bg-white hover:shadow-md hover:border-primary/30 transition-all card-hover ${cat.color}`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-medium text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.count} 个项目</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 精选项目 ========== */}
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {projects.map((project: any, index: number) => (
              <Link key={project.id} href={`/projects/${project.id}`}>
                <Card className={`h-full hover:border-primary/30 transition-all card-hover animate-fade-up-delay-${Math.min(index, 3)}`}>
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="secondary" className="gap-1">
                          {project.category}
                        </Badge>
                        {(project as any).is_featured && (
                          <Badge variant="default" className="gap-1 bg-amber-500 text-white">
                            ⭐ 官方推荐
                          </Badge>
                        )}
                        {(project as any).is_practitioner_recommended && (
                          <Badge variant="outline" className="gap-1 text-green-600 border-green-300 bg-green-50">
                            👥 实践者推荐
                          </Badge>
                        )}
                        {project.trending && (
                          <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200 bg-amber-50">
                            <Zap className="h-3 w-3" /> 热门
                          </Badge>
                        )}
                      </div>
                      <Badge
                        variant={
                          project.difficulty === "初级"
                            ? "success"
                            : project.difficulty === "中级"
                            ? "warning"
                            : "default"
                        }
                        className="shrink-0"
                      >
                        {project.difficulty}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg mt-2 group-hover:text-primary transition-colors">
                      {project.title}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {project.hook}
                    </p>
                  </CardHeader>
                  <CardContent>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-primary">
                          {project.income_estimate}
                        </span>
                        <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                          启动成本 0元
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Star className="h-3 w-3" /> {project.likes || 0}
                        </span>
                        <span className="flex items-center gap-1">
                          💬 {project.comments || 0}
                        </span>
                        <span className="flex items-center gap-1 text-muted-foreground/60">
                          👁 {project.views || "—"}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 三大价值 ========== */}
      <section className="py-16 relative bg-gradient-to-b from-muted/20 to-white">
        <SectionBackground />
        <div className="container mx-auto relative px-4 z-10">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-bold mb-2">为什么选择创业导航？</h2>
            <p className="text-muted-foreground">三个理由让你不再自己瞎折腾</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: BookOpen,
                gradient: "from-purple-500 to-purple-600",
                bgLight: "bg-purple-50",
                title: "可落地的项目",
                desc: "每个项目都有完整步骤、工具清单和收入预期，照着做就能跑起来",
                stats: "平均 5-10 步操作流程"
              },
              {
                icon: Sparkles,
                gradient: "from-pink-500 to-rose-500",
                bgLight: "bg-pink-50",
                title: "持续更新",
                desc: "持续上新项目，覆盖最新风口。订阅后第一时间获取新项目推送",
                stats: "每周更新 2-3 个项目"
              },
              {
                icon: Users,
                gradient: "from-blue-500 to-indigo-500",
                bgLight: "bg-blue-50",
                title: "找人一起干",
                desc: "看到好项目可以找人组队，也可以发布自己的项目招募队友",
                stats: "已有 50+ 协作匹配成功"
              },
            ].map((item, i) => (
              <Card key={item.title} className={`text-center border-0 shadow-sm hover:shadow-md transition-all card-hover animate-fade-up-delay-${i}`}>
                <CardHeader>
                  <div className="flex justify-center mb-3">
                    <div className={`w-14 h-14 rounded-2xl ${item.bgLight} flex items-center justify-center bg-gradient-to-br ${item.gradient} bg-opacity-10`}>
                      <item.icon className="h-7 w-7 text-white" />
                    </div>
                  </div>
                  <CardTitle className="text-lg">{item.title}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-sm text-muted-foreground">{item.desc}</p>
                  <div className="text-xs text-primary font-medium bg-primary/5 rounded-full py-1.5 px-3 inline-block">
                    {item.stats}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 社交证明 ========== */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto rounded-2xl border bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50 p-8 md:p-10">
            <div className="flex flex-col md:flex-row items-center gap-8">
              <div className="flex -space-x-3 shrink-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium shadow-sm"
                  >
                    {["A", "B", "C", "D", "E"][i - 1]}
                  </div>
                ))}
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-sm font-medium">4.9 分 · 98.6% 好评率</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  "在这个平台找到了适合我的创业项目，跟着步骤做，第一个月就赚了 2000+"
                </p>
                <p className="text-xs text-muted-foreground mt-1">—— 来自社区成员的真实反馈</p>
              </div>
            </div>
          </div>

          {/* 学员评价展示 */}
          <div className="mt-8">
            <h3 className="text-lg font-bold mb-4 text-center">🔥 最新学员评价</h3>
            <MiniReviews />
          </div>
        </div>
      </section>

      {/* ========== 智能推荐 ========== */}
      <section className="pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <SmartRecommendation />
          </div>
        </div>
      </section>

      {/* ========== CTA ========== */}
      <section className="py-20 relative">
        <SectionBackground />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-md mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center">
                <Zap className="h-8 w-8 text-primary" />
              </div>
            </div>
            <h2 className="text-2xl md:text-3xl font-bold mb-3">
              准备好了吗？
            </h2>
            <p className="text-muted-foreground mb-8">
              注册即可浏览全部项目，找到适合你的创业方向。<br />
              前 100 名注册用户永久免费
            </p>
            <Link href="/login?tab=register">
              <Button size="lg" className="shadow-lg shadow-primary/20 gap-2">
                免费注册，开始探索 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">
              无需信用卡 · 注册即用 · 不限次数浏览
            </p>
          </div>
        </div>
      </section>

      {/* ========== 悬浮客服按钮 ========== */}
      <WechatQRCodeFloating />
    </div>
  )
}
