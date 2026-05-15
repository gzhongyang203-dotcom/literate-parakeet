import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import {
  ILINK_BASE,
  getUpdates,
  sendTextMessage,
  extractTextFromMessage,
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
  } catch {
    return "AI 服务暂时不可用，请稍后再试。"
  }
}

// POST /api/wechat-bot/poll
// 由 Vercel Cron 或手动触发，单次执行一次消息拉取
export async function POST() {
  let pollingLocked = false

  try {
    const supabase = await createClient()
    const adminSupabase = getAdminClient()
    const writer = adminSupabase || supabase

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

    // 1.5 防重叠锁：检查 polling_locked_until，如在将来则跳过
    if (cfg.polling_locked_until) {
      const lockUntil = new Date(cfg.polling_locked_until).getTime()
      if (Date.now() < lockUntil) {
        return NextResponse.json({ processed: 0, reason: "still_polling" })
      }
    }

    // 设置锁：锁定 110 秒（cron 间隔 2 分钟，留 10 秒缓冲）
    const { error: lockSetError } = await writer
      .from("bot_config")
      .update({ polling_locked_until: new Date(Date.now() + 110_000).toISOString() })
      .eq("id", 1)
    if (lockSetError) {
      // 字段可能不存在（需执行 supabase/migrations/bot_config_fix.sql），降级继续
      console.warn("[WeChat Bot Poll] 设置轮询锁失败:", lockSetError.message)
    } else {
      pollingLocked = true
    }

    const baseUrl = cfg.base_url || ILINK_BASE
    const cursor = cfg.last_poll_cursor || ""

    // 2. 长轮询拉取消息
    const data = await getUpdates(cfg.bot_token, baseUrl, cursor)

    // 3. 更新 cursor
    if (data.get_updates_buf) {
      await writer
        .from("bot_config")
        .update({ last_poll_cursor: data.get_updates_buf, updated_at: new Date().toISOString() })
        .eq("id", 1)
    }

    // 4. 处理消息
    const replies: { from: string; text: string; reply: string }[] = []
    for (const msg of data.msgs || []) {
      if (msg.message_type === 2) continue

      const text = extractTextFromMessage(msg)
      if (!text) continue

      const fromUserId = msg.from_user_id
      const contextToken = msg.context_token
      const fromUserName = msg.from_user_nickname || "用户"

      console.log(`[WeChat Bot] 收到消息 from ${fromUserName}: ${text}`)

      // 5. AI 回复
      const replyText = await getAIReply(text, fromUserName)

      // 6. 发送回复
      await sendTextMessage(cfg.bot_token, baseUrl, fromUserId, contextToken, replyText)

      // 7. 记录日志
      await writer.from("bot_messages").insert({
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
  } catch (err: unknown) {
    // Edge Runtime 中 DOMException 可能不存在，用 name 属性判断
    if (err instanceof Error && err.name === "AbortError") {
      return NextResponse.json({ processed: 0, reason: "long_poll_timeout" })
    }
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[WeChat Bot Poll] error:", msg)
    return NextResponse.json({ error: "轮询异常" }, { status: 500 })
  } finally {
    // 释放轮询锁
    if (pollingLocked) {
      try {
        const supabase = await createClient()
        const adminSupabase = getAdminClient()
        const writer = adminSupabase || supabase
        await writer
          .from("bot_config")
          .update({ polling_locked_until: null })
          .eq("id", 1)
      } catch { /* 释放锁失败不影响主流程 */ }
    }
  }
}

export async function GET() {
  return POST()
}
