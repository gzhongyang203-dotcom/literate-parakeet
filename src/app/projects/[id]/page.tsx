import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { CalendarDays, ArrowLeft, Eye, TrendingUp, Clock, Wallet } from "lucide-react"
import { ProjectDetailClient } from "./client"
import { ShareButton } from "./share-button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ReadingProgress } from "@/components/project/reading-progress"
import { ProjectScoreboard } from "@/components/project/scoreboard"
import { ToolChecklist } from "@/components/project/tool-checklist"
import { ExecutionChecklist } from "@/components/project/execution-checklist"

// 项目评分数据
const PROJECT_SCORES: Record<string, Array<{ label: string; score: number; desc: string }>> = {
  default: [
    { label: "可落地性", score: 5, desc: "即学即会" },
    { label: "收入潜力", score: 4, desc: "稳定可预期" },
    { label: "上手难度", score: 5, desc: "零基础可做" },
    { label: "扩展空间", score: 4, desc: "可矩阵放大" },
    { label: "复购率", score: 4, desc: "老客户回流高" },
  ],
}

// 工具清单
const TOOL_LISTS: Record<string, Array<{ name: string; desc: string; link?: string; free?: boolean }>> = {
  default: [
    { name: "ChatGPT", desc: "AI文案生成，免费版即可", link: "https://chat.openai.com", free: true },
    { name: "DeepSeek", desc: "国产AI，中文写作能力更强", link: "https://chat.deepseek.com", free: true },
    { name: "闲鱼App", desc: "接单平台", link: "https://2.taobao.com", free: true },
  ],
}

// 执行检查清单
const CHECKLISTS: Record<string, Array<{ id: string; title: string; desc: string; time: string; phase: "准备" | "执行" | "优化" }>> = {
  default: [
    { id: "s1", title: "注册平台账号", desc: "完成基础认证", time: "10分钟", phase: "准备" },
    { id: "s2", title: "注册AI工具", desc: "ChatGPT 或 DeepSeek 任一即可", time: "5分钟", phase: "准备" },
    { id: "s3", title: "确定服务品类", desc: "选2-3个方向，做竞品调研", time: "30分钟", phase: "准备" },
    { id: "s4", title: "制作商品素材", desc: "用 Canva 做商品图", time: "1小时", phase: "准备" },
    { id: "s5", title: "上架第一个商品", desc: "定价合理，写清楚服务内容", time: "20分钟", phase: "执行" },
    { id: "s6", title: "接第一单", desc: "接到单后用AI生成+人工润色交付", time: "1-2小时", phase: "执行" },
    { id: "s7", title: "积累好评", desc: "成交后引导客户好评", time: "持续", phase: "执行" },
    { id: "s8", title: "优化定价", desc: "根据市场需求调整价格", time: "1小时", phase: "优化" },
    { id: "s9", title: "矩阵操作", desc: "好评稳定后开第二个账号", time: "30分钟", phase: "优化" },
  ],
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || null

  // 从数据库获取项目
  let project: any = null
  const { data } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single()

  if (data) project = data

  if (!project) notFound()

  // 获取用户订阅状态
  let userSubscription: any = null
  if (userId) {
    const { data: sub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .single()
    userSubscription = sub
  }

  // 检查是否有权限访问付费内容
  const hasAccess = !project.is_premium || userSubscription !== null

  // 获取作者信息
  let authorNickname = "创业导航"
  if (project.author_id) {
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", project.author_id)
      .single()
    if (profile?.nickname) authorNickname = profile.nickname
  }

  // 获取点赞和评论数
  const { count: likeCount } = await supabase
    .from("likes")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id)

  const { count: commentCount } = await supabase
    .from("comments")
    .select("*", { count: "exact", head: true })
    .eq("project_id", id)

  const scores = PROJECT_SCORES[id] || PROJECT_SCORES["default"]
  const tools = TOOL_LISTS[id] || TOOL_LISTS["default"]
  const checklist = CHECKLISTS[id] || CHECKLISTS["default"]

  // 获取相关项目（同分类的已发布项目）
  const { data: relatedData } = await supabase
    .from("projects")
    .select("id, title, category")
    .eq("status", "published")
    .eq("category", project.category)
    .neq("id", id)
    .limit(3)

  const related = relatedData || []

  return (
    <>
      <ReadingProgress />
      <div className="container mx-auto px-4 py-8">
        {/* Back button */}
        <Link href="/projects" className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-primary mb-6">
          <ArrowLeft className="h-4 w-4" /> 返回项目库
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex items-start gap-2 mb-3 flex-wrap">
              <Badge variant="secondary">{project.category}</Badge>
              <Badge variant={project.difficulty === "初级" ? "success" : project.difficulty === "中级" ? "warning" : "default"}>
                {project.difficulty}
              </Badge>
              {project.is_premium && <Badge variant="default">付费</Badge>}
            </div>

            <h1 className="text-3xl font-bold mb-2">{project.title}</h1>
            <p className="text-lg text-muted-foreground mb-6">{project.hook}</p>

            {/* Meta info */}
            <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-6 pb-4 border-b">
              <div className="flex items-center gap-1">
                <CalendarDays className="h-4 w-4" />
                {new Date(project.created_at).toLocaleDateString("zh-CN")}
              </div>
              <span className="font-medium text-primary">{project.income_estimate}</span>
              <span>❤️ {likeCount || 0}</span>
              <span>💬 {commentCount || 0}</span>
              <span>👤 {authorNickname}</span>
            </div>

            {/* Quick stats row */}
            <div className="grid grid-cols-3 gap-3 mb-8">
              <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 border border-green-100">
                <Wallet className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-xs text-muted-foreground">启动成本</p>
                  <p className="text-sm font-bold text-green-700">0 元</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-blue-50 border border-blue-100">
                <Clock className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-xs text-muted-foreground">上手时间</p>
                  <p className="text-sm font-bold text-blue-700">1 天</p>
                </div>
              </div>
              <div className="flex items-center gap-2 p-3 rounded-lg bg-purple-50 border border-purple-100">
                <TrendingUp className="h-4 w-4 text-purple-600" />
                <div>
                  <p className="text-xs text-muted-foreground">见收入周期</p>
                  <p className="text-sm font-bold text-purple-700">1-2 周</p>
                </div>
              </div>
            </div>

            {/* Premium Paywall */}
            {project.is_premium && !hasAccess && (
              <div className="p-8 rounded-xl bg-gradient-to-r from-purple-50 to-pink-50 border text-center">
                <div className="w-16 h-16 rounded-full bg-purple-100 flex items-center justify-center mx-auto mb-4">
                  <svg className="h-8 w-8 text-purple-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-2">付费项目</h3>
                <p className="text-muted-foreground mb-6 max-w-md mx-auto">
                  此项目为付费内容，包含完整执行指南、工具链接、踩坑笔记和进阶玩法
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Link href="/pricing">
                    <Button size="lg" className="w-full sm:w-auto">
                      立即订阅解锁
                    </Button>
                  </Link>
                  {!userId && (
                    <Link href={`/login?redirect=/projects/${id}`}>
                      <Button size="lg" variant="outline" className="w-full sm:w-auto">
                        登录
                      </Button>
                    </Link>
                  )}
                </div>
                <p className="text-xs text-muted-foreground mt-4">
                  订阅仅需 ¥29/月，解锁全部付费项目
                </p>
              </div>
            )}

            {/* Content (only shown if has access) */}
            {hasAccess && (
              <>
                <div className="prose max-w-none mb-12">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.content || "*项目详情整理中...*"}
                  </ReactMarkdown>
                </div>

                {/* Execution Checklist */}
                <div className="mb-10 border rounded-xl p-6 bg-white">
                  <ExecutionChecklist steps={checklist} />
                </div>
              </>
            )}

            {/* Related Projects */}
            {related.length > 0 && (
              <div className="mt-12">
                <h3 className="text-lg font-semibold mb-4">相关项目推荐</h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {related.map((rp: any) => (
                    <Link key={rp.id} href={`/projects/${rp.id}`}>
                      <Card className="card-hover h-full group">
                        <CardContent className="p-4">
                          <Badge variant="secondary" className="text-[10px] mb-2">{rp.category}</Badge>
                          <p className="text-sm font-medium group-hover:text-primary transition-colors">{rp.title}</p>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-5">
            {/* Scoreboard */}
            <div className="rounded-xl border p-5">
              <ProjectScoreboard scores={scores} />
            </div>

            {/* Tool Checklist */}
            <div className="rounded-xl border p-5">
              <ToolChecklist tools={tools} />
            </div>

            {/* Info card */}
            <div className="rounded-xl border p-5 space-y-3">
              <h3 className="font-semibold text-sm">项目信息</h3>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="text-muted-foreground text-xs">预期收入</span>
                  <p className="font-medium text-primary">{project.income_estimate}</p>
                </div>
                <div>
                  <span className="text-muted-foreground text-xs">难度等级</span>
                  <p>{project.difficulty}</p>
                </div>
                {project.tools_required && project.tools_required.length > 0 && (
                  <div>
                    <span className="text-muted-foreground text-xs">所需工具</span>
                    <p className="text-xs">{project.tools_required.join("、")}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Collaboration */}
            <ProjectDetailClient projectId={project.id} />

            {/* Share */}
            <div className="rounded-xl border p-5">
              <h3 className="font-semibold text-sm mb-3">分享这个项目</h3>
              <div className="flex gap-2">
                <ShareButton />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
