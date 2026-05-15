"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Settings, Globe, MessageCircle, CreditCard, Copy, Check } from "lucide-react"
import { useState } from "react"

export default function AdminSettingsPage() {
  const [copied, setCopied] = useState(false)

  const handleCopyWechat = async () => {
    await navigator.clipboard.writeText("13785108266")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold">系统设置</h1>
        <p className="text-muted-foreground mt-1">管理网站基础配置和收款方式</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 收款方式 */}
        <Card className="border-green-200 bg-green-50/30">
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <CreditCard className="h-4 w-4 text-green-600" />
              收款配置（当前使用）
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-white rounded-xl border p-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center shrink-0">
                  <MessageCircle className="h-5 w-5 text-green-600" />
                </div>
                <div className="flex-1">
                  <div className="font-bold text-sm mb-1">微信收款（当前方式）</div>
                  <div className="text-xs text-muted-foreground mb-2">
                    用户添加客服微信，转账后手动开通订阅
                  </div>
                  <div className="flex items-center gap-2 bg-muted rounded-lg px-3 py-2">
                    <span className="text-sm font-mono font-bold">微信号：13785108266</span>
                    <button
                      onClick={handleCopyWechat}
                      className="ml-auto flex items-center gap-1 text-xs text-green-600 hover:text-green-700"
                    >
                      {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
                      {copied ? "已复制" : "复制"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <span className="text-lg">💡</span>
                <div className="text-sm">
                  <div className="font-medium text-amber-800 mb-1">操作流程</div>
                  <ol className="text-xs text-amber-700 space-y-1">
                    <li>1. 用户在定价页点击「立即订阅」</li>
                    <li>2. 添加客服微信 13785108266</li>
                    <li>3. 转账相应金额（29元/89元）</li>
                    <li>4. 在「订阅管理」手动开通权限</li>
                  </ol>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 网站信息 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <Globe className="h-4 w-4" />
              网站信息
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
              <Input defaultValue="13785108266" type="email" />
            </div>
            <Button size="sm" className="gap-1">
              <Settings className="h-3 w-3" /> 保存
            </Button>
          </CardContent>
        </Card>

        {/* 快捷链接 */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <MessageCircle className="h-4 w-4" />
              客服微信
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="text-sm text-muted-foreground">
              右下角客服展示的微信号为：
            </div>
            <div className="bg-muted rounded-xl p-4 flex items-center justify-between">
              <span className="font-mono font-bold text-lg">13785108266</span>
              <button
                onClick={handleCopyWechat}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition-colors"
              >
                {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                {copied ? "已复制" : "复制"}
              </button>
            </div>
            <p className="text-xs text-muted-foreground">
              修改微信号需要编辑文件：<code className="bg-muted px-1 rounded">src/components/ai-chat-widget.tsx</code>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
