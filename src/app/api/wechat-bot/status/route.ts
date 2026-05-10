import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { iLinkGet, ILINK_BASE, checkQRCodeStatus } from "@/lib/ilink"

// 查询登录状态 / 单次检查扫码结果
export async function GET(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return NextResponse.json({ error: "未登录" }, { status: 401 })

    const { data: profile } = await supabase
      .from("profiles").select("role").eq("id", user.id).single()
    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 })
    }

    // 读当前配置
    const { data: cfg } = await supabase
      .from("bot_config").select("*").eq("id", 1).single()

    // 如果正在扫码中，单次查询 iLink 状态
    if (cfg?.bot_status === "scanning" && cfg?.qrcode_key) {
      try {
        const ilinkData = await checkQRCodeStatus(cfg.qrcode_key)
        if (ilinkData?.bot_token) {
          await supabase.from("bot_config").update({
            bot_token: ilinkData.bot_token,
            base_url: ilinkData.baseurl || ILINK_BASE,
            bot_status: "online",
            qrcode_key: null,
            qrcode_url: null,
            updated_at: new Date().toISOString(),
          }).eq("id", 1)
          // 重新读取最新状态
          const { data: newCfg } = await supabase
            .from("bot_config").select("*").eq("id", 1).single()
          return NextResponse.json({
            status: "online",
            has_token: true,
            base_url: newCfg?.base_url || ILINK_BASE,
            qrcode_url: null,
          })
        }
      } catch (e) {
        // 查询失败不报错，等下次轮询
      }
    }

    // 返回当前状态
    return NextResponse.json({
      status: cfg?.bot_status || "offline",
      has_token: !!cfg?.bot_token,
      base_url: cfg?.base_url || ILINK_BASE,
      qrcode_url: cfg?.qrcode_url || null,
    })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
