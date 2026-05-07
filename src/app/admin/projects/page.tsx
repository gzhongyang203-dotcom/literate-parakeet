"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit3, Trash2, Eye, FileText, Sparkles, Loader2, X, Save } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const categories = ["全部", "抖音", "快手", "闲鱼", "小红书", "AI工具", "电商"]
const statuses = ["全部", "published", "draft"]

interface Project {
  id: string
  title: string
  category: string
  difficulty: string
  status: string
  is_premium: boolean
  is_featured: boolean
  is_practitioner_recommended: boolean
  recommend_reason: string
  hook: string
  income_estimate: string
  tools_required: string[]
  content: string
  created_at: string
}

const EDITOR_TEMPLATE = `## 项目简介

用一两句话介绍这个项目是什么，解决什么问题。

## 适合人群

- 需要什么基础？
- 每天需要多长时间？

## 预期收入

- 入门期：月入 xx 元
- 稳定期：月入 xx 元

## 所需工具

1. 工具A — 用途说明
2. 工具B — 用途说明

## 启动成本

**xx 元**。包含哪些费用？

## 操作步骤

### 第一步：准备工作

具体做什么...

### 第二步：开始执行

具体做什么...

### 第三步：优化放大

具体做什么...

## 常见坑点

1. **坑点标题** — 为什么会有这个坑，怎么避开
2. **另一个坑** — 同上

## 进阶玩法

- 跑通后怎么放大收入
- 可以延伸的方向
`

export default function AdminProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState("全部")
  const [statusFilter, setStatusFilter] = useState("全部")
  const [search, setSearch] = useState("")
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState("AI工具")
  const [formDifficulty, setFormDifficulty] = useState("初级")
  const [formHook, setFormHook] = useState("")
  const [formIncome, setFormIncome] = useState("")
  const [formContent, setFormContent] = useState(EDITOR_TEMPLATE)
  const [formPremium, setFormPremium] = useState(false)
  const [formFeatured, setFormFeatured] = useState(false)
  const [formPractitioner, setFormPractitioner] = useState(false)
  const [formRecommendReason, setFormRecommendReason] = useState("")

  useEffect(() => {
    fetchProjects()
  }, [filter, statusFilter, search])

  const fetchProjects = async () => {
    const supabase = createClient()
    let query = supabase.from("projects").select("*").order("created_at", { ascending: false })

    if (filter !== "全部") {
      query = query.eq("category", filter)
    }
    if (statusFilter !== "全部") {
      query = query.eq("status", statusFilter)
    }
    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data } = await query
    if (data) setProjects(data)
    setLoading(false)
  }

  const openEditor = (proj?: Project) => {
    if (proj) {
      setEditingId(proj.id)
      setFormTitle(proj.title)
      setFormCategory(proj.category || "AI工具")
      setFormDifficulty(proj.difficulty || "初级")
      setFormHook(proj.hook || "")
      setFormIncome(proj.income_estimate || "")
      setFormContent(proj.content || EDITOR_TEMPLATE)
      setFormPremium(proj.is_premium || false)
      setFormFeatured(proj.is_featured || false)
      setFormPractitioner(proj.is_practitioner_recommended || false)
      setFormRecommendReason(proj.recommend_reason || "")
    } else {
      setEditingId(null)
      setFormTitle("")
      setFormCategory("AI工具")
      setFormDifficulty("初级")
      setFormHook("")
      setFormIncome("")
      setFormContent(EDITOR_TEMPLATE)
      setFormPremium(false)
      setFormFeatured(false)
      setFormPractitioner(false)
      setFormRecommendReason("")
    }
    setShowEditor(true)
    setPreviewMode(false)
  }

  const closeEditor = () => {
    setShowEditor(false)
    setEditingId(null)
  }

  const handleSave = async () => {
    if (!formTitle.trim()) {
      alert("请填写项目标题")
      return
    }

    setSaving(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()

    const projectData = {
      title: formTitle,
      category: formCategory,
      difficulty: formDifficulty,
      hook: formHook,
      income_estimate: formIncome,
      content: formContent,
      is_premium: formPremium,
      is_featured: formFeatured,
      is_practitioner_recommended: formPractitioner,
      recommend_reason: formRecommendReason,
      status: editingId
        ? (projects.find(p => p.id === editingId)?.status || "draft")
        : "draft",
      author_id: user?.id || null,
      updated_at: new Date().toISOString(),
    }

    let error
    if (editingId) {
      const { error: e } = await supabase
        .from("projects")
        .update(projectData)
        .eq("id", editingId)
      error = e
    } else {
      const { error: e } = await supabase
        .from("projects")
        .insert({ ...projectData })
      error = e
    }

    setSaving(false)

    if (error) {
      alert("保存失败：" + error.message)
    } else {
      closeEditor()
      fetchProjects()
      router.refresh()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这个项目吗？")) return
    const supabase = createClient()
    await supabase.from("projects").delete().eq("id", id)
    fetchProjects()
  }

  const handlePublish = async (id: string, currentStatus: string) => {
    const supabase = createClient()
    await supabase
      .from("projects")
      .update({ status: currentStatus === "published" ? "draft" : "published" })
      .eq("id", id)
    fetchProjects()
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">项目管理</h1>
          <p className="text-muted-foreground mt-1">管理创业项目的内容发布</p>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="h-4 w-4" /> 新建项目
        </Button>
      </div>

      {/* 筛选栏 */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索项目..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-1 flex-wrap">
          {categories.map((cat) => (
            <Badge
              key={cat}
              variant={filter === cat ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setFilter(cat)}
            >
              {cat}
            </Badge>
          ))}
        </div>
        <div className="flex gap-1">
          {statuses.map((s) => (
            <Badge
              key={s}
              variant={statusFilter === s ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setStatusFilter(s)}
            >
              {s === "全部" ? "全部状态" : s === "published" ? "已发布" : "草稿"}
            </Badge>
          ))}
        </div>
      </div>

      {/* 项目列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            共 {projects.length} 个项目
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无项目，点击上方按钮创建第一个</p>
            </div>
          ) : (
            <div className="divide-y">
              {projects.map((proj) => (
                <div key={proj.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    <div className={`w-2 h-2 rounded-full shrink-0 ${proj.status === "published" ? "bg-green-500" : "bg-amber-400"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{proj.title}</p>
                        {proj.is_premium && (
                          <Badge variant="default" className="text-xs">付费</Badge>
                        )}
                        {proj.is_featured && (
                          <Badge variant="default" className="text-xs bg-amber-500 text-white">⭐官方推荐</Badge>
                        )}
                        {proj.is_practitioner_recommended && (
                          <Badge variant="outline" className="text-xs text-green-600 border-green-300 bg-green-50">👥实践者推荐</Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2 mt-0.5">
                        <Badge variant="secondary" className="text-xs">{proj.category}</Badge>
                        <span className="text-xs text-muted-foreground">
                          {proj.difficulty} · {new Date(proj.created_at).toLocaleDateString("zh-CN")} · {proj.hook?.slice(0, 30) || ""}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0 ml-4">
                    <Badge variant={proj.status === "published" ? "success" : "warning"}>
                      {proj.status === "published" ? "已发布" : "草稿"}
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handlePublish(proj.id, proj.status)}
                      title={proj.status === "published" ? "撤销发布" : "发布"}
                    >
                      {proj.status === "published" ? "撤销" : "发布"}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditor(proj)} title="编辑">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      title="删除"
                      onClick={() => handleDelete(proj.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 编辑器弹窗 */}
      {showEditor && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4">
            {/* 顶部栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-lg font-bold">
                {editingId ? "编辑项目" : "新建项目"}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                  className="gap-1"
                >
                  {previewMode ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {previewMode ? "编辑" : "预览"}
                </Button>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-3 w-3 animate-spin" />
                  ) : (
                    <Save className="h-3 w-3" />
                  )}
                  保存
                </Button>
                <Button variant="ghost" size="sm" onClick={closeEditor}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            {/* 编辑区 */}
            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {!previewMode && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">项目标题 *</label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="例如：闲鱼AI代写服务"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">分类</label>
                    <select
                      value={formCategory}
                      onChange={(e) => setFormCategory(e.target.value)}
                      className="w-full h-9 rounded-md border px-3 text-sm bg-background"
                    >
                      {["闲鱼", "小红书", "AI工具", "短视频", "电商", "更多"].map((c) => (
                        <option key={c} value={c}>{c}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">难度</label>
                    <select
                      value={formDifficulty}
                      onChange={(e) => setFormDifficulty(e.target.value)}
                      className="w-full h-9 rounded-md border px-3 text-sm bg-background"
                    >
                      <option value="初级">初级</option>
                      <option value="中级">中级</option>
                      <option value="高级">高级</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">预期收入</label>
                    <Input
                      value={formIncome}
                      onChange={(e) => setFormIncome(e.target.value)}
                      placeholder="月入500-3000"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">一句话钩子</label>
                    <Input
                      value={formHook}
                      onChange={(e) => setFormHook(e.target.value)}
                      placeholder="用一句话吸引用户点击"
                    />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="premium"
                      checked={formPremium}
                      onChange={(e) => setFormPremium(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="premium" className="text-sm">付费内容</label>
                  </div>
                  <div className="col-span-2 grid grid-cols-2 gap-4 mt-2 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="featured"
                        checked={formFeatured}
                        onChange={(e) => setFormFeatured(e.target.checked)}
                        className="rounded text-amber-500"
                      />
                      <label htmlFor="featured" className="text-sm font-medium">⭐ 官方推荐</label>
                    </div>
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        id="practitioner"
                        checked={formPractitioner}
                        onChange={(e) => setFormPractitioner(e.target.checked)}
                        className="rounded text-green-500"
                      />
                      <label htmlFor="practitioner" className="text-sm font-medium">👥 实践者推荐</label>
                    </div>
                    <div className="col-span-2">
                      <label className="text-xs text-muted-foreground mb-1 block">推荐理由（选填）</label>
                      <Input
                        value={formRecommendReason}
                        onChange={(e) => setFormRecommendReason(e.target.value)}
                        placeholder="为什么推荐这个项目？"
                        className="text-sm"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Markdown 编辑/预览 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {previewMode ? "内容预览" : "项目内容（Markdown）"}
                </label>
                {previewMode ? (
                  <div className="prose max-w-none border rounded-xl p-6 bg-muted/10 min-h-[400px]">
                    <ReactMarkdown remarkPlugins={[remarkGfm]}>
                      {formContent || "*暂无内容*"}
                    </ReactMarkdown>
                  </div>
                ) : (
                  <Textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="font-mono text-sm min-h-[400px]"
                    placeholder="使用 Markdown 编写项目内容..."
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
