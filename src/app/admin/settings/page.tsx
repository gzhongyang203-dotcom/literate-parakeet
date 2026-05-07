"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings, Save, Globe, Bell, Shield } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground mt-1">管理网站基础配置</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" /> 网站信息
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-1 block">网站名称</label>
              <Input defaultValue="创业导航" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">网站描述</label>
              <Input defaultValue="普通人也能上手的创业项目库" />
            </div>
            <div>
              <label className="text-sm font-medium mb-1 block">联系邮箱</label>
              <Input defaultValue="admin@example.com" type="email" />
            </div>
            <Button size="sm" className="gap-1">
              <Save className="h-3 w-3" /> 保存
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Bell className="h-4 w-4" /> 通知设置
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {["新用户注册通知", "协作申请通知", "订阅到期提醒"].map((item) => (
              <label key={item} className="flex items-center gap-3">
                <input type="checkbox" defaultChecked className="rounded" />
                <span className="text-sm">{item}</span>
              </label>
            ))}
            <Button size="sm" className="gap-1">
              <Save className="h-3 w-3" /> 保存
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
