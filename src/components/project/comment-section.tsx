"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

interface CommentUser {
  id: string
  nickname: string
}

interface Comment {
  id: string
  content: string
  parent_id: string | null
  created_at: string
  user: CommentUser
  replies?: Comment[]
}

interface CommentSectionProps {
  projectId: string
  initialCount?: number
  authorName?: string
}

// 用户专属渐变色（基于昵称hash）
function getUserGradient(name: string): string {
  const gradients = [
    "from-blue-400 to-indigo-500",
    "from-purple-400 to-pink-500",
    "from-green-400 to-teal-500",
    "from-orange-400 to-red-500",
    "from-cyan-400 to-blue-500",
    "from-pink-400 to-rose-500",
    "from-amber-400 to-orange-500",
    "from-violet-400 to-purple-500",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  return gradients[Math.abs(hash) % gradients.length]
}

function UserAvatar({ name, size = "md" }: { name: string; size?: "sm" | "md" }) {
  const sizeClass = size === "sm" ? "w-6 h-6 text-[10px]" : "w-8 h-8 text-xs"
  return (
    <div
      className={`${sizeClass} rounded-full bg-gradient-to-br ${getUserGradient(name)} flex items-center justify-center text-white font-bold shrink-0 shadow-sm`}
    >
      {name.charAt(0)}
    </div>
  )
}

export function CommentSection({ projectId, initialCount = 0, authorName }: CommentSectionProps) {
  const [comments, setComments] = useState<Comment[]>([])
  const [content, setContent] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [userId, setUserId] = useState<string | null>(null)
  const [replyTo, setReplyTo] = useState<{ id: string; name: string } | null>(null)
  const [page, setPage] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const PAGE_SIZE = 10
  const replyInputRef = useRef<HTMLTextAreaElement>(null)

  const fetchComments = useCallback(async (pageNum: number = 0) => {
    try {
      const res = await fetch(
        `/api/projects/comments?project_id=${projectId}&page=${pageNum}&pageSize=${PAGE_SIZE}`
      )
      if (!res.ok) return
      const data = await res.json()
      const newComments = data.comments || []
      if (pageNum === 0) {
        setComments(newComments)
      } else {
        setComments((prev) => [...prev, ...newComments])
      }
      setHasMore(newComments.length === PAGE_SIZE)
    } catch {
      // 静默
    } finally {
      setLoading(false)
    }
  }, [projectId])

  useEffect(() => {
    async function init() {
      try {
        const { createClient } = await import("@/lib/supabase/client")
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        if (session?.user) setUserId(session.user.id)
      } catch { /* */ }
      fetchComments(0)
    }
    init()
  }, [fetchComments])

  const loadMore = () => {
    const nextPage = page + 1
    setPage(nextPage)
    fetchComments(nextPage)
  }

  const handleSubmit = async () => {
    const trimmed = content.trim()
    if (!trimmed) return
    if (trimmed.length > 500) {
      setError("评论不能超过500字")
      return
    }

    setSubmitting(true)
    setError("")

    try {
      const body: Record<string, string> = {
        project_id: projectId,
        content: trimmed,
      }
      if (replyTo) {
        body.parent_id = replyTo.id
      }

      const res = await fetch("/api/projects/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      })
      const data = await res.json()
      if (!res.ok) {
        if (res.status === 401) {
          window.location.href = "/login"
          return
        }
        setError(data.error || "发表失败")
        return
      }
      setComments((prev) => [data.comment, ...prev])
      setContent("")
      setReplyTo(null)
    } catch {
      setError("网络错误")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async (commentId: string) => {
    try {
      const res = await fetch(`/api/projects/comments?id=${commentId}`, { method: "DELETE" })
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId))
      }
    } catch { /* */ }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime()
    const minutes = Math.floor(diff / 60000)
    if (minutes < 1) return "刚刚"
    if (minutes < 60) return `${minutes}分钟前`
    const hours = Math.floor(minutes / 60)
    if (hours < 24) return `${hours}小时前`
    const days = Math.floor(hours / 24)
    if (days < 30) return `${days}天前`
    if (days < 365) return `${Math.floor(days / 30)}个月前`
    return new Date(dateStr).toLocaleDateString("zh-CN")
  }

  // 递归渲染评论树
  const renderComment = (comment: Comment, depth: number = 0) => {
    const isAuthor = authorName && comment.user.nickname === authorName
    const maxDepth = 2

    return (
      <div key={comment.id}>
        <div
          className={`flex gap-3 group ${depth > 0 ? "ml-10 mt-3 pt-3 border-l-2 border-primary/10 pl-4" : ""}`}
        >
          <UserAvatar name={comment.user.nickname} size={depth > 0 ? "sm" : "md"} />
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium">{comment.user.nickname}</span>
              {isAuthor && (
                <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.5 rounded font-medium">
                  作者
                </span>
              )}
              <span className="text-xs text-muted-foreground">
                {timeAgo(comment.created_at)}
              </span>
            </div>
            <p className="text-sm mt-1 text-foreground/85 break-words leading-relaxed">
              {comment.content}
            </p>

            {/* 操作栏 */}
            <div className="flex items-center gap-3 mt-1.5">
              {depth < maxDepth && (
                <button
                  onClick={() => {
                    setReplyTo({ id: comment.id, name: comment.user.nickname })
                    setContent(`@${comment.user.nickname} `)
                    setTimeout(() => replyInputRef.current?.focus(), 100)
                  }}
                  className="text-xs text-muted-foreground/50 hover:text-primary transition-colors"
                >
                  回复
                </button>
              )}
              {userId === comment.user.id && (
                <button
                  onClick={() => handleDelete(comment.id)}
                  className="text-xs text-muted-foreground/40 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-all"
                >
                  删除
                </button>
              )}
            </div>
          </div>
        </div>

        {/* 递归渲染回复 */}
        {comment.replies && comment.replies.length > 0 && (
          <div>
            {comment.replies.map((reply) => renderComment(reply, depth + 1))}
          </div>
        )}
      </div>
    )
  }

  return (
    <div className="space-y-5">
      {/* 标题 */}
      <div className="flex items-center gap-2">
        <svg className="h-5 w-5 text-primary" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
        <h3 className="font-bold text-lg">项目评论</h3>
        {!loading && (
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {comments.length} 条
          </span>
        )}
      </div>

      {/* 发表评论 */}
      <div className="space-y-3 p-4 bg-gradient-to-br from-gray-50 to-blue-50/30 rounded-xl border border-gray-100">
        {replyTo && (
          <div className="flex items-center gap-2 text-xs text-muted-foreground bg-white/80 rounded-lg px-3 py-1.5 border border-gray-100">
            <span>回复</span>
            <span className="font-medium text-primary">@{replyTo.name}</span>
            <button
              onClick={() => {
                setReplyTo(null)
                setContent("")
              }}
              className="ml-auto text-gray-400 hover:text-red-500 transition-colors"
            >
              ✕
            </button>
          </div>
        )}
        <Textarea
          ref={replyInputRef}
          placeholder={replyTo ? `回复 @${replyTo.name}...` : "分享你的看法...（Ctrl+Enter 发送）"}
          value={content}
          onChange={(e) => { setContent(e.target.value); setError("") }}
          onKeyDown={handleKeyDown}
          rows={3}
          className="resize-none border-gray-200 focus:border-primary/50 bg-white"
          maxLength={500}
        />
        {error && (
          <p className="text-sm text-red-500 flex items-center gap-1">
            <span>⚠</span> {error}
          </p>
        )}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className={`text-xs ${content.length > 450 ? "text-orange-500" : "text-muted-foreground"}`}>
              {content.length}/500
            </span>
            {content.length > 0 && content.length <= 500 && (
              <span className="text-xs text-green-500">✓ 可以发送</span>
            )}
          </div>
          <Button
            onClick={handleSubmit}
            disabled={submitting || !content.trim()}
            size="sm"
            className="bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70 shadow-sm"
          >
            {submitting ? (
              <span className="flex items-center gap-1">
                <span className="animate-spin h-3 w-3 border-2 border-white/30 border-t-white rounded-full" />
                发送中
              </span>
            ) : (
              "发表评论"
            )}
          </Button>
        </div>
      </div>

      {/* 评论列表 */}
      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse flex gap-3 p-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-200 to-gray-300" />
              <div className="flex-1 space-y-2.5">
                <div className="h-3 bg-gray-200 rounded w-20" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-3/4" />
              </div>
            </div>
          ))}
        </div>
      ) : comments.length === 0 ? (
        <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-xl border border-dashed border-gray-200">
          <div className="text-5xl mb-3">💬</div>
          <p className="text-muted-foreground font-medium">还没有评论</p>
          <p className="text-sm text-muted-foreground/60 mt-1">来抢沙发，分享你的看法吧！</p>
        </div>
      ) : (
        <div className="space-y-1">
          {comments.map((comment) => renderComment(comment))}

          {/* 加载更多 */}
          {hasMore && (
            <div className="text-center pt-3">
              <button
                onClick={loadMore}
                className="text-sm text-primary/70 hover:text-primary transition-colors flex items-center gap-1 mx-auto"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9" />
                </svg>
                加载更多评论
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
