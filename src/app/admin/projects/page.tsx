"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit3, Trash2, Eye, FileText, Sparkles } from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"

const DEMO_PROJECTS = [
  { id: "1", title: "闲鱼AI代写服务", category: "闲鱼", status: "published", difficulty: "初级", views: 2300, created: "2026-04-15" },
  { id: "2", title: "小红书AI壁纸号", category: "小红书", status: "published", difficulty: "初级", views: 1800, created: "2026-04-10" },
  { id: "3", title: "情侣情绪价值小程序", category: "AI工具", status: "published", difficulty: "中级", views: 3100, created: "2026-04-08" },
  { id: "4", title: "AI数字人直播带货", category: "AI工具", status: "draft", difficulty: "中级", views: 0, created: "2026-05-01" },
  { id: "5", title: "AI音乐制作教程", category: "更多", status: "draft", difficulty: "中级", views: 0, created: "2026-05-02" },
  { id: "6", title: "短视频解压动画号", category: "短视频", status: "published", difficulty: "初级", views: 1200, created: "2026-04-05" },
  { id: "7", title: "AI表情包IP打造", category: "AI工具", status: "published", difficulty: "初级", views: 950, created: "2026-04-03" },
  { id: "8", title: "拼多多虚拟资料店", category: "电商", status: "published", difficulty: "初级", views: 2100, created: "2026-04-01" },
]

const categories = ["全部", "闲鱼", "小红书", "AI工具", "短视频", "电商", "更多"]
const statuses = ["全部", "published", "draft"]

// 编辑器模板内容
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
  const [filter, setFilter] = useState("全部")
  const [statusFilter, setStatusFilter] = useState("全部")
  const [search, setSearch] = useState("")
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formTitle, setFormTitle] = useState("")
  const [formCategory, setFormCategory] = useState("AI工具")
  const [formDifficulty, setFormDifficulty] = useState("初级")
  const [formHook, setFormHook] = useState("")
  const [formIncome, setFormIncome] = useState("")
  const [formContent, setFormContent] = useState(EDITOR_TEMPLATE)
  const [formPremium, setFormPremium] = useState(false)
  const [previewMode, setPreviewMode] = useState(false)

  const filtered = DEMO_PROJECTS.filter((p) => {
    if (filter !== "全部" && p.category !== filter) return false
    if (statusFilter !== "全部" && p.status !== statusFilter) return false
    if (search && !p.title.includes(search)) return false
    return true
  })

  const openEditor = (id?: string) => {
    if (id) {
      const proj = DEMO_PROJECTS.find((p) => p.id === id)
      if (proj) {
        setEditingId(id)
        setFormTitle(proj.title)
        setFormCategory(proj.category)
        setFormDifficulty(proj.difficulty)
        setFormHook("")
        setFormIncome("")
        setFormContent(EDITOR_TEMPLATE)
      }
    } else {
      setEditingId(null)
      setFormTitle("")
      setFormCategory("AI工具")
      setFormDifficulty("初级")
      setFormHook("")
      setFormIncome("")
      setFormContent(EDITOR_TEMPLATE)
    }
    setShowEditor(true)
    setPreviewMode(false)
  }

  const closeEditor = () => {
    setShowEditor(false)
    setEditingId(null)
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
        <div className="flex gap-1">
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
            共 {filtered.length} 个项目
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y">
            {filtered.map((proj) => (
              <div key={proj.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30">
                <div className="flex items-center gap-4 flex-1 min-w-0">
                  <div className={`w-2 h-2 rounded-full shrink-0 ${proj.status === "published" ? "bg-green-500" : "bg-amber-400"}`} />
                  <div className="min-w-0">
                    <p className="text-sm font-medium truncate">{proj.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <Badge variant="secondary" className="text-xs">{proj.category}</Badge>
                      <span className="text-xs text-muted-foreground">{proj.difficulty} · {proj.created} · {proj.views} 浏览</span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0 ml-4">
                  <Badge variant={proj.status === "published" ? "success" : "warning"}>
                    {proj.status === "published" ? "已发布" : "草稿"}
                  </Badge>
                  <Button variant="ghost" size="icon" onClick={() => openEditor(proj.id)} title="编辑">
                    <Edit3 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" title="删除">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 编辑器弹窗 */}
      {showEditor && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/30 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl mx-4 my-auto">
            {/* 顶部栏 */}
            <div className="flex items-center justify-between px-6 py-4 border-b">
              <h2 className="text-lg font-bold">
                {editingId ? "编辑项目" : "新建项目"}
              </h2>
              <div className="flex items-center gap-2">
                <Button variant="outline" size="sm" onClick={() => setPreviewMode(!previewMode)} className="gap-1">
                  {previewMode ? <Edit3 className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
                  {previewMode ? "编辑" : "预览"}
                </Button>
                <Button size="sm" className="gap-1">
                  <Sparkles className="h-3 w-3" />
                  {editingId ? "更新" : "发布"}
                </Button>
                <Button variant="ghost" size="sm" onClick={closeEditor}>取消</Button>
              </div>
            </div>

            {/* 编辑区 */}
            <div className="p-6 max-h-[70vh] overflow-y-auto">
              {/* 基本信息 */}
              {!previewMode && (
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="col-span-2">
                    <label className="text-sm font-medium mb-1 block">项目标题</label>
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
                      className="w-full h-9 rounded-md border px-3 text-sm"
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
                      className="w-full h-9 rounded-md border px-3 text-sm"
                    >
                      <option value="初级">初级</option>
                      <option value="中级">中级</option>
                      <option value="高级">高级</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">预期收入</label>
                    <Input value={formIncome} onChange={(e) => setFormIncome(e.target.value)} placeholder="月入500-3000" />
                  </div>
                  <div>
                    <label className="text-sm font-medium mb-1 block">一句话钩子</label>
                    <Input value={formHook} onChange={(e) => setFormHook(e.target.value)} placeholder="用一句话吸引用户点击" />
                  </div>
                  <div className="col-span-2 flex items-center gap-2">
                    <input
                      type="checkbox"
                      id="premium"
                      checked={formPremium}
                      onChange={(e) => setFormPremium(e.target.checked)}
                      className="rounded"
                    />
                    <label htmlFor="premium" className="text-sm">标记为付费内容</label>
                  </div>
                </div>
              )}

              {/* Markdown 编辑/预览 */}
              <div>
                <label className="text-sm font-medium mb-2 block">
                  {previewMode ? "内容预览" : "项目内容（Markdown）"}
                </label>
                {previewMode ? (
                  <div className="prose max-w-none border rounded-xl p-6 bg-muted/10">
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
