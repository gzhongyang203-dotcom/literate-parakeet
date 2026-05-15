import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/payment-status - 用户查询自己的支付提交状态
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    // 获取用户最近的支付提交
    const { data: submissions, error } = await supabase
      .from("payment_submissions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10)

    if (error) throw error

    return NextResponse.json({
      submissions: (submissions || []).map((s: Record<string, unknown>) => ({
        id: s.id,
        plan: s.plan,
        amount: s.amount,
        order_no: s.order_no,
        status: s.status,
        notes: s.notes || null,
        created_at: s.created_at,
        approved_at: s.approved_at || null,
      })),
    })
  } catch (error) {
    console.error("Payment status error:", error)
    return NextResponse.json({ error: "查询失败" }, { status: 500 })
  }
}
