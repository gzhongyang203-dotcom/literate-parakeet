import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { createClient } from "@/lib/supabase/server"
import { Search } from "lucide-react"

const DEMO_PROJECTS = [
  { id: "1", title: "闲鱼AI代写服务", hook: "用AI帮人写工作总结、小红书文案，0成本启动", category: "闲鱼", difficulty: "初级", income_estimate: "月入500-3000" },
  { id: "2", title: "小红书AI壁纸号", hook: "AI生成精美壁纸，发小红书引流私域变现", category: "小红书", difficulty: "初级", income_estimate: "月入1000-5000" },
  { id: "3", title: "情侣情绪价值小程序", hook: "微信小程序+知识付费，情侣关系赛道稳赚", category: "AI工具", difficulty: "中级", income_estimate: "月入2000-10000" },
  { id: "4", title: "短视频解压动画号", hook: "用剪映制作解压动画，抖音/快手流量变现", category: "短视频", difficulty: "初级", income_estimate: "月入500-2000" },
  { id: "5", title: "AI表情包IP打造", hook: "用AI制作微信表情包，靠打赏和周边变现", category: "AI工具", difficulty: "初级", income_estimate: "月入200-2000" },
  { id: "6", title: "拼多多虚拟资料店", hook: "卖电子书/模板/教程，零成本高利润", category: "电商", difficulty: "初级", income_estimate: "月入1000-5000" },
  { id: "7", title: "AI音频助眠频道", hook: "制作助眠音频发喜马拉雅，一次制作长期收益", category: "短视频", difficulty: "中级", income_estimate: "月入200-1000" },
  { id: "8", title: "本地生活AI代运营", hook: "帮餐饮店做大众点评/小红书内容代运营", category: "更多", difficulty: "中级", income_estimate: "月入3000-10000" },
  { id: "9", title: "无脸知识短视频", hook: "做垂直行业知识科普视频，积累粉丝接广告", category: "短视频", difficulty: "初级", income_estimate: "月入500-3000" },
  { id: "10", title: "闲鱼数码转卖", hook: "在闲鱼低买高卖二手数码，赚信息差", category: "闲鱼", difficulty: "初级", income_estimate: "月入1000-5000" },
  { id: "11", title: "小红书好物测评", hook: "接品牌合作做产品测评，佣金+广告费", category: "小红书", difficulty: "初级", income_estimate: "月入500-3000" },
  { id: "12", title: "AI Agent企业服务", hook: "帮中小企业搭AI客服/知识库，收搭建费+月费", category: "AI工具", difficulty: "高级", income_estimate: "月入5000-50000" },
]

const categories = ["全部", "抖音", "快手", "闲鱼", "小红书", "AI工具", "电商"]
const difficulties = ["全部", "初级", "中级", "高级"]

export default async function ProjectsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; difficulty?: string; q?: string }>
}) {
  const params = await searchParams
  const selectedCategory = params.category || "全部"
  const selectedDifficulty = params.difficulty || "全部"
  const query = params.q || ""

  let projects = DEMO_PROJECTS
  try {
    const supabase = await createClient()
    const { data } = await supabase.from("projects").select("*").eq("status", "published")
    if (data && data.length > 0) projects = data as any
  } catch {}

  // Client-side filtering for demo mode
  let filtered = projects
  if (selectedCategory !== "全部") filtered = filtered.filter((p) => p.category === selectedCategory)
  if (selectedDifficulty !== "全部") filtered = filtered.filter((p) => p.difficulty === selectedDifficulty)
  if (query) filtered = filtered.filter((p) => p.title.includes(query) || p.hook.includes(query))

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">项目库</h1>
        <p className="text-muted-foreground">浏览可落地的创业项目，找到适合你的方向</p>
      </div>

      {/* Search */}
      <form className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input name="q" placeholder="搜索项目..." defaultValue={query} className="pl-9" />
      </form>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 mb-8">
        <div className="flex flex-wrap gap-2">
          {categories.map((cat) => (
            <Link key={cat} href={`/projects?category=${cat}&difficulty=${selectedDifficulty}`}>
              <Badge variant={selectedCategory === cat ? "default" : "outline"} className="cursor-pointer">
                {cat}
              </Badge>
            </Link>
          ))}
        </div>
        <div className="flex flex-wrap gap-2">
          {difficulties.map((diff) => (
            <Link key={diff} href={`/projects?category=${selectedCategory}&difficulty=${diff}`}>
              <Badge variant={selectedDifficulty === diff ? "default" : "outline"} className="cursor-pointer">
                {diff === "全部" ? "全部难度" : diff}
              </Badge>
            </Link>
          ))}
        </div>
      </div>

      {/* Project Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((project: any) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="h-full hover:border-primary/50 transition-all hover:shadow-md">
              <CardHeader>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex flex-wrap gap-1">
                    <Badge variant="secondary">{project.category}</Badge>
                    {(project as any).is_featured && (
                      <Badge variant="default" className="text-xs bg-amber-500 text-white">⭐</Badge>
                    )}
                    {(project as any).is_practitioner_recommended && (
                      <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">👥</Badge>
                    )}
                  </div>
                  <Badge variant={project.difficulty === "初级" ? "success" : project.difficulty === "中级" ? "warning" : "default"}>
                    {project.difficulty}
                  </Badge>
                </div>
                <CardTitle className="text-lg mt-2">{project.title}</CardTitle>
                <p className="text-sm text-muted-foreground line-clamp-2">{project.hook}</p>
              </CardHeader>
              <CardContent>
                <span className="font-medium text-primary text-sm">{project.income_estimate}</span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p className="text-lg mb-4">没有找到匹配的项目</p>
          <Link href="/projects">
            <Button variant="outline">清除筛选条件</Button>
          </Link>
        </div>
      )}
    </div>
  )
}
