"use client"

import { useState, useEffect, useRef } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Send, Loader2, Sparkles, Crown, Lock, TrendingUp,
  RefreshCw, ChevronRight, Zap, MessageSquare
} from "lucide-react"
import Link from "next/link"

interface Message {
  role: "user" | "assistant"
  content: string
}

const SUGGESTED_QUESTIONS = [
  "最近抖音上哪些副业项目最火？",
  "闲鱼上什么虚拟产品最好卖？",
  "微信私域流量怎么变现？",
  "2026年适合普通人的低成本创业方向？",
  "小红书带货和抖音带货哪个更容易入手？",
  "有没有不需要囤货的电商项目？",
]

export default function AiAssistantPage() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const [mode, setMode] = useState<"normal" | "deep">("normal")
  const [remaining, setRemaining] = useState<number | null>(null)
  const [unlimited, setUnlimited] = useState(false)
  const [statusLoaded, setStatusLoaded] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    const init = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()
        setSubscription(sub)

        // 获取使用次数
        const res = await fetch("/api/ai-chat")
        const statusData = await res.json()
        if (statusData.subscribed) {
          setUnlimited(statusData.unlimited)
          setRemaining(statusData.remaining)
        }
      }
      setStatusLoaded(true)
    }
    init()
  }, [])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (content: string) => {
    if (!content.trim() || loading) return

    const newMessages: Message[] = [...messages, { role: "user", content }]
    setMessages(newMessages)
    setInput("")
    setLoading(true)

    try {
      const res = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newMessages,
          mode,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        if (data.code === "NO_SUBSCRIPTION") {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: "❌ 需要订阅才能使用AI助手。[点击订阅](/pricing)",
          }])
        } else if (data.code === "DAILY_LIMIT_EXCEEDED") {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `⏰ 今日次数已用完（${data.limit}次/天）。\n\n升级到**合伙人套餐**可享受无限次查询！[立即升级](/pricing)`,
          }])
          setRemaining(0)
        } else {
          setMessages(prev => [...prev, {
            role: "assistant",
            content: `抱歉，出错了：${data.error}`,
          }])
        }
        return
      }

      setMessages(prev => [...prev, { role: "assistant", content: data.content }])

      // 更新剩余次数
      if (data.remaining !== null && data.remaining !== undefined) {
        setRemaining(data.remaining)
      }
    } catch {
      setMessages(prev => [...prev, {
        role: "assistant",
        content: "网络错误，请重试",
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  // 未登录
  if (statusLoaded && !user) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md text-center">
        <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <MessageSquare className="h-8 w-8 text-purple-600" />
        </div>
        <h1 className="text-2xl font-bold mb-2">AI 创业助手</h1>
        <p className="text-muted-foreground mb-6">登录后即可使用 AI 助手探索最新创业机会</p>
        <Button onClick={() => router.push("/login?redirect=/ai-assistant")}>
          登录 / 注册
        </Button>
      </div>
    )
  }

  // 无订阅
  if (statusLoaded && !subscription) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-lg">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Sparkles className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold mb-2">AI 创业助手</h1>
          <p className="text-muted-foreground">订阅后解锁全网最新创业机会分析</p>
        </div>

        <div className="grid gap-4 mb-8">
          <Card className="border-2 border-purple-200 relative overflow-hidden">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Sparkles className="h-4 w-4 text-purple-600" />
                    <span className="font-bold text-purple-700">创业者套餐</span>
                    <Badge className="bg-purple-100 text-purple-700 border-0">¥29/月</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">每天5次AI创业查询</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-purple-400" />查询全网最火创业项目和副业赛道</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-purple-400" />获取具体落地执行建议</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-purple-400" />每天5次查询额度</li>
              </ul>
            </CardContent>
          </Card>

          <Card className="border-2 border-amber-200">
            <CardContent className="p-6">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Crown className="h-4 w-4 text-amber-600" />
                    <span className="font-bold text-amber-700">合伙人套餐</span>
                    <Badge className="bg-amber-100 text-amber-700 border-0">¥89/月</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">无限次 + 深度咨询模式</p>
                </div>
              </div>
              <ul className="space-y-1.5 text-sm">
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-amber-400" />无限次AI查询，随时查随时用</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-amber-400" />深度咨询模式：完整市场分析+执行路径</li>
                <li className="flex items-center gap-2"><ChevronRight className="h-3 w-3 text-amber-400" />私密创业者社群 + 源码模板</li>
              </ul>
            </CardContent>
          </Card>
        </div>

        <Link href="/pricing">
          <Button className="w-full" size="lg">
            立即订阅，解锁AI助手
          </Button>
        </Link>
      </div>
    )
  }

  const isPartner = subscription?.plan === "合伙人"

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)]">
      {/* 顶部信息栏 */}
      <div className="border-b bg-background px-4 py-3 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center">
            <Sparkles className="h-4 w-4 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-sm">创业雷达 AI</h1>
            <p className="text-xs text-muted-foreground">发现全网最新创业机会</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* 深度模式切换（仅89元可用） */}
          {isPartner ? (
            <button
              onClick={() => setMode(mode === "normal" ? "deep" : "normal")}
              className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                mode === "deep"
                  ? "bg-amber-100 text-amber-700 border-amber-300"
                  : "bg-muted text-muted-foreground border-transparent"
              }`}
            >
              <Crown className="h-3 w-3" />
              {mode === "deep" ? "深度模式 ON" : "深度模式"}
            </button>
          ) : (
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
              <Lock className="h-3 w-3" />
              <span>深度模式（合伙人专属）</span>
            </div>
          )}

          {/* 剩余次数 */}
          {unlimited ? (
            <Badge variant="secondary" className="text-xs">
              <Zap className="h-3 w-3 mr-1" />
              无限次
            </Badge>
          ) : remaining !== null && (
            <Badge
              variant={remaining === 0 ? "destructive" : "secondary"}
              className="text-xs"
            >
              今日剩余 {remaining} 次
            </Badge>
          )}

          <button onClick={() => { setMessages([]); setInput("") }} title="清空对话">
            <RefreshCw className="h-4 w-4 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </div>
      </div>

      {/* 消息区域 */}
      <div className="flex-1 overflow-y-auto px-4 py-6 space-y-4">
        {messages.length === 0 && (
          <div className="max-w-2xl mx-auto">
            {/* 欢迎语 */}
            <div className="text-center mb-8">
              <div className="w-14 h-14 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-7 w-7 text-white" />
              </div>
              <h2 className="text-xl font-bold mb-1">创业雷达，帮你捕捉商机</h2>
              <p className="text-sm text-muted-foreground">
                问我任何关于创业方向、副业项目、赚钱机会的问题
                {isPartner && "，开启深度模式获取完整分析"}
              </p>
            </div>

            {/* 推荐问题 */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {SUGGESTED_QUESTIONS.map((q, i) => (
                <button
                  key={i}
                  onClick={() => sendMessage(q)}
                  className="text-left text-sm border rounded-xl px-4 py-3 hover:border-purple-400 hover:bg-purple-50 transition-colors"
                >
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"} max-w-2xl mx-auto w-full`}>
            {msg.role === "assistant" && (
              <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 shrink-0 mt-0.5">
                <Sparkles className="h-3.5 w-3.5 text-white" />
              </div>
            )}
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed whitespace-pre-wrap ${
                msg.role === "user"
                  ? "bg-purple-600 text-white"
                  : "bg-muted text-foreground"
              }`}
            >
              {msg.content}
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start max-w-2xl mx-auto w-full">
            <div className="w-7 h-7 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mr-2 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-white" />
            </div>
            <div className="bg-muted rounded-2xl px-4 py-3">
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:0ms]" />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:150ms]" />
                <div className="w-1.5 h-1.5 bg-muted-foreground rounded-full animate-bounce [animation-delay:300ms]" />
              </div>
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>

      {/* 输入区域 */}
      <div className="border-t bg-background px-4 py-4 shrink-0">
        <div className="max-w-2xl mx-auto">
          {remaining === 0 && !unlimited && (
            <div className="mb-3 text-center text-sm text-muted-foreground bg-amber-50 border border-amber-200 rounded-xl p-3">
              今日次数已用完，明天再来，或
              <Link href="/pricing" className="text-amber-700 font-medium ml-1">升级合伙人套餐享无限次 →</Link>
            </div>
          )}
          <div className="flex gap-2 items-end">
            <textarea
              ref={textareaRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={
                remaining === 0 && !unlimited
                  ? "今日次数已用完..."
                  : mode === "deep"
                  ? "深度咨询模式：输入你想深入分析的创业方向..."
                  : "问我最新的创业机会、副业项目..."
              }
              disabled={loading || (remaining === 0 && !unlimited)}
              rows={1}
              className="flex-1 resize-none border rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50 disabled:cursor-not-allowed min-h-[48px] max-h-[120px]"
              style={{ height: "auto", overflowY: "hidden" }}
              onInput={(e) => {
                const el = e.currentTarget
                el.style.height = "auto"
                el.style.height = Math.min(el.scrollHeight, 120) + "px"
              }}
            />
            <Button
              size="icon"
              className="h-12 w-12 shrink-0 rounded-xl"
              onClick={() => sendMessage(input)}
              disabled={loading || !input.trim() || (remaining === 0 && !unlimited)}
            >
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            </Button>
          </div>
          <p className="text-xs text-muted-foreground text-center mt-2">
            Enter 发送 · Shift+Enter 换行
            {mode === "deep" && isPartner && <span className="ml-2 text-amber-600">· 深度模式已开启</span>}
          </p>
        </div>
      </div>
    </div>
  )
}
