import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { getBotQRCode, checkQRCodeStatus } from "@/lib/ilink"

// 获取 iLink 登录二维码
export async function GET() {
  try {
    console.log("[QR API] 开始处理请求")
    
    const supabase = await createClient()
    console.log("[QR API] Supabase client 创建成功")

    // 鉴权：仅管理员
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log("[QR API] 鉴权结果:", { user: user?.id, error: authError?.message })
    
    if (authError || !user) {
      console.error("[QR API] 鉴权失败:", authError)
      return NextResponse.json({ 
        error: "未登录", 
        detail: authError?.message,
        hint: "请确认已登录管理员账号"
      }, { status: 401 })
    }

    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()
    
    console.log("[QR API] 角色查询结果:", { profile, profileError })
    
    if (profileError || profile?.role !== "admin") {
      console.error("[QR API] 权限验证失败:", profileError)
      return NextResponse.json({ 
        error: "无权限", 
        detail: profileError?.message,
        code: profileError?.code,
        hint: "请确认用户角色是否为admin，或profiles表是否存在"
      }, { status: 403 })
    }

    // 1. 获取二维码
    const qrData = await getBotQRCode()
    console.log("[iLink QR] response:", JSON.stringify(qrData).slice(0, 200))

    if (!qrData.qrcode_img_content) {
      console.error("[iLink QR] 获取二维码失败，完整响应:", JSON.stringify(qrData).slice(0, 1000))
      return NextResponse.json({ 
        error: "获取二维码失败", 
        detail: qrData,
        hint: "请检查 iLink API 是否返回了 qrcode_img_content 字段"
      }, { status: 500 })
    }

    // qrcode_img_content 是二维码图片的 URL（不是 base64！）
    const qrcodeUrl = qrData.qrcode_img_content  // 直接使用 URL
    const qrcodeKey = qrData.qrcode || qrData.qrcode_key
    
    console.log("[QR API] 二维码 URL:", qrcodeUrl)
    console.log("[QR API] 二维码 key:", qrcodeKey)

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
