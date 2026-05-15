import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { checkQRCodeStatus } from "@/lib/ilink"

// 快速检测 DeepSeek API 连通性
async function checkDeepSeekHealth(): Promise<{ ok: boolean; latency_ms: number }> {
  const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ""
  if (!DEEPSEEK_API_KEY) return { ok: false, latency_ms: 0 }

  const start = Date.now()
  try {
    const res = await fetch("https://api.deepseek.com/v1/models", {
      headers: { Authorization: `Bearer ${DEEPSEEK_API_KEY}` },
      signal: AbortSignal.timeout(5000),
    })
    return { ok: res.ok, latency_ms: Date.now() - start }
  } catch {
    return { ok: false, latency_ms: Date.now() - start }
  }
}

// 查询 bot 登录状态 + 健康监控
export async function GET() {
  try {
    const supabase = await createClient()

    // 鉴权：仅管理员
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 })
    }

    const adminSupabase = getAdminClient()
    const writer = adminSupabase || supabase

    // 1. 读取当前 bot 状态
    const { data: cfg } = await supabase
      .from("bot_config")
      .select("*")
      .eq("id", 1)
      .single()

    // 2. 如果正在扫码中，轮询 iLink 状态
    if (cfg?.bot_status === "scanning" && cfg?.qrcode_key) {
      try {
        const ilinkStatus = await checkQRCodeStatus(cfg.qrcode_key)

        if (ilinkStatus.status === "confirmed") {
          await writer
            .from("bot_config")
            .update({
              bot_token: ilinkStatus.bot_token,
              base_url: ilinkStatus.baseurl || null,
              bot_status: "online",
              qrcode_key: null,
              qrcode_url: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", 1)
        }

        if (ilinkStatus.status === "expired") {
          await writer
            .from("bot_config")
            .update({
              bot_status: "offline",
              qrcode_key: null,
              qrcode_url: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", 1)
        }
      } catch (pollErr: unknown) {
        console.error("[iLink Poll] error:", pollErr)
      }
    }

    // 3. 查询消息统计（使用 admin client 绕过 RLS）
    const now = new Date()
    const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000).toISOString()
    const twentyFourHourAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString()

    // 并行查询所有统计
    const [
      { count: pendingCount },
      { count: failedCount },
      { count: completedToday },
      { count: totalMessages },
      { data: lastMessages },
    ] = await Promise.all([
      adminSupabase
        ? adminSupabase.from("bot_messages").select("*", { count: "exact", head: true }).eq("status", "pending")
        : { count: null, error: null },
      adminSupabase
        ? adminSupabase.from("bot_messages").select("*", { count: "exact", head: true }).eq("status", "failed")
        : { count: null, error: null },
      adminSupabase
        ? adminSupabase.from("bot_messages").select("*", { count: "exact", head: true }).eq("status", "completed").gte("processed_at", twentyFourHourAgo)
        : { count: null, error: null },
      adminSupabase
        ? adminSupabase.from("bot_messages").select("*", { count: "exact", head: true })
        : { count: null, error: null },
      adminSupabase
        ? adminSupabase.from("bot_messages").select("from_user_name, message_text, reply_text, status, created_at, processed_at").order("created_at", { ascending: false }).limit(10)
        : Promise.resolve({ data: null, error: null }),
    ])

    // 4. 最近1小时内的消息数（活跃度）
    const recentActive = adminSupabase
      ? (await adminSupabase.from("bot_messages").select("*", { count: "exact", head: true }).gte("created_at", oneHourAgo)).count
      : null

    // 5. DeepSeek 健康检查
    const dsHealth = await checkDeepSeekHealth()

    // 6. 计算轮询成功率
    const totalPolls = (cfg?.poll_count || 0)
    const pollErrorCount = (cfg?.poll_error_count || 0)
    const pollSuccessRate = totalPolls > 0
      ? Math.round(((totalPolls - pollErrorCount) / totalPolls) * 100)
      : 100

    // 7. 判断整体健康状态
    const isPollingStale = cfg?.last_poll_at
      ? (now.getTime() - new Date(cfg.last_poll_at).getTime()) > 5 * 60 * 1000 // 超过5分钟没轮询
      : true
    const isProcessingStale = cfg?.last_process_at
      ? (now.getTime() - new Date(cfg.last_process_at).getTime()) > 10 * 60 * 1000 // 超过10分钟没处理
      : true

    let healthStatus: "healthy" | "warning" | "error"
    if (!cfg?.bot_token || cfg.bot_status !== "online") {
      healthStatus = "error"
    } else if (isPollingStale && isProcessingStale) {
      healthStatus = "error"
    } else if ((pendingCount || 0) > 10 || !dsHealth.ok) {
      healthStatus = "warning"
    } else {
      healthStatus = "healthy"
    }

    // 8. 返回完整状态
    return NextResponse.json({
      // 基础状态
      status: cfg?.bot_status || "offline",
      health: healthStatus,
      has_token: !!cfg?.bot_token,
      base_url: cfg?.base_url || null,
      qrcode_url: cfg?.qrcode_url || null,

      // Cron 运行状态
      cron: {
        last_poll_at: cfg?.last_poll_at || null,
        last_process_at: cfg?.last_process_at || null,
        total_polls: totalPolls,
        total_processes: (completedToday || 0) + (failedCount || 0),
        poll_success_rate: pollSuccessRate,
        is_polling_stale: isPollingStale,
        is_processing_stale: isProcessingStale,
      },

      // 消息统计
      messages: {
        total: totalMessages || 0,
        pending: pendingCount || 0,
        failed: failedCount || 0,
        completed_today: completedToday || 0,
        recent_1h: recentActive || 0,
      },

      // 最近消息
      recent_messages: lastMessages || [],

      // AI 服务
      ai: {
        provider: "DeepSeek",
        configured: !!process.env.DEEPSEEK_API_KEY,
        healthy: dsHealth.ok,
        latency_ms: dsHealth.latency_ms,
      },

      checked_at: now.toISOString(),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[Bot Status] error:", msg)
    return NextResponse.json({ error: "查询状态失败" }, { status: 500 })
  }
}
