import { NextResponse } from "next/server"
import { getAdminClient } from "@/lib/supabase/admin"
import {
  ILINK_BASE,
  sendTextMessage,
  sendTyping,
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
      signal: AbortSignal.timeout(8000),
    })
    const data = await res.json()
    return data.choices?.[0]?.message?.content || "抱歉，暂时无法回复，请稍后再试。"
  } catch {
    return "AI 服务暂时不可用，请稍后再试。"
  }
}

// 自动清理30天前的消息
async function cleanupOldMessages(adminSupabase: any) {
  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
    const { count } = await adminSupabase
      .from("bot_messages")
      .delete({ count: "exact" })
      .lt("created_at", thirtyDaysAgo)
      .neq("status", "processing")

    if (count && count > 0) {
      console.log(`[WeChat Bot Process] 清理了 ${count} 条30天前的旧消息`)
    }
  } catch (e) {
    console.error("[WeChat Bot Process] 清理旧消息失败:", e)
  }
}

// POST /api/wechat-bot/process
// 由 poll 路由 fire-and-forget 触发，或 Vercel Cron 每分钟兜底
// 每次只处理 1 条消息，确保在 10s 超时内完成
export async function POST() {
  const adminSupabase = getAdminClient()
  if (!adminSupabase) {
    return NextResponse.json({ error: "admin client 未配置" }, { status: 500 })
  }

  try {
    // 1. 读取 bot 配置
    const { data: cfg } = await adminSupabase
      .from("bot_config")
      .select("bot_token, base_url, bot_status")
      .eq("id", 1)
      .maybeSingle()

    if (!cfg?.bot_token || cfg.bot_status !== "online") {
      return NextResponse.json({ error: "bot 未在线" }, { status: 400 })
    }

    // 2. 原子取一条待处理消息（maybeSingle 无结果返回 null 不抛异常）
    const now = new Date().toISOString()
    const maxRetries = 3

    const { data: claimed } = await adminSupabase
      .from("bot_messages")
      .update({ status: "processing" })
      .eq("status", "pending")
      .lt("retry_count", maxRetries)
      .order("created_at", { ascending: true })
      .limit(1)
      .select("id, from_user_id, from_user_name, message_text, retry_count, context_token")
      .maybeSingle()

    if (!claimed) {
      // 无待处理消息，顺便清理旧数据
      await cleanupOldMessages(adminSupabase)
      return NextResponse.json({ processed: 0, reason: "no_pending" })
    }

    const baseUrl = cfg.base_url || ILINK_BASE
    console.log(`[WeChat Bot Process] 处理消息 from ${claimed.from_user_name} (retry: ${claimed.retry_count})`)

    try {
      // 3. 发送"正在输入"
      await sendTyping(cfg.bot_token, claimed.from_user_id, claimed.context_token || "").catch(() => {})

      // 4. AI 回复
      const replyText = await getAIReply(claimed.message_text, claimed.from_user_name || "用户")

      // 5. 发送回复
      await sendTextMessage(
        cfg.bot_token,
        baseUrl,
        claimed.from_user_id,
        claimed.context_token || "",
        replyText
      )

      // 6. 标记完成 + 更新时间戳
      await Promise.all([
        adminSupabase
          .from("bot_messages")
          .update({ reply_text: replyText, status: "completed", processed_at: now })
          .eq("id", claimed.id),
        adminSupabase
          .from("bot_config")
          .update({ last_process_at: now, updated_at: now })
          .eq("id", 1),
      ])

      console.log(`[WeChat Bot Process] 完成 → ${claimed.from_user_name}`)

      return NextResponse.json({
        processed: 1,
        status: "completed",
        user: claimed.from_user_name,
      })
    } catch (msgErr: unknown) {
      const errMsg = msgErr instanceof Error ? msgErr.message : String(msgErr)
      console.error(`[WeChat Bot Process] 处理失败:`, errMsg)

      const newRetryCount = (claimed.retry_count || 0) + 1
      const isFinal = newRetryCount >= maxRetries

      // 更新重试状态：未达上限 → pending（等下次重试）；达上限 → failed（不再重试）
      await adminSupabase
        .from("bot_messages")
        .update({
          reply_text: isFinal
            ? `[处理失败，已达最大重试 ${maxRetries} 次] ${errMsg}`
            : `[处理失败，第 ${newRetryCount}/${maxRetries} 次重试] ${errMsg}`,
          status: isFinal ? "failed" : "pending",
          retry_count: newRetryCount,
          processed_at: isFinal ? now : null,
        })
        .eq("id", claimed.id)

      // 更新时间戳
      await adminSupabase
        .from("bot_config")
        .update({ updated_at: now })
        .eq("id", 1)

      return NextResponse.json({
        processed: 1,
        status: isFinal ? "failed" : "retry",
        retry: newRetryCount,
        error: errMsg,
      })
    }
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[WeChat Bot Process] 系统错误:", msg)
    return NextResponse.json({ error: "处理异常" }, { status: 500 })
  }
}

export async function GET() {
  return POST()
}
