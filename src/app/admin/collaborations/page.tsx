"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Handshake, Check, X } from "lucide-react"

const COLLABORATIONS = [
  { id: "1", project: "闲鱼AI代写服务", user: "小明", role: "运营", message: "我有闲鱼运营经验，之前做过3个号", status: "pending" },
  { id: "2", project: "情侣情绪价值小程序", user: "阿杰", role: "开发", message: "我会微信小程序开发，想找人做运营推广", status: "pending" },
  { id: "3", project: "小红书AI壁纸号", user: "创业者小张", role: "内容", message: "做过小红书号，8000粉，求组队", status: "accepted" },
  { id: "4", project: "AI音频助眠频道", user: "自由职业者", role: "推广", message: "有渠道资源，可以帮忙推广", status: "rejected" },
]

export default function AdminCollaborationsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">协作管理</h1>
        <p className="text-muted-foreground mt-1">管理用户发起的协作申请</p>
      </div>

      <div className="flex gap-2">
        <Badge variant="default" className="cursor-pointer">全部</Badge>
        <Badge variant="outline" className="cursor-pointer">待处理 (2)</Badge>
        <Badge variant="outline" className="cursor-pointer">已对接</Badge>
        <Badge variant="outline" className="cursor-pointer">已关闭</Badge>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {COLLABORATIONS.map((collab) => (
              <div key={collab.id} className="px-6 py-4 hover:bg-muted/30">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm font-medium">{collab.user}</span>
                      <Badge variant="secondary" className="text-xs">{collab.role}</Badge>
                      <span className="text-xs text-muted-foreground">→ {collab.project}</span>
                    </div>
                    <p className="text-sm text-muted-foreground">{collab.message}</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {collab.status === "pending" ? (
                      <>
                        <Button size="sm" variant="outline" className="gap-1 text-green-600 border-green-200 hover:bg-green-50">
                          <Check className="h-3 w-3" /> 通过
                        </Button>
                        <Button size="sm" variant="outline" className="gap-1 text-red-500 border-red-200 hover:bg-red-50">
                          <X className="h-3 w-3" /> 拒绝
                        </Button>
                      </>
                    ) : (
                      <Badge variant={collab.status === "accepted" ? "success" : "secondary"}>
                        {collab.status === "accepted" ? "已对接" : "已关闭"}
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
