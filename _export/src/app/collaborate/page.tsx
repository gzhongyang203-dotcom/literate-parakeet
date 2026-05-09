"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { createClient } from "@/lib/supabase/client"
import { Users, ArrowRight, Loader2 } from "lucide-react"
import Link from "next/link"

const DEMO_COLLABORATIONS = [
  {
    id: "1",
    project_id: "1",
    project_title: "闲鱼AI代写服务",
    role: "运营",
    user_nickname: "小明",
    message: "我有闲鱼运营经验，之前做过3个号",
    status: "pending",
  },
  {
    id: "2",
    project_id: "3",
    project_title: "情侣情绪价值小程序",
    role: "开发",
    user_nickname: "阿杰",
    message: "我会微信小程序开发，想找人做运营推广",
    status: "pending",
  },
]

export default function CollaboratePage() {
  const [collaborations, setCollaborations] = useState(DEMO_COLLABORATIONS)
  const [showMine, setShowMine] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(async ({ data }: { data: { user: any } }) => {
      setIsLoggedIn(!!data.user)
      if (data.user) {
        try {
          const { data: items } = await supabase
            .from("project_collaborators")
            .select("*, projects:project_id(title)")
            .eq("status", "pending")
          if (items && items.length > 0) {
            setCollaborations(items.map((item: any) => ({
              ...item,
              project_title: item.projects?.title || "未知项目",
            })))
          }
        } catch {}
      }
      setLoading(false)
    })
  }, [])

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">协作广场</h1>
        <p className="text-muted-foreground">找到想一起干的人，组队完成创业项目</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6">
        <Button
          variant={!showMine ? "default" : "outline"}
          size="sm"
          onClick={() => setShowMine(false)}
        >
          最新协作需求
        </Button>
        {isLoggedIn && (
          <Button
            variant={showMine ? "default" : "outline"}
            size="sm"
            onClick={() => setShowMine(true)}
          >
            我的申请
          </Button>
        )}
      </div>

      {!isLoggedIn && (
        <div className="text-center py-8 mb-8 bg-muted/30 rounded-xl">
          <Users className="h-12 w-12 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">登录后可以发布协作需求和查看我的申请</p>
          <Link href="/login?redirect=/collaborate">
            <Button>登录 / 注册</Button>
          </Link>
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        {collaborations.map((collab) => (
          <Card key={collab.id} className="hover:border-primary/50 transition-all">
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-base">
                    <Link href={`/projects/${collab.project_id}`} className="hover:text-primary">
                      {collab.project_title}
                    </Link>
                  </CardTitle>
                  <p className="text-sm text-muted-foreground mt-1">
                    来自 <strong>{collab.user_nickname}</strong>
                  </p>
                </div>
                <Badge variant="secondary">{collab.role}</Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm mb-3">{collab.message}</p>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {collab.status === "pending" ? "等待对接" : collab.status === "accepted" ? "已对接" : "已关闭"}
                </Badge>
                <Link href={`/projects/${collab.project_id}`}>
                  <Button variant="ghost" size="sm" className="gap-1">
                    查看项目 <ArrowRight className="h-3 w-3" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {collaborations.length === 0 && (
        <div className="text-center py-16 text-muted-foreground">
          <p>暂无协作需求</p>
          <p className="text-sm mt-2">去项目库浏览项目，对感兴趣的项目发起协作申请</p>
        </div>
      )}
    </div>
  )
}
