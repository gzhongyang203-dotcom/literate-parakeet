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
  const [recentMessages, setRecentMessages] = useState<any[]>([])

  // 派生状态，放在所有 useEffect 之前
  const isOnline = botStatus?.status === "online"
  const isScanning = botStatus?.status === "scanning"

  // ─── 数据获取 ───────────────────────────────
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

  // 初始加载
  useEffect(() => {
    fetchStatus()
    fetchMessages()
  }, [fetchStatus, fetchMessages])

  // ─── 扫码中：每 3s 刷新一次状态 ───────────
  useEffect(() => {
    if (!isScanning) return
    const tid = setInterval(fetchStatus, 3000)
    return () => clearInterval(tid)
  }, [isScanning, fetchStatus])

  // ─── 在线后：自动轮询消息（递归，不停） ──
  useEffect(() => {
    if (!isOnline) return
    let stopped = false
    let timer: ReturnType<typeof setTimeout>

    async function pollOnce() {
      if (stopped) return
      try {
        const res = await fetch("/api/wechat-bot/poll", { method: "POST" })
        const data = await res.json()
        if (data.processed > 0) {
          await fetchMessages()
        }
      } catch (err: any) {
        // AbortError 是正常超时，不报错
        if (err.name !== "AbortError") {
          console.error("[AutoPoll] error:", err)
        }
      }
      if (!stopped) timer = setTimeout(pollOnce, 3000)
    }

    pollOnce()
    return () => {
      stopped = true
      clearTimeout(timer)
    }
  }, [isOnline, fetchMessages])

  // ─── 操作函数 ────────────────────────────────
  const handleGetQR = async () => {
    setGettingQR(true)
    try {
      const res = await fetch("/api/wechat-bot/qrcode")
      const data = await res.json()
      if (data.error) alert(`错误: ${data.error}`)
      await fetchStatus()
    } catch (err: any) {
      alert(`获取二维码失败: ${err.message}`)
    } finally {
      setGettingQR(false)
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

  // ─── 加载中 ──────────────────────────────────
  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="mt-4 text-muted-foreground">加载中...</p>
      </div>
    )
  }

  // ─── 主界面 ──────────────────────────────────
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      {/* 标题栏 */}
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
          {/* 离线状态 */}
          {!isOnline && !isScanning && (
            <div className="text-center py-6">
              <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mx-auto mb-4">
                <Smartphone className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="font-medium mb-2">微信 Bot 未登录</h3>
              <p className="text-sm text-muted-foreground mb-4">
                点击下方按钮获取二维码，用微信扫码登录
              </p>
              <Button onClick={handleGetQR} disabled={gettingQR}>
                {gettingQR ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
                获取登录二维码
              </Button>
            </div>
          )}

          {/* 二维码展示 */}
          {isScanning && botStatus?.qrcode_url && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">请用微信扫描二维码登录 Bot</p>
              <div className="inline-block p-6 bg-gradient-to-br from-green-50 to-blue-50 rounded-xl border shadow-sm">
                <div className="text-center space-y-3">
                  <div className="w-16 h-16 rounded-full bg-green-500 flex items-center justify-center mx-auto">
                    <QrCode className="h-8 w-8 text-white" />
                  </div>
                  <div>
                    <p className="font-medium text-green-700">二维码已生成</p>
                    <p className="text-xs text-muted-foreground mt-1">点击下方按钮，用微信扫码</p>
                  </div>
                  <a href={botStatus.qrcode_url} target="_blank" rel="noopener noreferrer" className="inline-block">
                    <Button className="bg-green-500 hover:bg-green-600 text-white">
                      <QrCode className="h-4 w-4 mr-2" />
                      点击这里用微信扫码
                    </Button>
                  </a>
                  <p className="text-xs text-muted-foreground">或复制链接到浏览器打开</p>
                </div>
              </div>
            </div>
          )}

          {/* 在线状态 */}
          {isOnline && (
            <div className="space-y-3">
              <div className="flex gap-3">
                <Button disabled className="flex-1 cursor-not-allowed">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  自动拉取中...
                </Button>
                <Button variant="destructive" onClick={handleLogout}>
                  注销 Bot
                </Button>
              </div>
              <p className="text-xs text-green-600">✅ 消息自动拉取已启用（每 3 秒检查一次）</p>
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
