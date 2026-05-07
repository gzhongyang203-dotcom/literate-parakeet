"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Handshake, Check, X, Loader2, MessageSquare } from "lucide-react"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"

type CollabStatus = "pending" | "accepted" | "rejected"

interface Collaboration {
  id: string
  project_id: string
  user_id: string
  role: string
  message: string
  status: CollabStatus
  created_at: string
  project: {
    title: string
  } | null
  profile: {
    nickname: string
    email: string
  } | null
}

export default function AdminCollaborationsPage() {
  const [collaborations, setCollaborations] = useState<Collaboration[]>([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState<"all" | CollabStatus>("all")
  const [updatingId, setUpdatingId] = useState<string | null>(null)

  const fetchCollaborations = async () => {
    const supabase = createClient()

    let query = supabase
      .from("project_collaborators")
      .select(`
        *,
        project:projects(title),
        profile:profiles(nickname, email)
      `)
      .order("created_at", { ascending: false })

    const { data, error } = await query
    if (!error && data) {
      setCollaborations(data)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchCollaborations()
  }, [])

  const handleStatusChange = async (id: string, newStatus: CollabStatus) => {
    setUpdatingId(id)
    const supabase = createClient()

    const { error } = await supabase
      .from("project_collaborators")
      .update({ status: newStatus })
      .eq("id", id)

    if (!error) {
      setCollaborations(
        collaborations.map((c) => (c.id === id ? { ...c, status: newStatus } : c))
      )
    }
    setUpdatingId(null)
  }

  const filteredCollabs =
    filterStatus === "all"
      ? collaborations
      : collaborations.filter((c) => c.status === filterStatus)

  const pendingCount = collaborations.filter((c) => c.status === "pending").length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">协作管理</h1>
        <p className="text-muted-foreground mt-1">管理用户发起的协作申请</p>
      </div>

      <div className="flex gap-2">
        <Badge
          variant={filterStatus === "all" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterStatus("all")}
        >
          全部 ({collaborations.length})
        </Badge>
        <Badge
          variant={filterStatus === "pending" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterStatus("pending")}
        >
          待处理 ({pendingCount})
        </Badge>
        <Badge
          variant={filterStatus === "accepted" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterStatus("accepted")}
        >
          已对接 ({collaborations.filter((c) => c.status === "accepted").length})
        </Badge>
        <Badge
          variant={filterStatus === "rejected" ? "default" : "outline"}
          className="cursor-pointer"
          onClick={() => setFilterStatus("rejected")}
        >
          已关闭 ({collaborations.filter((c) => c.status === "rejected").length})
        </Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          {filteredCollabs.length === 0 ? (
            <div className="text-center py-12">
              <MessageSquare className="h-12 w-12 text-muted-foreground/30 mx-auto mb-3" />
              <p className="text-muted-foreground">暂无协作申请</p>
              <p className="text-xs text-muted-foreground mt-1">
                用户在项目详情页发起协作后将显示在这里
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {filteredCollabs.map((collab) => (
                <div key={collab.id} className="px-6 py-4 hover:bg-muted/30">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-medium">
                          {collab.profile?.nickname || collab.profile?.email || "未知用户"}
                        </span>
                        {collab.role && (
                          <Badge variant="secondary" className="text-xs">
                            {collab.role}
                          </Badge>
                        )}
                        <span className="text-xs text-muted-foreground">
                          → {collab.project?.title || "未知项目"}
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {collab.message || "无留言"}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {updatingId === collab.id ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : collab.status === "pending" ? (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-green-600 border-green-200 hover:bg-green-50"
                            onClick={() => handleStatusChange(collab.id, "accepted")}
                          >
                            <Check className="h-3 w-3" /> 通过
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1 text-red-500 border-red-200 hover:bg-red-50"
                            onClick={() => handleStatusChange(collab.id, "rejected")}
                          >
                            <X className="h-3 w-3" /> 拒绝
                          </Button>
                        </>
                      ) : (
                        <Badge
                          variant={
                            collab.status === "accepted" ? "success" : "secondary"
                          }
                        >
                          {collab.status === "accepted" ? "已对接" : "已关闭"}
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
