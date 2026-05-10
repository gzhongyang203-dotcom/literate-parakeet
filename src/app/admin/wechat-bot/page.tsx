"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import {
  QrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  RefreshCw,
  MessageSquare,
  Smartphone,
} from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"

interface BotStatus {
  status: string
  has_token: boolean
  base_url: string
  qrcode_url: string | null
}

export default function WeChatBotAdminPage() {
  const router = useRouter()
  const [botStatus, setBotStatus] = useState<BotStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [gettingQR, setGettingQR] = useState(false)
  const [polling, setPolling] = useState(false)
  const [recentMessages, setRecentMessages] = useState<any[]>([])

  const fetchStatus = useCallback(async () => {
    try {
      const res = await fetch("/api/wechat-bot/status")
      const data = await res.json()
      setBotStatus(data)
    } catch (err) {
      console.error("Failed to fetch status:", err)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [])

  const fetchMessages = useCallback(async () => {
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      const { data } = await supabase
        .from("bot_messages")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(20)
      setRecentMessages(data || [])
    } catch (err) {
      console.error("Failed to fetch messages:", err)
    }
  }, [])

  useEffect(() => {
    fetchStatus()
    fetchMessages()
  }, [fetchStatus, fetchMessages])

  // 自动刷新：扫码中每 3s 查一次状态
  useEffect(() => {
    if (botStatus?.status === "scanning") {
      const tid = setInterval(fetchStatus, 3000)
      return () => clearInterval(tid)
    }
  }, [botStatus?.status, fetchStatus])

  const handleGetQR = async () => {
    setGettingQR(true)
    try {
      const res = await fetch("/api/wechat-bot/qrcode")
      const data = await res.json()
      if (data.error) {
        alert(`错误: ${data.error}`)
      }
      await fetchStatus()
    } catch (err: any) {
      alert(`获取二维码失败: ${err.message}`)
    } finally {
      setGettingQR(false)
    }
  }

  const handlePoll = async () => {
    setPolling(true)
    try {
      const res = await fetch("/api/wechat-bot/poll", { method: "POST" })
      const data = await res.json()
      alert(data.error || `处理完成，收到 ${data.processed || 0} 条消息`)
      await fetchStatus()
      await fetchMessages()
    } catch (err: any) {
      alert(`轮询失败: ${err.message}`)
    } finally {
      setPolling(false)
    }
  }

  const handleLogout = async () => {
    if (!confirm("确定要注销微信Bot吗？")) return
    try {
      const { createClient } = await import("@/lib/supabase/client")
      const supabase = createClient()
      await supabase.from("bot_config").update({
        bot_token: null,
        bot_status: "offline",
        qrcode_key: null,
        qrcode_url: null,
      }).eq("id", 1)
      await fetchStatus()
    } catch (err: any) {
      alert(`操作失败: ${err.message}`)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">加载中...</p>
      </div>
    )
  }

  const isOnline = botStatus?.status === "online"
  const isScanning = botStatus?.status === "scanning"

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">微信 AI 助手管理</h1>
          <p className="text-sm text-muted-foreground mt-1">
            扫码登录后，用户可直接在微信中与 AI 对话
          </p>
        </div>
        <Link href="/admin">
          <Button variant="outline" size="sm">返回后台</Button>
        </Link>
      </div>

      {/* 状态卡片 */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">Bot 状态</CardTitle>
            <div className="flex items-center gap-2">
              <Badge
                variant={isOnline ? "default" : "secondary"}
                className={isOnline ? "bg-green-500" : ""}
              >
                {isOnline ? (
                  <><CheckCircle2 className="h-3 w-3 mr-1" /> 在线</>
                ) : isScanning ? (
                  <><Loader2 className="h-3 w-3 mr-1 animate-spin" /> 等待扫码</>
                ) : (
                  <><XCircle className="h-3 w-3 mr-1" /> 离线</>
                )}
              </Badge>
              <button onClick={() => { setRefreshing(true); fetchStatus() }} title="刷新">
                <RefreshCw className={`h-4 w-4 text-muted-foreground ${refreshing ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {!isOnline && !isScanning && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">微信 Bot 未登录</h3>
              <p className="text-sm text-muted-foreground mb-4">
                点击下方按钮获取二维码，用微信扫码登录
              </p>
              <Button onClick={handleGetQR} disabled={gettingQR || isScanning}>
                {gettingQR ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                获取登录二维码
              </Button>
            </div>
          )}

          {/* 二维码展示 */}
          {isScanning && botStatus?.qrcode_url && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">请用微信扫描下方二维码登录 Bot</p>
              <div className="inline-block p-4 bg-white rounded-xl border shadow-sm">
                <a href={botStatus.qrcode_url} target="_blank" rel="noopener noreferrer">
                  <img 
                    src={botStatus.qrcode_url} 
                    alt="微信Bot登录二维码" 
                    className="w-48 h-48"
                    onError={(e) => {
                      // 如果图片加载失败，显示链接让用户直接访问
                      const target = e.target as HTMLImageElement
                      target.style.display = 'none'
                      const parent = target.parentElement
                      if (parent) {
                        parent.innerHTML = `<p className="text-sm text-blue-500">点击这里打开二维码</p>`
                      }
                    }}
                  />
                </a>
              </div>
              <p className="text-xs text-muted-foreground mt-3">
                如果二维码无法显示，<a href={botStatus.qrcode_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">点击这里在新窗口打开</a>
              </p>
            </div>
          )}

          {/* 在线状态操作 */}
          {isOnline && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button onClick={handlePoll} disabled={polling} className="flex-1">
                  {polling ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <MessageSquare className="h-4 w-4 mr-2" />}
                  立即拉取消息
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  注销 Bot
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                💡 生产环境建议配置 Vercel Cron 自动拉取消息（每 10s 一次）
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* 最近对话 */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">最近对话记录</CardTitle>
        </CardHeader>
        <CardContent>
          {recentMessages.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">暂无对话记录</p>
          ) : (
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {recentMessages.map((msg) => (
                <div key={msg.id} className="border rounded-lg p-3 text-sm">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-primary">{msg.from_user_name || msg.from_user_id}</span>
                    <span className="text-xs text-muted-foreground">
                      {new Date(msg.created_at).toLocaleString("zh-CN")}
                    </span>
                  </div>
                  <p className="text-foreground/80">问：{msg.message_text}</p>
                  <p className="text-muted-foreground mt-1">答：{msg.reply_text}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
