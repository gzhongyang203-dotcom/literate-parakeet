"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { X, Send, Bot, User, MessageCircle, Loader2, Sparkles } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
}

const QUICK_QUESTIONS = [
  "零成本创业有什么项目？",
  "适合上班族的副业推荐",
  "AI工具怎么变现？",
  "小红书如何起号？",
]

const WELCOME_MESSAGE = {
  id: "welcome",
  role: "assistant" as const,
  content: "你好！我是**创业导航AI助手** 🧭\n\n我可以帮你：\n- 推荐适合你的创业项目\n- 解答创业相关疑问\n- 推荐工具和资源\n\n有什么想了解的？或者点击下方快捷问题。",
}

// 模拟AI回复（后期对接真实API）
function simulateReply(userMessage: string): string {
  const q = userMessage.toLowerCase()
  if (q.includes("零成本") || q.includes("0成本")) {
    return "推荐几个零成本启动的项目：\n\n1. **闲鱼AI代写** — 用AI帮人写文案，0成本\n2. **小红书AI壁纸号** — 用通义万相免费生成壁纸\n3. **AI表情包** — 生成表情包上架微信\n4. **拼多多虚拟资料** — 卖电子书和模板\n\n这些项目都不需要囤货、不交押金，适合零基础入门。"
  }
  if (q.includes("副业") || q.includes("上班族")) {
    return "上班族副业推荐（每天1-2小时）：\n\n1. **闲鱼AI代写** — 碎片时间接单\n2. **小红书好物测评** — 周末拍视频\n3. **无脸知识短视频** — 晚上剪辑发布\n4. **拼多多虚拟资料** — 设置好后自动出单\n\n关键是选一个方向专注90天，不要同时做多个。"
  }
  if (q.includes("ai") || q.includes("变现")) {
    return "AI变现的几种主流方式：\n\n1. **AI写内容** → 闲鱼/淘宝接单\n2. **AI做图** → 小红书/图库出售\n3. **AI做视频** → 抖音/B站流量变现\n4. **AI做工具** → 搭建微型SaaS收费\n5. **AI做课程** → 知识星球/小报童\n\n这些在我们的项目库里都有详细教程。"
  }
  if (q.includes("小红书")) {
    return "小红书起号三步走：\n\n1. **定位** — 选一个垂直领域（壁纸/家居/穿搭）\n2. **内容** — 每天发2-3条，用AI生成图片和文案\n3. **变现** — 1000粉后接商单/引流私域\n\n关键是保持视觉风格统一，让粉丝一眼能认出是你。"
  }
  return "好问题！我建议你：\n\n1. 去**项目库**浏览分类，找到感兴趣的方向\n2. 从「初级」难度的项目开始\n3. 按照项目里的步骤一步步执行\n4. 遇到问题在社区发帖交流\n\n需要更具体的推荐，可以告诉我你的情况（预算、时间、技能）！"
}

export function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([WELCOME_MESSAGE])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return
    const userMsg: Message = { id: Date.now().toString(), role: "user", content: text }
    setMessages((prev) => [...prev, userMsg])
    setInput("")
    setLoading(true)

    // 模拟延迟
    await new Promise((r) => setTimeout(r, 800 + Math.random() * 1000))
    const reply = simulateReply(text)
    const aiMsg: Message = { id: Date.now().toString() + "-ai", role: "assistant", content: reply }
    setMessages((prev) => [...prev, aiMsg])
    setLoading(false)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* 悬浮按钮 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/30 hover:shadow-xl hover:shadow-purple-500/40 hover:scale-105 transition-all flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse-dot" />
          <span className="absolute top-full mt-2 right-0 bg-white text-xs text-foreground px-2 py-1 rounded-lg shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            AI 创业助手
          </span>
        </button>
      )}

      {/* 聊天窗口 */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[380px] h-[560px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">AI 创业助手</h3>
                <p className="text-xs text-white/70 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-green-400" /> 在线
                </p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-muted/20">
            {messages.map((msg) => (
              <div key={msg.id} className={`flex gap-2.5 ${msg.role === "user" ? "flex-row-reverse" : ""}`}>
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                    msg.role === "assistant"
                      ? "bg-gradient-to-br from-purple-400 to-pink-400"
                      : "bg-gray-200"
                  }`}
                >
                  {msg.role === "assistant" ? (
                    <Bot className="h-4 w-4 text-white" />
                  ) : (
                    <User className="h-4 w-4 text-gray-500" />
                  )}
                </div>
                <div
                  className={`max-w-[75%] rounded-2xl px-4 py-2.5 text-sm whitespace-pre-wrap ${
                    msg.role === "assistant"
                      ? "bg-white border shadow-sm"
                      : "bg-primary text-primary-foreground"
                  }`}
                >
                  {msg.content
                    .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>')
                    .split("\n")
                    .map((line, i) => (
                      <span key={i}>
                        <span dangerouslySetInnerHTML={{ __html: line }} />
                        {i < msg.content.split("\n").length - 1 && <br />}
                      </span>
                    ))}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center shrink-0">
                  <Bot className="h-4 w-4 text-white" />
                </div>
                <div className="bg-white border shadow-sm rounded-2xl px-4 py-3">
                  <Loader2 className="h-4 w-4 animate-spin text-primary" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick questions */}
          {messages.length === 1 && (
            <div className="px-4 py-2 flex flex-wrap gap-1.5 bg-white border-t">
              <span className="text-xs text-muted-foreground w-full mb-1">快捷提问：</span>
              {QUICK_QUESTIONS.map((q) => (
                <Badge
                  key={q}
                  variant="secondary"
                  className="cursor-pointer hover:bg-primary/10 transition-colors"
                  onClick={() => sendMessage(q)}
                >
                  {q}
                </Badge>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="p-3 border-t bg-white flex items-center gap-2 shrink-0">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="输入你的问题..."
              className="flex-1 h-9 rounded-full border px-4 text-sm bg-muted/50 focus:outline-none focus:ring-1 focus:ring-primary"
            />
            <Button
              size="icon"
              className="h-9 w-9 rounded-full shrink-0"
              onClick={() => sendMessage(input)}
              disabled={!input.trim() || loading}
            >
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  )
}
