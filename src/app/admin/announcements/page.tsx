"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Plus, Search, Edit3, Trash2, Loader2, X, Save, Pin, PinOff, MessageSquare, Eye, EyeOff } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

interface Announcement {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

interface AnnouncementComment {
  id: string
  announcement_id: string
  user_id: string
  content: string
  created_at: string
  user_nickname?: string
}

export default function AdminAnnouncementsPage() {
  const router = useRouter()
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [comments, setComments] = useState<AnnouncementComment[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [showEditor, setShowEditor] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [selectedAnnouncement, setSelectedAnnouncement] = useState<Announcement | null>(null)
  const [previewMode, setPreviewMode] = useState(false)

  const [formTitle, setFormTitle] = useState("")
  const [formContent, setFormContent] = useState("")
  const [formPinned, setFormPinned] = useState(false)
  const [formActive, setFormActive] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [search])

  const fetchAnnouncements = async () => {
    const supabase = createClient()
    let query = supabase
      .from("announcements")
      .select("*")
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })

    if (search) {
      query = query.ilike("title", `%${search}%`)
    }

    const { data } = await query
    if (data) setAnnouncements(data)
    setLoading(false)
  }

  const fetchComments = async (announcementId: string) => {
    const supabase = createClient()
    const { data } = await supabase
      .from("announcement_comments")
      .select("*, profiles(nickname)")
      .eq("announcement_id", announcementId)
      .order("created_at", { ascending: false })

    if (data) {
      setComments(data.map((c: any) => ({
        ...c,
        user_nickname: c.profiles?.nickname || "匿名用户"
      })))
    }
  }

  const openEditor = (ann?: Announcement) => {
    if (ann) {
      setEditingId(ann.id)
      setFormTitle(ann.title)
      setFormContent(ann.content)
      setFormPinned(ann.is_pinned)
      setFormActive(ann.is_active)
    } else {
      setEditingId(null)
      setFormTitle("")
      setFormContent("")
      setFormPinned(false)
      setFormActive(true)
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
      alert("请填写公告标题")
      return
    }

    setSaving(true)
    const supabase = createClient()

    const data = {
      title: formTitle,
      content: formContent,
      is_pinned: formPinned,
      is_active: formActive,
      updated_at: new Date().toISOString(),
    }

    let error
    if (editingId) {
      const { error: e } = await supabase
        .from("announcements")
        .update(data)
        .eq("id", editingId)
      error = e
    } else {
      const { error: e } = await supabase
        .from("announcements")
        .insert({ ...data })
      error = e
    }

    setSaving(false)

    if (error) {
      alert("保存失败：" + error.message)
    } else {
      closeEditor()
      fetchAnnouncements()
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("确定要删除这条公告吗？相关评论也会被删除。")) return
    const supabase = createClient()
    await supabase.from("announcements").delete().eq("id", id)
    fetchAnnouncements()
  }

  const handleTogglePinned = async (ann: Announcement) => {
    const supabase = createClient()
    await supabase
      .from("announcements")
      .update({ is_pinned: !ann.is_pinned, updated_at: new Date().toISOString() })
      .eq("id", ann.id)
    fetchAnnouncements()
  }

  const handleToggleActive = async (ann: Announcement) => {
    const supabase = createClient()
    await supabase
      .from("announcements")
      .update({ is_active: !ann.is_active, updated_at: new Date().toISOString() })
      .eq("id", ann.id)
    fetchAnnouncements()
  }

  const handleDeleteComment = async (id: string) => {
    if (!confirm("确定要删除这条评论吗？")) return
    const supabase = createClient()
    await supabase.from("announcement_comments").delete().eq("id", id)
    if (selectedAnnouncement) fetchComments(selectedAnnouncement.id)
  }

  const handleViewComments = (ann: Announcement) => {
    setSelectedAnnouncement(ann)
    fetchComments(ann.id)
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">公告管理</h1>
          <p className="text-muted-foreground mt-1">发布站内公告，用户可在公告下提问回复</p>
        </div>
        <Button onClick={() => openEditor()} className="gap-2">
          <Plus className="h-4 w-4" /> 发布公告
        </Button>
      </div>

      {/* 搜索 */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="搜索公告..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* 公告列表 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">共 {announcements.length} 条公告</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : announcements.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-muted-foreground">暂无公告，点击上方按钮发布第一条</p>
            </div>
          ) : (
            <div className="divide-y">
              {announcements.map((ann) => (
                <div key={ann.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30">
                  <div className="flex items-center gap-4 flex-1 min-w-0">
                    {ann.is_pinned && <Pin className="h-4 w-4 text-red-500 shrink-0" />}
                    <div className={`w-2 h-2 rounded-full shrink-0 ${ann.is_active ? "bg-green-500" : "bg-gray-300"}`} />
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium truncate">{ann.title}</p>
                        {ann.is_pinned && <Badge variant="destructive" className="text-xs">置顶</Badge>}
                        {!ann.is_active && <Badge variant="secondary" className="text-xs">已隐藏</Badge>}
                      </div>
                      <div className="text-xs text-muted-foreground mt-0.5">
                        {new Date(ann.created_at).toLocaleDateString("zh-CN")}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 ml-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewComments(ann)}
                      title="查看评论"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleTogglePinned(ann)}
                      title={ann.is_pinned ? "取消置顶" : "置顶"}
                    >
                      {ann.is_pinned ? <PinOff className="h-4 w-4" /> : <Pin className="h-4 w-4" />}
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleToggleActive(ann)}
                      title={ann.is_active ? "隐藏" : "显示"}
                    >
                      {ann.is_active ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => openEditor(ann)} title="编辑">
                      <Edit3 className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:text-destructive"
                      onClick={() => handleDelete(ann.id)}
                      title="删除"
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

      {/* 评论管理弹窗 */}
      {selectedAnnouncement && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <div>
                <h2 className="text-lg font-bold">评论管理</h2>
                <p className="text-xs text-muted-foreground">{selectedAnnouncement.title}</p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setSelectedAnnouncement(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-6 max-h-[60vh] overflow-y-auto">
              {comments.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">暂无评论</p>
              ) : (
                <div className="space-y-3">
                  {comments.map((comment) => (
                    <div key={comment.id} className="flex items-start justify-between gap-3 p-3 bg-muted/30 rounded-lg">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-sm font-medium">{comment.user_nickname}</span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(comment.created_at).toLocaleDateString("zh-CN")}
                          </span>
                        </div>
                        <p className="text-sm">{comment.content}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive shrink-0"
                        onClick={() => handleDeleteComment(comment.id)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 编辑器弹窗 */}
      {showEditor && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center bg-black/50 py-8 overflow-y-auto">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl mx-4">
            <div className="flex items-center justify-between px-6 py-4 border-b sticky top-0 bg-white rounded-t-xl z-10">
              <h2 className="text-lg font-bold">
                {editingId ? "编辑公告" : "发布公告"}
              </h2>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPreviewMode(!previewMode)}
                >
                  {previewMode ? "编辑" : "预览"}
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={saving}
                >
                  {saving ? <Loader2 className="h-3 w-3 animate-spin" /> : <Save className="h-3 w-3" />}
                  保存
                </Button>
                <Button variant="ghost" size="sm" onClick={closeEditor}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="p-6 max-h-[calc(100vh-200px)] overflow-y-auto">
              {!previewMode && (
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="text-sm font-medium mb-1 block">公告标题 *</label>
                    <Input
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="例如：新增 AI 创业雷达功能"
                    />
                  </div>
                  <div className="flex items-center gap-6">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formPinned}
                        onChange={(e) => setFormPinned(e.target.checked)}
                        className="rounded"
                      />
                      置顶显示
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="checkbox"
                        checked={formActive}
                        onChange={(e) => setFormActive(e.target.checked)}
                        className="rounded"
                      />
                      公开显示
                    </label>
                  </div>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">
                  {previewMode ? "内容预览" : "公告内容"}
                </label>
                {previewMode ? (
                  <div className="prose max-w-none border rounded-xl p-6 bg-muted/10 min-h-[200px]">
                    <p className="whitespace-pre-wrap">{formContent || "*暂无内容*"}</p>
                  </div>
                ) : (
                  <Textarea
                    value={formContent}
                    onChange={(e) => setFormContent(e.target.value)}
                    className="min-h-[300px]"
                    placeholder="填写公告内容，支持多行文字..."
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
