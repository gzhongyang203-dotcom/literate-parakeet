import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { makeILinkHeaders, ILINK_BASE } from "@/lib/ilink"

// 获取 iLink 登录二维码
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

    // 1. 获取二维码
    const qrRes = await fetch(
      `${ILINK_BASE}/ilink/bot/get_bot_qrcode?bot_type=3`,
      { headers: makeILinkHeaders() }
    )
    if (!qrRes.ok) {
      return NextResponse.json({ error: `获取二维码失败: ${qrRes.status}` }, { status: 500 })
    }
    const qrData = await qrRes.json()
    console.log("[iLink QR] response:", JSON.stringify(qrData).slice(0, 200))

    if (!qrData.qrcode_img_content) {
      return NextResponse.json({ error: "获取二维码失败", detail: qrData }, { status: 500 })
    }

    // qrcode_img_content 是 base64 编码的 PNG 二进制
    // 需要正确拼接 data URI
    const qrcodeUrl = `data:image/png;base64,${qrData.qrcode_img_content}`
    const qrcodeKey = qrData.qrcode

    // 2. 存入数据库（scanning 状态）
    await supabase.from("bot_config").upsert({
      id: 1,
      qrcode_key: qrcodeKey,
      qrcode_url: qrcodeUrl,
      bot_status: "scanning",
      updated_at: new Date().toISOString(),
    })

    return NextResponse.json({
      qrcode_url: qrcodeUrl,
      qrcode_key: qrcodeKey,
    })
  } catch (err: any) {
    console.error("[iLink QR] error:", err)
    return NextResponse.json({ 
      error: err.message,
      stack: process.env.NODE_ENV === "development" ? err.stack : undefined
    }, { status: 500 })
  }
}
