import { notFound } from "next/navigation"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/server"
import { CalendarDays, ArrowLeft, Users, Eye, TrendingUp, Clock, Wallet } from "lucide-react"
import { ProjectDetailClient } from "./client"
import { ShareButton } from "./share-button"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { ReadingProgress } from "@/components/project/reading-progress"
import { ProjectScoreboard } from "@/components/project/scoreboard"
import { ToolChecklist } from "@/components/project/tool-checklist"
import { ExecutionChecklist } from "@/components/project/execution-checklist"

const DEMO_PROJECTS: Record<string, any> = {
  "1": {
    id: "1",
    title: "闲鱼AI代写服务",
    hook: "用AI帮人写工作总结、小红书文案，0成本启动月入2000+",
    category: "闲鱼",
    difficulty: "初级",
    income_estimate: "月入500-3000",
    tools_required: ["ChatGPT", "DeepSeek", "闲鱼App"],
    content: `## 项目简介

用AI工具帮别人写文案、写总结，在闲鱼上接单。**零成本启动**，只需要会使用AI工具就行。

## 适合人群

- 会打字、会使用AI工具的人
- 每天能抽出1-2小时
- 不需要任何专业背景

## 预期收入

- 入门期（1-2周）：月入 500-1000 元
- 稳定期（1-2个月）：月入 1000-3000 元
- 放大期（3个月+）：月入 3000-8000+ 元

## 操作步骤

### 第一步：确定服务品类

选择 2-3 个你熟悉的文案类型：
- **工作总结/述职报告** — 需求量大，单价 30-50 元
- **小红书文案** — 年轻用户多，单价 15-30 元
- **短视频脚本** — 需求增长快，单价 30-80 元
- **简历修改** — 应届生刚需，单价 20-50 元
- **PPT大纲** — 职场需求，单价 20-40 元

### 第二步：准备商品图片和文案

用 Canva 或手机做几张简单的商品图：
- 白底图 + 文字标题
- 放一个效果对比图（AI写的前后对比）

### 第三步：上架闲鱼

1. 打开闲鱼 → 卖闲置
2. 标题格式：\`AI代写XX文案 快速出稿 不满意免费改\`
3. 定价建议：**29-49元** 作为引流价
4. 描述里写清楚：服务内容、交付时间（24小时内）、修改次数

### 第四步：接单流程

1. 客户下单 → 确认需求
2. 用 AI 生成初稿
3. 人工审核修改（关键！）
4. 交付给客户
5. 引导好评

### 第五步：放大

- 好评多了自然流量就来了
- 可以开多个闲鱼号矩阵操作
- 老客户复购和转介绍

## 常见坑点

1. **不要直接复制AI输出** — 客户能看出来，一定要人工润色
2. **定价不要太低** — 9.9 元的单子不值得做，时间和收益不成正比
3. **注意交付时间** — 承诺24小时内就要做到，超时会掉评分
4. **引导好评** — 闲鱼好评对流量影响很大

## 进阶玩法

- 做熟之后可以开"包月"服务（199元/月，每月8篇文章）
- 拉个微信群维护老客户
- 发展下线分销（你接单，别人写，你抽成）
`,
    is_premium: false,
    author_nickname: "创业导航",
    created_at: "2026-04-15",
    like_count: 128,
    comment_count: 36,
  },
  "2": {
    id: "2",
    title: "小红书AI壁纸号",
    hook: "AI生成精美壁纸，发小红书引流私域变现",
    category: "小红书",
    difficulty: "初级",
    income_estimate: "月入1000-5000",
    tools_required: ["Midjourney / 通义万相", "小红书"],
    content: "## 项目简介\n\n用AI生成壁纸、头像等视觉内容，发小红书引流到私域变现。\n\n## 操作步骤\n\n1. 用AI工具生成统一风格的壁纸\n2. 每天发 2-3 条小红书笔记\n3. 引导用户到私域购买高清图包\n\n> 详情内容持续更新中...",
    is_premium: false,
    author_nickname: "创业导航",
    created_at: "2026-04-10",
    like_count: 95,
    comment_count: 22,
  },
}

// 项目评分数据
const PROJECT_SCORES: Record<string, Array<{ label: string; score: number; desc: string }>> = {
  "1": [
    { label: "可落地性", score: 5, desc: "即学即会" },
    { label: "收入潜力", score: 4, desc: "稳定可预期" },
    { label: "上手难度", score: 5, desc: "零基础可做" },
    { label: "扩展空间", score: 4, desc: "可矩阵放大" },
    { label: "复购率", score: 4, desc: "老客户回流高" },
  ],
  "2": [
    { label: "可落地性", score: 4, desc: "有一定学习成本" },
    { label: "收入潜力", score: 5, desc: "上限高" },
    { label: "上手难度", score: 4, desc: "需要审美" },
    { label: "扩展空间", score: 5, desc: "可矩阵操作" },
    { label: "复购率", score: 3, desc: "依赖持续输出" },
  ],
}

// 工具清单
const TOOL_LISTS: Record<string, Array<{ name: string; desc: string; link?: string; free?: boolean }>> = {
  "1": [
    { name: "ChatGPT", desc: "AI文案生成，免费版即可", link: "https://chat.openai.com", free: true },
    { name: "DeepSeek", desc: "国产AI，中文写作能力更强", link: "https://chat.deepseek.com", free: true },
    { name: "闲鱼App", desc: "接单平台", link: "https://2.taobao.com", free: true },
    { name: "Canva 可画", desc: "制作商品主图", link: "https://www.canva.cn", free: true },
  ],
  "2": [
    { name: "通义万相", desc: "免费AI图片生成", link: "https://tongyi.aliyun.com", free: true },
    { name: "小红书App", desc: "内容发布平台", free: true },
    { name: "Canva 可画", desc: "图片精修和排版", link: "https://www.canva.cn", free: true },
    { name: "剪映", desc: "壁纸类短视频制作", free: true },
  ],
}

// 执行检查清单
const CHECKLISTS: Record<string, Array<{ id: string; title: string; desc: string; time: string; phase: "准备" | "执行" | "优化" }>> = {
  "1": [
    { id: "s1", title: "注册闲鱼账号", desc: "完成支付宝实名认证", time: "10分钟", phase: "准备" },
    { id: "s2", title: "注册AI工具", desc: "ChatGPT 或 DeepSeek 任一即可", time: "5分钟", phase: "准备" },
    { id: "s3", title: "确定服务品类", desc: "选2-3个文案类型，做竞品调研", time: "30分钟", phase: "准备" },
    { id: "s4", title: "制作商品主图", desc: "用 Canva 做3-5张简单的商品图", time: "1小时", phase: "准备" },
    { id: "s5", title: "上架第一个商品", desc: "定价29-49元，写清楚服务内容", time: "20分钟", phase: "执行" },
    { id: "s6", title: "接第一单", desc: "接到单后用AI生成+人工润色交付", time: "1-2小时", phase: "执行" },
    { id: "s7", title: "积累好评", desc: "成交后引导客户好评", time: "持续", phase: "执行" },
    { id: "s8", title: "优化定价", desc: "根据市场需求调整价格和服务", time: "1小时", phase: "优化" },
    { id: "s9", title: "矩阵操作", desc: "好评稳定后开第二个闲鱼号", time: "30分钟", phase: "优化" },
    { id: "s10", title: "建微信群", desc: "积累老客户，建立私域流量", time: "30分钟", phase: "优化" },
  ],
  "2": [
    { id: "s1", title: "注册AI工具", desc: "通义万相免费注册", time: "5分钟", phase: "准备" },
    { id: "s2", title: "确定风格方向", desc: "选定壁纸主题（可爱、极简、风景等）", time: "30分钟", phase: "准备" },
    { id: "s3", title: "生成首批壁纸", desc: "用AI生成20+张壁纸备用", time: "1小时", phase: "准备" },
    { id: "s4", title: "发布第一条笔记", desc: "小红书发笔记，标签选择精准", time: "20分钟", phase: "执行" },
    { id: "s5", title: "持续发布", desc: "每天发2-3条，坚持30天", time: "1小时/天", phase: "执行" },
    { id: "s6", title: "总结数据", desc: "分析哪类壁纸最受欢迎", time: "30分钟", phase: "优化" },
    { id: "s7", title: "放大产出", desc: "用模板批量生成，提高效率", time: "1小时", phase: "优化" },
  ],
}

// 相关项目推荐
const RELATED_PROJECTS: Record<string, Array<{ id: string; title: string; category: string }>> = {
  "1": [
    { id: "5", title: "AI表情包IP打造", category: "AI工具" },
    { id: "9", title: "无脸知识短视频", category: "短视频" },
    { id: "6", title: "拼多多虚拟资料店", category: "电商" },
  ],
  "2": [
    { id: "5", title: "AI表情包IP打造", category: "AI工具" },
    { id: "7", title: "AI+POD按需打印", category: "电商" },
    { id: "8", title: "AI图库供稿", category: "更多" },
  ],
}

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params

  let project: any = DEMO_PROJECTS[id]
  let userSubscription: any = null
  let userId: string | null = null

  // 获取用户和订阅状态
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    userId = user?.id || null

    if (user) {
      const { data: sub } = await supabase
        .from("subscriptions")
        .select("*")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single()
      userSubscription = sub
    }
  } catch {}

  if (!project) {
    try {
      const supabase = await createClient()
      const { data } = await supabase.from("projects").select("*").eq("id", id).single()
      if (data) project = data
    } catch {}
  }

  if (!project) notFound()

  // 检查是否有权限访问付费内容
  const hasAccess = !project.is_premium || userSubscription !== null

  const scores = PROJECT_SCORES[id] || PROJECT_SCORES["1"]
  const tools = TOOL_LISTS[id] || TOOL_LISTS["1"]
  const checklist = CHECKLISTS[id] || CHECKLISTS["1"]
  const related = RELATED_PROJECTS[id] || []

  // 显示内容的部分（付费墙之后的部分）
  const showFullContent = hasAccess

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
                {project.created_at}
              </div>
              <span className="font-medium text-primary">{project.income_estimate}</span>
              <span>❤️ {project.like_count || 0}</span>
              <span>💬 {project.comment_count || 0}</span>
              <span>👁 2.3k</span>
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
            {showFullContent && (
              <>
                <div className="prose max-w-none mb-12">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {project.content}
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
                  {related.map((rp) => (
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
