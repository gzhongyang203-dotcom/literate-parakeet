import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import {
  ILINK_BASE,
  getUpdates,
  extractTextFromMessage,
} from "@/lib/ilink"

// POST /api/wechat-bot/poll
// 由 Vercel Cron 调用（每2分钟），只负责拉取消息并入库
// AI 处理由 /api/wechat-bot/process 异步执行
export async function POST(request: Request) {
  let pollingLocked = false

  try {
    // 鉴权：仅允许 Vercel Cron 或同源调用
    const cronSecret = request.headers.get("x-vercel-cron-secret")
    const configuredSecret = process.env.CRON_SECRET
    if (configuredSecret && cronSecret !== configuredSecret) {
      // 非 Cron，检查是否同源调用
      const origin = request.headers.get("origin") || request.headers.get("host") || ""
      const allowedOrigins = [
        process.env.NEXT_PUBLIC_SITE_URL,
        process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null,
        "http://localhost:3000",
      ].filter(Boolean)
      const isAllowed = allowedOrigins.some((ao) => ao && origin.includes(ao.replace(/^https?:\/\//, "")))
      if (!isAllowed) {
        console.warn("[WeChat Bot Poll] 未授权调用被拒绝, origin:", origin)
        return NextResponse.json({ error: "unauthorized" }, { status: 403 })
      }
    }

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

    // 2. 原子防重叠锁
    const lockUntil = new Date(Date.now() + 110_000).toISOString()
    const nowISO = new Date().toISOString()

    const { data: lockAcquired } = await writer
      .from("bot_config")
      .update({ polling_locked_until: lockUntil })
      .eq("id", 1)
      .or(`polling_locked_until.is.null,polling_locked_until.lt.${nowISO}`)
      .select("id")
      .single()

    if (!lockAcquired) {
      return NextResponse.json({ processed: 0, reason: "still_polling" })
    }
    pollingLocked = true

    const baseUrl = cfg.base_url || ILINK_BASE
    const cursor = cfg.last_poll_cursor || ""

    // 3. 长轮询拉取消息（8.5s timeout）
    const data = await getUpdates(cfg.bot_token, baseUrl, cursor)

    // 4. 更新 cursor 和监控计数
    const now = new Date().toISOString()
    await writer
      .from("bot_config")
      .update({
        last_poll_cursor: data.get_updates_buf || cursor,
        last_poll_at: now,
        poll_count: (cfg.poll_count || 0) + 1,
        updated_at: now,
      })
      .eq("id", 1)

    // 5. 消息入库（仅存储，不处理）
    let savedCount = 0
    for (const msg of data.msgs || []) {
      if (msg.message_type === 2) continue // 跳过自己发的

      const text = extractTextFromMessage(msg)
      if (!text) continue

      const fromUserId = msg.from_user_id
      const fromUserName = msg.from_user_nickname || "用户"
      const contextToken = msg.context_token || ""

      // 去重：30秒内相同用户+相同内容
      const thirtySecAgo = new Date(Date.now() - 30_000).toISOString()
      const { data: dupCheck } = await writer
        .from("bot_messages")
        .select("id")
        .eq("from_user_id", fromUserId)
        .eq("message_text", text)
        .gte("created_at", thirtySecAgo)
        .limit(1)

      if (dupCheck && dupCheck.length > 0) continue

      const { error: insertErr } = await writer.from("bot_messages").insert({
        from_user_id: fromUserId,
        from_user_name: fromUserName,
        message_text: text,
        context_token: contextToken,
        status: "pending",
        retry_count: 0,
      })

      if (!insertErr) {
        savedCount++
        console.log(`[WeChat Bot Poll] 新消息入库 from ${fromUserName}: ${text.slice(0, 50)}`)
      } else {
        console.error(`[WeChat Bot Poll] 消息入库失败:`, insertErr)
      }
    }

    // 6. 触发异步处理（fire-and-forget，不等待结果）
    if (savedCount > 0) {
      const origin = process.env.NEXT_PUBLIC_SITE_URL ||
        (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : null) ||
        "http://localhost:3000"
      const processUrl = `${origin}/api/wechat-bot/process`
      // 不 await，让 process 在后台跑
      fetch(processUrl, { method: "POST" }).catch((e) =>
        console.error("[WeChat Bot Poll] 触发process失败:", e)
      )
    }

    return NextResponse.json({
      processed: savedCount,
      total: (data.msgs || []).length,
    })
  } catch (err: unknown) {
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

export async function GET(request: Request) {
  return POST(request)
}
