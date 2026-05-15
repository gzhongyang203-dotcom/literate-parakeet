import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getAdminClient } from "@/lib/supabase/admin"
import { getBotQRCode } from "@/lib/ilink"

// 获取 iLink 登录二维码
export async function GET() {
  try {
    const supabase = await createClient()

    // 鉴权：仅管理员
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: "未登录" }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profileError || profile?.role !== "admin") {
      return NextResponse.json({ error: "无权限" }, { status: 403 })
    }

    // 判断 admin client 是否可用
    const adminSupabase = getAdminClient()
    if (!adminSupabase) {
      return NextResponse.json({
        error: "SUPABASE_SERVICE_ROLE_KEY 未配置，请检查 Vercel 环境变量",
      }, { status: 500 })
    }

    // 1. 获取二维码
    const qrData = await getBotQRCode()
    console.log("[iLink QR] response:", JSON.stringify(qrData).slice(0, 200))

    if (!qrData.qrcode_img_content) {
      return NextResponse.json({ error: "获取二维码失败，iLink API 返回异常" }, { status: 500 })
    }

    const qrcodeUrl = qrData.qrcode_img_content
    const qrcodeKey = qrData.qrcode || qrData.qrcode_key

    // 2. 写入数据库（admin client 绕过 RLS）
    const { error: dbError } = await adminSupabase.from("bot_config").upsert({
      id: 1,
      qrcode_key: qrcodeKey,
      qrcode_url: qrcodeUrl,
      bot_status: "scanning",
      updated_at: new Date().toISOString(),
    })

    if (dbError) {
      console.error("[QR API] 数据库写入失败:", dbError.message, dbError.code)

      // 表不存在时返回明确提示
      if (dbError.code === "42P01") {
        return NextResponse.json({
          error: "bot_config 表不存在，请在 Supabase SQL Editor 中执行 supabase/migrations/bot_config_fix.sql",
        }, { status: 500 })
      }

      return NextResponse.json({ error: "数据库写入失败: " + dbError.message }, { status: 500 })
    }

    console.log("[QR API] 数据库写入成功")

    return NextResponse.json({
      qrcode_url: qrcodeUrl,
      qrcode_key: qrcodeKey,
      status: "scanning",
    })
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : String(err)
    console.error("[iLink QR] error:", message)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
