"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Mail, CalendarDays, Shield } from "lucide-react"

const DEMO_USERS = [
  { id: "1", email: "user1@example.com", nickname: "小明", role: "user", created: "2026-04-01", status: "active" },
  { id: "2", email: "admin@example.com", nickname: "管理员", role: "admin", created: "2026-03-15", status: "active" },
  { id: "3", email: "user3@example.com", nickname: "阿杰", role: "user", created: "2026-04-10", status: "active" },
  { id: "4", email: "user4@example.com", nickname: "创业者小张", role: "user", created: "2026-04-20", status: "inactive" },
  { id: "5", email: "user5@example.com", nickname: "自由职业者", role: "user", created: "2026-04-25", status: "active" },
]

export default function AdminUsersPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">用户管理</h1>
          <p className="text-muted-foreground mt-1">管理注册用户和权限</p>
        </div>
      </div>

      <div className="relative max-w-xs">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input placeholder="搜索用户..." className="pl-9" />
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="divide-y">
            {DEMO_USERS.map((user) => (
              <div key={user.id} className="flex items-center justify-between px-6 py-4 hover:bg-muted/30">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium text-sm">
                    {user.nickname[0]}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{user.nickname}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Mail className="h-3 w-3" /> {user.email}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={user.role === "admin" ? "default" : "outline"} className="gap-1">
                    <Shield className="h-3 w-3" />
                    {user.role === "admin" ? "管理员" : "用户"}
                  </Badge>
                  <Badge variant={user.status === "active" ? "success" : "secondary"}>
                    {user.status === "active" ? "活跃" : "未活跃"}
                  </Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <CalendarDays className="h-3 w-3" /> {user.created}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
