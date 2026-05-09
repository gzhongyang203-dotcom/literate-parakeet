"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import { Users, Loader2, Check, X } from "lucide-react"

const ROLES = ["开发", "运营", "推广", "设计", "内容", "产品", "其他"]

export function ProjectDetailClient({ projectId }: { projectId: string }) {
  const [showForm, setShowForm] = useState(false)
  const [role, setRole] = useState("")
  const [message, setMessage] = useState("")
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: { user: any } }) => {
      setIsLoggedIn(!!data.user)
    })
  }, [])

  const handleSubmit = async () => {
    if (!role) {
      setError("请选择你想参与的角色")
      return
    }
    setError("")
    setSubmitting(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setError("请先登录")
        setSubmitting(false)
        return
      }
      const { error: err } = await supabase.from("project_collaborators").insert({
        project_id: projectId,
        user_id: user.id,
        role,
        message,
        status: "pending",
      })
      if (err) throw err
      setSubmitted(true)
    } catch (e: any) {
      setError(e.message || "提交失败，请稍后重试")
    }
    setSubmitting(false)
  }

  return (
    <div className="rounded-xl border p-6 space-y-4">
      <div className="flex items-center gap-2">
        <Users className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">参与这个项目</h3>
      </div>
      <p className="text-sm text-muted-foreground">
        想一起做这个项目？留下你的信息和想法。
      </p>

      {submitted ? (
        <div className="flex items-center gap-2 text-sm text-green-600">
          <Check className="h-4 w-4" />
          已提交申请，项目方可查看你的信息
        </div>
      ) : !isLoggedIn ? (
        <div className="text-sm text-muted-foreground">
          请先 <a href="/login" className="text-primary hover:underline">登录</a> 后参与协作
        </div>
      ) : showForm ? (
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium mb-1 block">你的角色</label>
            <div className="flex flex-wrap gap-1">
              {ROLES.map((r) => (
                <Badge
                  key={r}
                  variant={role === r ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => setRole(r)}
                >
                  {r}
                </Badge>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm font-medium mb-1 block">想说的话（可选）</label>
            <Textarea
              placeholder="说说你为什么对这个项目感兴趣，有什么经验或资源..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={3}
            />
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <div className="flex gap-2">
            <Button size="sm" onClick={handleSubmit} disabled={submitting}>
              {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              提交申请
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setShowForm(false)}>
              取消
            </Button>
          </div>
        </div>
      ) : (
        <Button size="sm" className="w-full" onClick={() => setShowForm(true)}>
          我想参与这个项目
        </Button>
      )}
    </div>
  )
}
