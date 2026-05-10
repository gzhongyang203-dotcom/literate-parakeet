import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

// 初始化 bot_config 表（如果不存在）
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

    // 检查表是否存在
    const { data: existing, error: checkError } = await supabase
      .from("bot_config")
      .select("id")
      .eq("id", 1)
      .single()

    if (existing) {
      return NextResponse.json({ 
        message: "bot_config 表已存在", 
        data: existing 
      })
    }

    // 创建初始记录
    const { data: inserted, error: insertError } = await supabase
      .from("bot_config")
      .insert({
        id: 1,
        bot_status: "offline",
        bot_token: null,
        base_url: null,
        qrcode_key: null,
        qrcode_url: null,
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (insertError) {
      return NextResponse.json({ 
        error: "创建记录失败", 
        detail: insertError.message,
        code: insertError.code,
        hint: "可能是表不存在或RLS策略阻止写入"
      }, { status: 500 })
    }

    return NextResponse.json({ 
      message: "bot_config 初始化成功", 
      data: inserted 
    })

  } catch (err: any) {
    console.error("[Init DB] error:", err)
    return NextResponse.json({ 
      error: err.message,
      stack: err.stack
    }, { status: 500 })
  }
}
