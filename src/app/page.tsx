import Link from "next/link"
import { Suspense } from "react"
import { ArrowRight, Sparkles, Users, BookOpen, TrendingUp, Star, Zap, Shield, Heart, Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { HeroBackground, SectionBackground } from "@/components/decorations"
import { TrustStats, ActivityIndicator } from "@/components/trust-stats"
import { DailyUpdatePreview } from "@/components/daily-update"
import { SmartRecommendation } from "@/components/smart-recommendation"
import { VirtualStats, OrderScroll, HotTags } from "@/components/virtual-data"
import { MiniReviews } from "@/components/project-reviews"
import { FeaturedProjectsSection } from "@/components/featured-projects"

const categories = [
  { name: "抖音", count: 8, icon: "🎵", color: "bg-black text-white border-gray-800/50", hoverColor: "group-hover:bg-gray-800" },
  { name: "快手", count: 5, icon: "📱", color: "bg-pink-50 text-pink-600 border-pink-200/50", hoverColor: "group-hover:bg-pink-100" },
  { name: "闲鱼", count: 12, icon: "🏪", color: "bg-orange-50 text-orange-600 border-orange-200/50", hoverColor: "group-hover:bg-orange-100" },
  { name: "小红书", count: 8, icon: "📕", color: "bg-pink-50 text-pink-600 border-pink-200/50", hoverColor: "group-hover:bg-pink-100" },
  { name: "AI工具", count: 15, icon: "🤖", color: "bg-purple-50 text-purple-600 border-purple-200/50", hoverColor: "group-hover:bg-purple-100" },
  { name: "电商", count: 6, icon: "🛒", color: "bg-green-50 text-green-600 border-green-200/50", hoverColor: "group-hover:bg-green-100" },
]

const successStories = [
  {
    emoji: "💼",
    quote: "白天是会计，晚上在闲鱼月入6000",
    detail: "跟着平台的闲鱼AI代写方案，下班后每天花1小时，第三个月副业超过主业",
    tag: "上班族 · 零基础",
  },
  {
    emoji: "🔥",
    quote: "裁员后靠小红书带货，现在比上班挣得多",
    detail: "被裁员后跟着做了小红书AI壁纸号，现在全职做，月入稳定2万+",
    tag: "转行成功 · 小红书",
  },
  {
    emoji: "👩",
    quote: "38岁宝妈，一台手机做起情感咨询",
    detail: "之前在店里打工，现在用微信做情感咨询，时间自由还能带娃",
    tag: "宝妈逆袭 · 情感赛道",
  },
]

export default function HomePage() {
  return (
    <div>
      {/* ========== Hero - 情绪共鸣 ========== */}
      <section className="relative overflow-hidden py-12 sm:py-16 md:py-28">
        <HeroBackground />
        <div className="container mx-auto relative px-4 z-10">
          <div className="max-w-3xl mx-auto text-center">
            <div className="flex justify-center mb-4">
              <ActivityIndicator />
            </div>

            {/* 社会证明小字 */}
            <p className="text-xs sm:text-sm text-muted-foreground mb-4 sm:mb-5">
              🔥 已有 <strong className="text-foreground">2,847 人</strong> 找到副业方向
            </p>

            <h1 className="heading-xl text-2xl sm:text-3xl md:text-5xl lg:text-6xl mb-4 sm:mb-6 px-2">
              你不是不想努力，
              <br />
              只是缺一个
              <span className="text-gradient-premium"> 能落地的副业</span>
            </h1>

            <p className="text-sm sm:text-base text-muted-foreground mb-6 sm:mb-10 max-w-2xl mx-auto leading-relaxed px-2">
              每天30分钟，第2个月副业收入超过工资
              <br className="hidden md:block" />
              不是鸡汤，是手把手带着做
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4 px-2">
              <Link href="/projects" className="w-full sm:w-auto">
                <Button size="lg" className="btn-rounded gap-2 shadow-lg shadow-primary/20 text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                  看看别人在做什么 <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/pricing" className="w-full sm:w-auto">
                <Button variant="outline" size="lg" className="btn-rounded gap-2 text-sm sm:text-base px-6 sm:px-8 py-5 sm:py-6 w-full sm:w-auto">
                  了解方案
                </Button>
              </Link>
            </div>

            <p className="text-xs text-muted-foreground mt-4">
              前100名注册送《副业避坑手册》电子版
            </p>
          </div>
        </div>
      </section>

      {/* ========== Trust Stats ========== */}
      <TrustStats />

      {/* ========== 虚拟数据展示 ========== */}
      <section className="py-8 bg-gradient-to-b from-white to-muted/20">
        <div className="container mx-auto px-4 space-y-6">
          <VirtualStats />
          <OrderScroll />
          <HotTags />
        </div>
      </section>

      {/* ========== 为什么他们能 —— 成功故事 ========== */}
      <section className="py-16 bg-gradient-to-b from-muted/20 to-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-10">
            <Badge variant="secondary" className="mb-3 px-4 py-1.5 text-sm gap-1.5">
              <Star className="h-3.5 w-3.5 text-amber-500" />
              真实逆袭故事
            </Badge>
            <h2 className="heading-lg text-2xl md:text-3xl mb-2">为什么他们能，你不能？</h2>
            <p className="text-muted-foreground text-sm">他们唯一的共同点：行动了</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {successStories.map((story, i) => (
              <Card
                key={i}
                className={`border-0 card-premium animate-fade-up-delay-${i} overflow-hidden`}
              >
                <CardContent className="p-6">
                  <div className="text-3xl mb-3">{story.emoji}</div>
                  <p className="font-bold text-base mb-2 leading-relaxed">{story.quote}</p>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{story.detail}</p>
                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="text-xs">{story.tag}</Badge>
                    <Link
                      href="/pricing"
                      className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      你也可以 <ArrowRight className="h-3 w-3" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
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
              <h2 className="heading-lg text-2xl">按分类找项目</h2>
              <p className="text-sm text-muted-foreground mt-1">找到最适合你的创业方向</p>
            </div>
            <div className="gradient-accent-bar w-16" />
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.name}
                href={`/projects?category=${cat.name}`}
                className={`group flex flex-col items-center gap-2.5 p-6 rounded-xl border bg-white card-premium ${cat.color}`}
              >
                <span className="text-2xl">{cat.icon}</span>
                <span className="font-medium text-sm">{cat.name}</span>
                <span className="text-xs text-muted-foreground">{cat.count} 个项目</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ========== 精选项目 (Suspense: 前3免费 + 第4模糊) ========== */}
      <Suspense fallback={
        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="flex justify-between mb-8">
              <div>
                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
                <div className="h-4 w-48 mt-1 bg-muted rounded animate-pulse" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[1,2,3,4].map((i) => (
                <div key={i} className="rounded-xl border p-6 animate-pulse">
                  <div className="flex justify-between"><div className="h-6 w-16 bg-muted rounded-full" /><div className="h-6 w-12 bg-muted rounded-full" /></div>
                  <div className="h-6 w-3/4 mt-3 bg-muted rounded" />
                  <div className="h-4 w-full mt-2 bg-muted rounded" />
                  <div className="flex justify-between mt-4"><div className="h-5 w-24 bg-muted rounded" /><div className="h-5 w-32 bg-muted rounded" /></div>
                </div>
              ))}
            </div>
          </div>
        </section>
      }>
        <FeaturedProjectsSection />
      </Suspense>

      {/* ========== 三大价值 ========== */}
      <section className="py-16 relative bg-gradient-to-b from-muted/20 to-white">
        <SectionBackground />
        <div className="container mx-auto relative px-4 z-10">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-2xl mb-2">为什么选择创业导航？</h2>
            <p className="text-muted-foreground">三个理由让你不再自己瞎折腾</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              { icon: BookOpen, gradient: "from-purple-500 to-purple-600", bgLight: "bg-purple-50", title: "可落地的项目", desc: "每个项目都有完整步骤、工具清单和收入预期，照着做就能跑起来", stats: "平均 5-10 步操作流程" },
              { icon: Sparkles, gradient: "from-pink-500 to-rose-500", bgLight: "bg-pink-50", title: "持续更新", desc: "持续上新项目，覆盖最新风口。订阅后第一时间获取新项目推送", stats: "每周更新 2-3 个项目" },
              { icon: Users, gradient: "from-blue-500 to-indigo-500", bgLight: "bg-blue-50", title: "找人一起干", desc: "看到好项目可以找人组队，也可以发布自己的项目招募队友", stats: "已有 50+ 协作匹配成功" },
            ].map((item, i) => (
              <Card key={item.title} className={`text-center border-0 card-premium animate-fade-up-delay-${i}`}>
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
                  <div className="text-xs text-primary font-medium bg-primary/5 rounded-full py-1.5 px-3 inline-block">{item.stats}</div>
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
            <div className="flex flex-col md:flex-row items-center gap-6 md:gap-8">
              <div className="flex -space-x-3 shrink-0">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="w-9 h-9 sm:w-10 sm:h-10 rounded-full border-2 border-white bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-medium shadow-sm">
                    {["A","B","C","D","E"][i-1]}
                  </div>
                ))}
              </div>
              <div className="text-center md:text-left">
                <div className="flex items-center gap-2 justify-center md:justify-start mb-2">
                  <div className="flex">
                    {[1,2,3,4,5].map((i) => (<Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />))}
                  </div>
                  <span className="text-sm font-medium">4.9 分 · 98.6% 好评率</span>
                </div>
                <p className="body-premium text-muted-foreground">"在这个平台找到了适合我的创业项目，跟着步骤做，第一个月就赚了 2000+"</p>
                <p className="text-xs text-muted-foreground mt-1">—— 来自社区成员的真实反馈</p>
              </div>
            </div>
          </div>
          <div className="mt-8">
            <h3 className="heading-lg text-lg mb-4 text-center">🔥 最新学员评价</h3>
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

      {/* ========== 代理推广 ========== */}
      <section className="py-10 sm:py-12 md:py-16 bg-gradient-to-r from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <Card className="border-primary/10 bg-white/80 backdrop-blur card-premium overflow-hidden">
              <CardContent className="p-8 md:p-10">
                <div className="flex flex-col md:flex-row items-center gap-8">
                  <div className="flex-1 text-center md:text-left">
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-xs font-medium mb-4">
                      <TrendingUp className="h-3 w-3" />
                      零成本创业机会
                    </div>
                    <h2 className="heading-lg text-2xl md:text-3xl mb-3">
                      分享即赚钱，
                      <br />
                      <span className="text-gradient-premium">
                        成为代理推广者
                      </span>
                    </h2>
                    <p className="body-premium text-muted-foreground mb-6">
                      无需囤货、无需押金。分享专属链接，每成交一单获得
                      <strong className="text-premium-purple">10%-50%持续分佣</strong>。
                      已有代理月入3000+
                    </p>
                    <Link href="/agent">
                      <Button className="btn-rounded gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                        了解代理计划 <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                  <div className="flex-shrink-0">
                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-2xl bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shadow-premium">
                      <Wallet className="h-12 w-12 md:h-16 md:w-16 text-white" />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* ========== 底部CTA - 行动号召 ========== */}
      <section className="py-12 sm:py-16 md:py-20 relative bg-gradient-to-b from-white to-purple-50/30">
        <SectionBackground />
        <div className="container mx-auto px-4 relative z-10 text-center">
          <div className="max-w-lg mx-auto">
            <div className="flex justify-center mb-6">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center shadow-premium">
                <Zap className="h-8 w-8 text-white" />
              </div>
            </div>
            <h2 className="heading-xl text-2xl sm:text-3xl md:text-4xl mb-3">
              别再看了，你做第
              <span className="text-gradient-premium">2878</span>
              个行动的
            </h2>
            <p className="body-premium text-muted-foreground mb-8 max-w-sm mx-auto">
              前100名送《副业避坑手册》电子版<br />
              别人已经在路上了，你还要等多久？
            </p>

            {/* CTA 按钮 */}
            <Link href="/pricing">
              <Button size="lg" className="btn-rounded shadow-premium gap-2 text-lg px-10 py-7">
                立即加入 <ArrowRight className="h-5 w-5" />
              </Button>
            </Link>
            <p className="text-xs text-muted-foreground mt-4">不满意7天无理由退款 · 零风险</p>

            {/* 微信兜底卡片 */}
            <div className="mt-10 bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 max-w-sm mx-auto">
              <div className="flex items-center gap-2 mb-3 justify-center">
                <span className="text-xl">💬</span>
                <h3 className="font-bold text-green-800 text-sm">先看看免费的，觉得靠谱再付费</h3>
              </div>
              <p className="text-sm text-green-700 mb-3">
                加客服微信，免费领2个项目方案看看
              </p>
              <div className="bg-white rounded-xl p-3 border border-green-100">
                <p className="text-xs text-muted-foreground mb-1">客服微信号</p>
                <p className="font-mono font-bold text-lg text-green-600">gcy892</p>
                <p className="text-xs text-green-600/70 mt-1">备注"项目咨询"优先通过</p>
              </div>
              <p className="text-xs text-green-600/70 mt-3">
                随时可删，零压力
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
