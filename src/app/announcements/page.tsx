"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Pin, MessageCircle, Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"

interface Announcement {
  id: string
  title: string
  content: string
  is_pinned: boolean
  is_active: boolean
  created_at: string
  updated_at: string
}

export default function AnnouncementsPage() {
  const [announcements, setAnnouncements] = useState<Announcement[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchAnnouncements()
  }, [])

  const fetchAnnouncements = async () => {
    const supabase = createClient()
    const { data } = await supabase
      .from("announcements")
      .select("*")
      .eq("is_active", true)
      .order("is_pinned", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(50)

    if (data) setAnnouncements(data)
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-12 max-w-3xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">公告中心</h1>
        <p className="text-muted-foreground">了解平台最新动态和重要通知</p>
      </div>

      {/* 公告列表 */}
      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : announcements.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📢</div>
          <h3 className="text-lg font-medium mb-2">暂无公告</h3>
          <p className="text-muted-foreground">敬请期待...</p>
        </div>
      ) : (
        <div className="space-y-4">
          {announcements.map((ann) => (
            <Link key={ann.id} href={`/announcements/${ann.id}`}>
              <Card className="hover:border-primary/30 transition-colors cursor-pointer">
                <CardContent className="p-6">
                  <div className="flex items-start gap-3">
                    {ann.is_pinned && (
                      <Pin className="h-4 w-4 text-red-500 mt-1 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <h3 className="font-bold text-base">{ann.title}</h3>
                        {ann.is_pinned && (
                          <Badge variant="destructive" className="text-xs">置顶</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground line-clamp-2 mb-3">
                        {ann.content.slice(0, 100)}
                        {ann.content.length > 100 && "..."}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">
                          {new Date(ann.created_at).toLocaleDateString("zh-CN", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })}
                        </span>
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <MessageCircle className="h-3 w-3" />
                          <span>查看详情</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {/* 返回首页 */}
      <div className="mt-8 text-center">
        <Button variant="outline" asChild>
          <Link href="/">返回首页</Link>
        </Button>
      </div>
    </div>
  )
}
