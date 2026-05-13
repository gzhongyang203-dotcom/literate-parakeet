import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET /api/agents - 获取代理数据
export async function GET(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const type = searchParams.get("type") || "stats" // stats | list | settlements

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    if (type === "stats") {
      // 获取我的代理统计
      const { data: myAgent } = await supabase
        .from("agents")
        .select("*")
        .eq("user_id", user.id)
        .single()

      // 获取下级代理数量
      const { count: agentCount } = await supabase
        .from("agents")
        .select("*", { count: "exact", head: true })
        .eq("parent_user_id", user.id)

      // 获取累计分佣
      const { data: commissions } = await supabase
        .from("agent_commissions")
        .select("commission_amount")
        .eq("parent_user_id", user.id)
        .eq("status", "settled")

      const totalEarnings = commissions?.reduce((sum: number, c: { commission_amount: unknown }) => sum + Number(c.commission_amount), 0) || 0

      // 获取待结算
      const { data: pendingCommissions } = await supabase
        .from("agent_commissions")
        .select("commission_amount")
        .eq("parent_user_id", user.id)
        .eq("status", "pending")

      const pendingSettlement = pendingCommissions?.reduce((sum: number, c: { commission_amount: unknown }) => sum + Number(c.commission_amount), 0) || 0

      // 获取今日新增
      const today = new Date().toISOString().split("T")[0]
      const { data: todayCommissions } = await supabase
        .from("agent_commissions")
        .select("commission_amount")
        .eq("parent_user_id", user.id)
        .gte("created_at", today)

      const todayEarnings = todayCommissions?.reduce((sum: number, c: { commission_amount: unknown }) => sum + Number(c.commission_amount), 0) || 0

      return NextResponse.json({
        inviteCode: myAgent?.invite_code || `VIP${user.id.slice(0, 8)}`,
        commissionRate: myAgent?.commission_rate || 30,
        totalAgents: agentCount || 0,
        activeAgents: agentCount || 0,
        totalEarnings,
        pendingSettlement,
        todayEarnings,
      })
    }

    if (type === "list") {
      // 获取下级代理列表
      const { data: childAgents } = await supabase
        .from("agents")
        .select(`
          id,
          user_id,
          status,
          commission_rate,
          total_earnings,
          total_customers,
          created_at,
          profile:nickname
        `)
        .eq("parent_user_id", user.id)
        .order("created_at", { ascending: false })

      // 获取每个代理的今日收益
      const today = new Date().toISOString().split("T")[0]
      const agentsWithTodayEarnings = await Promise.all(
        (childAgents || []).map(async (agent) => {
          const { data: todayComm } = await supabase
            .from("agent_commissions")
            .select("commission_amount")
            .eq("parent_user_id", user.id)
            .eq("agent_id", agent.id)
            .gte("created_at", today)

          return {
            ...agent,
            nickname: agent.profile || "代理",
            phone: agent.user_id.slice(0, 8) + "****" + agent.user_id.slice(-4),
            todayEarnings: todayComm?.reduce((sum, c) => sum + Number(c.commission_amount), 0) || 0,
            joinDate: agent.created_at?.split("T")[0],
          }
        })
      )

      return NextResponse.json(agentsWithTodayEarnings)
    }

    if (type === "settlements") {
      // 获取结算记录
      const { data: settlements } = await supabase
        .from("settlements")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(20)

      return NextResponse.json(settlements || [])
    }

    return NextResponse.json({ error: "无效的type参数" }, { status: 400 })
  } catch (error) {
    console.error("Agents API error:", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// POST /api/agents - 创建/更新代理设置
export async function POST(request: Request) {
  const supabase = await createClient()
  const { searchParams } = new URL(request.url)
  const action = searchParams.get("action")

  // 获取当前用户
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return NextResponse.json({ error: "未登录" }, { status: 401 })
  }

  try {
    const body = await request.json()

    if (action === "updateCommissionRate") {
      // 更新分佣比例
      const { commissionRate } = body
      if (!commissionRate || commissionRate < 10 || commissionRate > 50) {
        return NextResponse.json({ error: "分佣比例需在10-50%之间" }, { status: 400 })
      }

      // 检查是否已有代理记录
      const { data: existing } = await supabase
        .from("agents")
        .select("id")
        .eq("user_id", user.id)
        .single()

      if (existing) {
        await supabase
          .from("agents")
          .update({ commission_rate: commissionRate, updated_at: new Date().toISOString() })
          .eq("id", existing.id)
      } else {
        await supabase.from("agents").insert({
          user_id: user.id,
          invite_code: `VIP${user.id.slice(0, 8)}`,
          commission_rate: commissionRate,
        })
      }

      return NextResponse.json({ success: true })
    }

    if (action === "settle") {
      // 一键结算
      const { agentId } = body

      // 获取所有待结算的佣金
      const { data: pendingCommissions } = await supabase
        .from("agent_commissions")
        .select("*")
        .eq("parent_user_id", user.id)
        .eq("status", "pending")

      if (!pendingCommissions?.length) {
        return NextResponse.json({ error: "没有待结算的佣金" }, { status: 400 })
      }

      const totalAmount = pendingCommissions.reduce((sum, c) => sum + Number(c.commission_amount), 0)
      const now = new Date().toISOString()

      // 创建结算记录
      await supabase.from("settlements").insert({
        user_id: user.id,
        agent_id: agentId || null,
        amount: totalAmount,
        status: "pending",
        created_at: now,
      })

      // 更新佣金状态为已结算
      const commissionIds = pendingCommissions.map((c) => c.id)
      await supabase
        .from("agent_commissions")
        .update({ status: "settled", settled_at: now })
        .in("id", commissionIds)

      // 更新代理的待结算金额
      await supabase
        .from("agents")
        .update({
          pending_earnings: 0,
          total_earnings: totalAmount,
          updated_at: now,
        })
        .eq("parent_user_id", user.id)

      return NextResponse.json({ success: true, amount: totalAmount })
    }

    return NextResponse.json({ error: "无效的action" }, { status: 400 })
  } catch (error) {
    console.error("Agents POST error:", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
