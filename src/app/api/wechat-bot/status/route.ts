import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { checkQRCodeStatus } from "@/lib/ilink"

// 查询 bot 登录状态（供前端轮询）
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

    // 1. 读取当前状态
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
          // 扫码成功！保存 bot_token
          const writer = adminSupabase || supabase
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

          return NextResponse.json({
            status: "online",
            has_token: true,
            base_url: ilinkStatus.baseurl || null,
          })
        }

        if (ilinkStatus.status === "expired") {
          const writer = adminSupabase || supabase
          await writer
            .from("bot_config")
            .update({
              bot_status: "offline",
              qrcode_key: null,
              qrcode_url: null,
              updated_at: new Date().toISOString(),
            })
            .eq("id", 1)

          return NextResponse.json({
            status: "expired",
            has_token: false,
            message: "二维码已过期，请重新获取",
          })
        }
      } catch (pollErr: unknown) {
        const msg = pollErr instanceof Error ? pollErr.message : String(pollErr)
        console.error("[iLink Poll] error:", msg)
      }
    }

    // 3. 返回当前数据库状态
    const { data: updatedCfg } = await supabase
      .from("bot_config")
      .select("bot_status, qrcode_url")
      .eq("id", 1)
      .single()

    return NextResponse.json({
      status: updatedCfg?.bot_status || cfg?.bot_status || "offline",
      has_token: !!cfg?.bot_token,
      base_url: cfg?.base_url || null,
      qrcode_url: updatedCfg?.qrcode_url || cfg?.qrcode_url || null,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err)
    console.error("[Bot Status] error:", msg)
    return NextResponse.json({ error: "查询状态失败" }, { status: 500 })
  }
}
