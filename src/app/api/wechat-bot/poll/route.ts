import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import {
  iLinkPost,
  ILINK_BASE,
  getUpdates,
  sendTextMessage,
  extractTextFromMessage,
  sleep,
} from "@/lib/ilink"

// 调用 DeepSeek AI
async function getAIReply(userMessage: string, fromUserName: string): Promise<string> {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ""
  if (!DEEPSEEK_API_KEY) return "AI 服务未配置，请联系管理员。"

  const systemPrompt = `你是"创业导航"的微信 AI 助手。
用户通过微信给你发消息咨询创业、副业、赚钱相关的问题。

回答要求：
- 直接说结论，接地气，不说废话
- 给出可操作的建议和具体步骤
- 优先推荐低成本、快变现的方向
- 每次回复控制在 300 字以内（微信阅读体验）
- 结尾可以引导用户访问网站：创业导航 duoling.com（示例）

当前对话用户昵称：${fromUserName}`

  try {
    const res = await fetch("https://api.deepseek.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userMessage },
        ],
        max_tokens: 800,
        temperature: 0.7,
        stream: false,
      }),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content || "抱歉，暂时无法回复，请稍后再试。"
  } catch (err) {
    console.error("[AI Reply] error:", err)
    return "AI 服务暂时不可用，请稍后再试。"
  }
}

// POST /api/wechat-bot/poll
// 由 Vercel Cron 或手动触发，单次执行一次消息拉取
export async function POST() {
  try {
    const supabase = await createClient()

    // 1. 读取 bot 配置
    const { data: cfg } = await supabase
      .from("bot_config")
      .select("*")
      .eq("id", 1)
      .single()

    if (!cfg?.bot_token) {
      return NextResponse.json({ error: "bot 未登录" }, { status: 400 })
    }
    if (cfg.bot_status !== "online") {
      return NextResponse.json({ error: `bot 状态: ${cfg.bot_status}` }, { status: 400 })
    }

    const baseUrl = cfg.base_url || ILINK_BASE
    const cursor = cfg.last_poll_cursor || ""

    // 2. 长轮询拉取消息（最长等 35s，函数超时设为 40s）
    const data = await getUpdates(cfg.bot_token, baseUrl, cursor)

    // 3. 更新 cursor
    if (data.get_updates_buf) {
      await supabase
        .from("bot_config")
        .update({ last_poll_cursor: data.get_updates_buf, updated_at: new Date().toISOString() })
        .eq("id", 1)
    }

    // 4. 处理消息
    const replies: any[] = []
    for (const msg of data.msgs || []) {
      // 跳过 bot 自己发的消息
      if (msg.message_type === 2) continue

      const text = extractTextFromMessage(msg)
      if (!text) continue

      const fromUserId = msg.from_user_id
      const contextToken = msg.context_token
      const fromUserName = msg.from_user_nickname || "用户"

      console.log(`[WeChat Bot] 收到消息 from ${fromUserName}: ${text}`)

      // 5. 调用 AI 回复
      const replyText = await getAIReply(text, fromUserName)

      // 6. 发送回复
      await sendTextMessage(cfg.bot_token, baseUrl, fromUserId, contextToken, replyText)

      // 7. 记录日志
      await supabase.from("bot_messages").insert({
        from_user_id: fromUserId,
        from_user_name: fromUserName,
        message_text: text,
        reply_text: replyText,
      })

      replies.push({ from: fromUserName, text, reply: replyText })
    }

    return NextResponse.json({
      processed: replies.length,
      replies,
    })
  } catch (err: any) {
    // 超时（AbortError）不算错误，是正常的长轮询返回
    if (err.name === "AbortError") {
      return NextResponse.json({ processed: 0, reason: "long_poll_timeout" })
    }
    console.error("[WeChat Bot Poll] error:", err)
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}

// GET /api/wechat-bot/poll - 也支持 GET（供 Cron 调用）
export async function GET() {
  return POST(new Request("http://localhost/api/wechat-bot/poll", { method: "POST" }))
}
