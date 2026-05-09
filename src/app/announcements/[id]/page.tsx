"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Pin, ArrowLeft, Send, Loader2, MessageSquare, User } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface Comment {
  id: string
  announcement_id: string
  user_id: string
  content: string
  created_at: string
  user_nickname?: string
  user_avatar?: string
}

export default function AnnouncementDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string

  const [announcement, setAnnouncement] = useState<any>(null)
  const [comments, setComments] = useState<Comment[]>([])
  const [loading, setLoading] = useState(true)
  const [user, setUser] = useState<any>(null)
  const [newComment, setNewComment] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      await fetchData()
    }
    init()
  }, [id])

  const fetchData = async () => {
    const supabase = createClient()

    // 获取公告
    const { data: ann } = await supabase
      .from("announcements")
      .select("*")
      .eq("id", id)
      .single()
    setAnnouncement(ann)

    // 获取评论
    const { data: cmts } = await supabase
      .from("announcement_comments")
      .select("*, profiles(nickname, avatar)")
      .eq("announcement_id", id)
      .order("created_at", { ascending: true })

    if (cmts) {
      setComments(cmts.map((c: any) => ({
        ...c,
        user_nickname: c.profiles?.nickname || "匿名用户",
        user_avatar: c.profiles?.avatar || null,
      })))
    }

    setLoading(false)
  }

  const handleSubmitComment = async () => {
    if (!user) {
      router.push("/login?redirect=" + encodeURIComponent(`/announcements/${id}`))
      return
    }
    if (!newComment.trim()) return

    setSubmitting(true)
    const supabase = createClient()
    await supabase.from("announcement_comments").insert({
      announcement_id: id,
      user_id: user.id,
      content: newComment.trim(),
    })
    setNewComment("")
    setSubmitting(false)
    fetchData()
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (!announcement) {
    return (
      <div className="container mx-auto px-4 py-16 text-center max-w-md">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-xl font-bold mb-2">公告不存在</h2>
        <p className="text-muted-foreground mb-6">可能已被删除或隐藏</p>
        <Button asChild>
          <Link href="/announcements">返回公告列表</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* 返回 */}
      <Button variant="ghost" className="mb-6 pl-0" asChild>
        <Link href="/announcements" className="gap-2">
          <ArrowLeft className="h-4 w-4" />
          返回公告列表
        </Link>
      </Button>

      {/* 公告内容 */}
      <Card className="mb-8">
        <CardContent className="p-8">
          <div className="flex items-center gap-2 mb-4">
            {announcement.is_pinned && (
              <Pin className="h-4 w-4 text-red-500" />
            )}
            {announcement.is_pinned && (
              <Badge variant="destructive" className="text-xs">置顶</Badge>
            )}
          </div>
          <h1 className="text-2xl font-bold mb-4">{announcement.title}</h1>
          <p className="text-sm text-muted-foreground mb-6">
            {new Date(announcement.created_at).toLocaleDateString("zh-CN", {
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <div className="prose max-w-none">
            <p className="whitespace-pre-wrap text-base leading-relaxed">
              {announcement.content}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* 评论区 */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 mb-6">
            <MessageSquare className="h-5 w-5" />
            <h2 className="text-lg font-bold">评论 ({comments.length})</h2>
          </div>

          {/* 已有评论 */}
          {comments.length > 0 ? (
            <div className="space-y-4 mb-6">
              {comments.map((comment) => (
                <div key={comment.id} className="flex gap-3">
                  <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center shrink-0">
                    {comment.user_avatar ? (
                      <img src={comment.user_avatar} alt="" className="w-full h-full rounded-full object-cover" />
                    ) : (
                      <User className="h-4 w-4 text-purple-600" />
                    )}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{comment.user_nickname}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(comment.created_at).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <p className="text-sm bg-muted/50 rounded-lg p-3">
                      {comment.content}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-4 mb-6">
              暂无评论，快来抢沙发！
            </p>
          )}

          {/* 发表评论 */}
          <div className="border-t pt-4">
            {user ? (
              <div className="flex gap-3">
                <Input
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  placeholder="写下你的问题或想法..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault()
                      handleSubmitComment()
                    }
                  }}
                  className="flex-1"
                />
                <Button
                  onClick={handleSubmitComment}
                  disabled={submitting || !newComment.trim()}
                >
                  {submitting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </div>
            ) : (
              <div className="text-center py-4 bg-muted/30 rounded-lg">
                <p className="text-sm text-muted-foreground mb-2">登录后参与评论</p>
                <Button size="sm" asChild>
                  <Link href={`/login?redirect=${encodeURIComponent(`/announcements/${id}`)}`}>
                    登录 / 注册
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
