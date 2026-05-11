import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证登录
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    // 验证管理员角色（修复：原来缺少这步！）
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "无权限（需要管理员）" }, { status: 403 })
    }

    const { id, action, notes } = await request.json()

    if (!id || !action) {
      return NextResponse.json({ error: "缺少参数" }, { status: 400 })
    }

    // 获取支付记录
    const { data: payment, error: fetchError } = await supabase
      .from("payment_submissions")
      .select("*")
      .eq("id", id)
      .single()

    if (fetchError || !payment) {
      return NextResponse.json({ error: "记录不存在" }, { status: 404 })
    }

    if (action === "approve") {
      // 审核通过：写入订阅表
      const { error: subError } = await supabase.from("subscriptions").upsert({
        user_id: payment.user_id,
        plan: payment.plan,
        status: "active",
        lemon_squeezy_id: `manual_${payment.id}`,
        start_date: new Date().toISOString(),
        end_date: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
      }, {
        onConflict: "user_id",
      })

      if (subError) throw subError

      // 更新支付记录状态
      await supabase
        .from("payment_submissions")
        .update({
          status: "approved",
          approved_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          notes: notes || "",
        })
        .eq("id", id)

      return NextResponse.json({ success: true, message: "已开通订阅" })
    }

    if (action === "reject") {
      await supabase
        .from("payment_submissions")
        .update({
          status: "rejected",
          updated_at: new Date().toISOString(),
          notes: notes || "",
        })
        .eq("id", id)

      return NextResponse.json({ success: true, message: "已拒绝" })
    }

    return NextResponse.json({ error: "无效操作" }, { status: 400 })
  } catch (error) {
    console.error("Payment approve error:", error)
    return NextResponse.json({ error: "操作失败" }, { status: 500 })
  }
}
