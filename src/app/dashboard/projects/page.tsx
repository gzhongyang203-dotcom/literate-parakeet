"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { createClient } from "@/lib/supabase/client"
import {
  Plus, Edit3, Trash2, Eye, FileText, Clock, CheckCircle, XCircle, Loader2,
  Send, Save, ArrowLeft, AlertTriangle
} from "lucide-react"
import Link from "next/link"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

// ===== 类型定义 =====
interface Project {
  id: string
  title: string
  category: string
  difficulty: string
  status: string
  hook: string
  income_estimate: string
  is_premium: boolean
  is_featured: boolean
  is_practitioner_recommended: boolean
  recommend_reason?: string
  content?: string
  created_at: string
  updated_at: string
}

const CATEGORIES = ["闲鱼", "小红书", "AI工具", "短视频", "电商", "更多"]
const DIFFICULTIES = ["初级", "中级", "高级"]

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

## 操作步骤

### 第一步：准备工作
具体做什么...

### 第二步：开始执行
具体做什么...

### 第三步：优化放大
具体做什么...

## 常见坑点
1. **坑点** — 怎么避开
2. **坑点** — 怎么避开

## 进阶玩法
- 跑通后怎么放大收入
`

// ===== Toast 组件 =====
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slideInRight
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
    >
      <div className="flex items-center gap-2">
        {type === "success" ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
        {message}
      </div>
    </div>
  )
}

// ===== 状态徽章 =====
function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { label: string; variant: "success" | "warning" | "secondary" | "default"; icon: React.ReactNode }> = {
    draft: { label: "草稿", variant: "secondary", icon: <Edit3 className="h-3 w-3" /> },
    pending: { label: "审核中", variant: "warning", icon: <Clock className="h-3 w-3" /> },
    published: { label: "已发布", variant: "success", icon: <CheckCircle className="h-3 w-3" /> },
    rejected: { label: "已驳回", variant: "default", icon: <XCircle className="h-3 w-3" /> },
  }
  const c = config[status] || config.draft
  return (
    <Badge variant={c.variant} className="gap-1 text-[10px]">
      {c.icon} {c.label}
    </Badge>
  )
}

export default function MyProjectsPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<Project[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)

  // 表单字段
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState("AI工具")
  const [formDifficulty, setFormDifficulty] = useState("初级")
  const [formHook, setFormHook] = useState("")
  const [formIncome, setFormIncome] = useState("")
  const [formContent, setFormContent] = useState(EDITOR_TEMPLATE)
  const [formPremium, setFormPremium] = useState(false)
  const [formRecommendReason, setFormRecommendReason] = useState("")

  useEffect(() => { init() }, [])

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
  }

  const init = async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      router.push("/login?redirect=/dashboard/projects")
      return
    }
    setUser(user)
    await loadProjects()
  }

  const loadProjects = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/projects")
      if (res.ok) {
        const data = await res.json()
        setProjects(data.projects || [])
      }
    } catch {
      showToast("加载失败", "error")
    } finally {
      setLoading(false)
    }
  }

  // 统计
  const stats = {
    total: projects.length,
    draft: projects.filter(p => p.status === "draft").length,
    pending: projects.filter(p => p.status === "pending").length,
    published: projects.filter(p => p.status === "published").length,
  }

  // 打开编辑器
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
      setFormRecommendReason(proj.recommend_reason || "")
    } else {
      setEditingId(null)
      setFormTitle(""); setFormCategory("AI工具"); setFormDifficulty("初级")
      setFormHook(""); setFormIncome(""); setFormContent(EDITOR_TEMPLATE)
      setFormPremium(false); setFormRecommendReason("")
    }
    setShowEditor(true)
    setPreviewMode(false)
  }

  const closeEditor = () => {
    setShowEditor(false)
    setEditingId(null)
    setPreviewMode(false)
  }

  const handleSave = async () => {
    if (!formTitle.trim()) { showToast("请填写项目标题", "error"); return }
    if (!formHook.trim()) { showToast("请填写一句话钩子", "error"); return }

    setSaving(true)
    try {
      const url = "/api/projects"
      const method = editingId ? "PUT" : "POST"
      const body: any = {
        title: formTitle, category: formCategory, difficulty: formDifficulty,
        hook: formHook, income_estimate: formIncome, content: formContent,
        is_premium: formPremium, recommend_reason: formRecommendReason,
      }
      if (editingId) body.id = editingId

      // 如果是编辑已有的 pending/rejected 项目，重置为 draft
      if (editingId) {
        const existing = projects.find(p => p.id === editingId)
        if (existing && (existing.status === "pending" || existing.status === "rejected")) {
          body.status = "draft"
        }
      }

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        showToast(editingId ? "项目已更新" : "项目已创建", "success")
        closeEditor()
        loadProjects()
      } else {
        const d = await res.json()
        showToast(d.error || "保存失败", "error")
      }
    } catch {
      showToast("网络错误", "error")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定删除这个项目？此操作不可撤销！")) return
    setDeletingId(id)
    try {
      const res = await fetch(`/api/projects?id=${id}`, { method: "DELETE" })
      if (res.ok) {
        showToast("项目已删除", "success")
        loadProjects()
      } else {
        const d = await res.json()
        showToast(d.error || "删除失败", "error")
      }
    } catch {
      showToast("网络错误", "error")
    } finally {
      setDeletingId(null)
    }
  }

  const handleSubmitReview = async (id: string) => {
    if (!confirm("提交审核后无法修改，确认提交？")) return
    try {
      const res = await fetch("/api/projects", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status: "pending" }),
      })
      if (res.ok) {
        showToast("已提交审核", "success")
        loadProjects()
      } else {
        const d = await res.json()
        showToast(d.error || "提交失败", "error")
      }
    } catch {
      showToast("网络错误", "error")
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      {/* 页头 */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard" className="text-muted-foreground hover:text-primary transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <h1 className="text-3xl font-bold">📝 我的项目</h1>
          </div>
          <p className="text-muted-foreground">创建和管理你发布的创业项目</p>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="h-4 w-4" /> 新建项目
        </Button>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {([
          { label: "全部项目", value: stats.total, icon: FileText, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "草稿", value: stats.draft, icon: Edit3, bg: "bg-gray-50", text: "text-gray-600" },
          { label: "审核中", value: stats.pending, icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
          { label: "已发布", value: stats.published, icon: CheckCircle, bg: "bg-green-50", text: "text-green-600" },
        ] as const).map((card, i) => (
          <Card key={i} className="hover:shadow-sm transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <div className={`w-8 h-8 rounded-full ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-4 w-4 ${card.text}`} />
                </div>
              </div>
              <p className="text-xl font-bold">{card.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 项目列表 */}
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">全部 ({stats.total})</TabsTrigger>
          <TabsTrigger value="draft">草稿 ({stats.draft})</TabsTrigger>
          <TabsTrigger value="pending">审核中 ({stats.pending})</TabsTrigger>
          <TabsTrigger value="published">已发布 ({stats.published})</TabsTrigger>
        </TabsList>

        {(["all", "draft", "pending", "published"] as const).map((tab) => {
          const filtered = tab === "all" ? projects : projects.filter(p => p.status === tab)
          return (
            <TabsContent key={tab} value={tab}>
              <Card>
                <CardHeader>
                  <CardTitle className="text-base">{tab === "all" ? "所有项目" : tab === "draft" ? "草稿" : tab === "pending" ? "审核中" : "已发布"} ({filtered.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {filtered.length === 0 ? (
                    <div className="text-center py-12">
                      <FileText className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
                      <p className="text-muted-foreground font-medium">暂无项目</p>
                      <p className="text-sm text-muted-foreground/60 mb-4">点击"新建项目"开始发布</p>
                      <Button variant="outline" size="sm" onClick={() => openEditor()} className="gap-1">
                        <Plus className="h-3 w-3" /> 新建项目
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      {filtered.map((proj) => (
                        <div
                          key={proj.id}
                          className="flex flex-col sm:flex-row sm:items-center justify-between p-4 border rounded-xl hover:bg-muted/30 transition-colors gap-3"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 flex-wrap mb-1">
                              <h3 className="font-medium text-sm truncate">{proj.title}</h3>
                              <StatusBadge status={proj.status} />
                              {proj.is_premium && <Badge variant="default" className="text-[10px]">付费</Badge>}
                              {proj.is_featured && <Badge className="text-[10px] bg-amber-500 text-white">⭐推荐</Badge>}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Badge variant="secondary" className="text-[10px]">{proj.category}</Badge>
                              <span>{proj.difficulty}</span>
                              <span>·</span>
                              <span className="truncate">{proj.hook?.slice(0, 40)}</span>
                            </div>
                            <p className="text-xs text-muted-foreground/60 mt-1">
                              {new Date(proj.updated_at).toLocaleDateString("zh-CN")} 更新
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            {proj.status === "draft" && (
                              <Button variant="outline" size="sm" className="gap-1 h-8" onClick={() => handleSubmitReview(proj.id)}>
                                <Send className="h-3 w-3" /> 提交审核
                              </Button>
                            )}
                            {proj.status === "rejected" && (
                              <Button variant="outline" size="sm" className="gap-1 h-8 text-amber-600" onClick={() => openEditor(proj)}>
                                <Edit3 className="h-3 w-3" /> 修改重提
                              </Button>
                            )}
                            {proj.status !== "pending" && (
                              <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => openEditor(proj)} title="编辑">
                                <Edit3 className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-8 w-8 text-red-400 hover:text-red-600"
                              onClick={() => handleDelete(proj.id)}
                              title="删除"
                              disabled={deletingId === proj.id}
                            >
                              {deletingId === proj.id ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          )
        })}
      </Tabs>

      {/* 编辑器弹窗 */}
      <Dialog open={showEditor} onOpenChange={(open) => { if (!open) closeEditor() }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
          <DialogHeader className="shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle>{editingId ? "编辑项目" : "新建项目"}</DialogTitle>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="gap-1">
                  {previewMode ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {previewMode ? "编辑" : "预览"}
                </Button>
                <Button size="sm" className="gap-1" onClick={handleSave} disabled={saving}>
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  保存
                </Button>
              </div>
            </div>
          </DialogHeader>

          <div className="overflow-y-auto flex-1 px-1">
            {!previewMode && (
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">项目标题 *</label>
                  <Input value={formTitle} onChange={(e) => setFormTitle(e.target.value)} placeholder="例如：闲鱼AI代写服务" maxLength={100} />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">分类</label>
                  <select value={formCategory} onChange={(e) => setFormCategory(e.target.value)} className="w-full h-9 rounded-md border px-3 text-sm bg-background">
                    {CATEGORIES.map(c => (<option key={c} value={c}>{c}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">难度</label>
                  <select value={formDifficulty} onChange={(e) => setFormDifficulty(e.target.value)} className="w-full h-9 rounded-md border px-3 text-sm bg-background">
                    {DIFFICULTIES.map(d => (<option key={d} value={d}>{d}</option>))}
                  </select>
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">预期收入</label>
                  <Input value={formIncome} onChange={(e) => setFormIncome(e.target.value)} placeholder="月入500-3000" />
                </div>
                <div>
                  <label className="text-sm font-medium mb-1 block">一句话钩子 *</label>
                  <Input value={formHook} onChange={(e) => setFormHook(e.target.value)} placeholder="用一句话吸引用户点击" maxLength={200} />
                </div>
                <div className="col-span-2 flex items-center gap-2">
                  <input type="checkbox" id="premium" checked={formPremium} onChange={(e) => setFormPremium(e.target.checked)} className="rounded" />
                  <label htmlFor="premium" className="text-sm">设为付费内容（需订阅才能查看详情）</label>
                </div>
                <div className="col-span-2">
                  <label className="text-sm font-medium mb-1 block">推荐理由（选填）</label>
                  <Input value={formRecommendReason} onChange={(e) => setFormRecommendReason(e.target.value)} placeholder="为什么推荐这个项目？" />
                </div>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">{previewMode ? "内容预览" : "项目内容（Markdown）"}</label>
              {previewMode ? (
                <div className="prose max-w-none border rounded-xl p-6 bg-muted/10 min-h-[300px]">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>{formContent || "*暂无内容*"}</ReactMarkdown>
                </div>
              ) : (
                <Textarea
                  value={formContent}
                  onChange={(e) => setFormContent(e.target.value)}
                  className="font-mono text-sm min-h-[300px]"
                  placeholder="使用 Markdown 编写项目内容..."
                />
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </div>
  )
}
