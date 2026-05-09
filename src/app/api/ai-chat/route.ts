import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ""
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

// 每日限额
const DAILY_LIMIT = {
  "创业者": 5,  // 29元：每天5次
  "合伙人": 999, // 89元：无限次（999视为无限）
}

const SYSTEM_PROMPT = `你是"创业雷达"，一个专注于帮助中国创业者发现最新商业机会的AI助手。

你的专长：
1. 发现全网最新最火的创业项目、副业赛道、赚钱机会
2. 分析抖音、小红书、闲鱼、拼多多等平台的热门趋势和商机
3. 评估某个方向的市场潜力、入局难度、变现路径
4. 推荐适合普通人低成本启动的副业/创业方向
5. 提供具体的落地步骤和执行建议

回答风格：
- 直接说结论，给可操作的建议
- 举具体案例，不说废话
- 指出机会的同时也点出风险
- 优先推荐低成本、快变现的方向

记住：用户都是普通人，不是投资人，不是大公司，要给接地气的建议。`

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证登录
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    // 检查订阅
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!subscription) {
      return NextResponse.json({ error: "需要订阅才能使用AI助手", code: "NO_SUBSCRIPTION" }, { status: 403 })
    }

    const plan = subscription.plan as keyof typeof DAILY_LIMIT
    const dailyLimit = DAILY_LIMIT[plan] || 5

    // 检查今日使用次数（仅对有限额套餐）
    if (dailyLimit < 999) {
      const today = new Date().toISOString().split("T")[0]
      const { count } = await supabase
        .from("ai_chat_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)

      if ((count || 0) >= dailyLimit) {
        return NextResponse.json({
          error: `今日使用次数已达上限（${dailyLimit}次/天）`,
          code: "DAILY_LIMIT_EXCEEDED",
          remaining: 0,
          limit: dailyLimit,
        }, { status: 429 })
      }
    }

    const { messages, mode } = await request.json()
    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "缺少消息内容" }, { status: 400 })
    }

    // 深度咨询模式（仅89元可用）
    let systemPrompt = SYSTEM_PROMPT
    if (mode === "deep" && plan === "合伙人") {
      systemPrompt += `\n\n【深度咨询模式】：用户希望获得更深度的分析。请提供：
- 更详细的市场分析（规模、增速、竞争格局）
- 完整的执行路径（从0到1的具体步骤）
- 风险评估和应对策略
- 成功案例参考
- 实际可操作的资源推荐（工具、渠道、平台）`
    }

    // 调用DeepSeek API
    if (!DEEPSEEK_API_KEY) {
      return NextResponse.json({ error: "AI服务未配置，请联系管理员" }, { status: 500 })
    }

    const response = await fetch(DEEPSEEK_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${DEEPSEEK_API_KEY}`,
      },
      body: JSON.stringify({
        model: "deepseek-chat",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages.slice(-10), // 最多保留10条上下文
        ],
        max_tokens: mode === "deep" ? 2000 : 1000,
        temperature: 0.7,
        stream: false,
      }),
    })

    if (!response.ok) {
      const errText = await response.text()
      console.error("DeepSeek API error:", errText)
      return NextResponse.json({ error: "AI服务暂时不可用，请稍后重试" }, { status: 500 })
    }

    const data = await response.json()
    const content = data.choices?.[0]?.message?.content || "抱歉，没有获取到回复"

    // 记录使用日志
    await supabase.from("ai_chat_logs").insert({
      user_id: user.id,
      plan: plan,
      mode: mode || "normal",
      tokens_used: data.usage?.total_tokens || 0,
    })

    // 计算剩余次数
    let remaining = null
    if (dailyLimit < 999) {
      const today = new Date().toISOString().split("T")[0]
      const { count: usedCount } = await supabase
        .from("ai_chat_logs")
        .select("*", { count: "exact", head: true })
        .eq("user_id", user.id)
        .gte("created_at", `${today}T00:00:00`)
      remaining = Math.max(0, dailyLimit - (usedCount || 0))
    }

    return NextResponse.json({
      content,
      remaining,
      limit: dailyLimit < 999 ? dailyLimit : null,
    })

  } catch (error) {
    console.error("AI chat error:", error)
    return NextResponse.json({ error: "服务异常，请稍后重试" }, { status: 500 })
  }
}

// 查询今日剩余次数
export async function GET() {
  try {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (!subscription) {
      return NextResponse.json({ subscribed: false })
    }

    const plan = subscription.plan as keyof typeof DAILY_LIMIT
    const dailyLimit = DAILY_LIMIT[plan] || 5

    if (dailyLimit >= 999) {
      return NextResponse.json({ subscribed: true, plan, unlimited: true, remaining: null })
    }

    const today = new Date().toISOString().split("T")[0]
    const { count } = await supabase
      .from("ai_chat_logs")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
      .gte("created_at", `${today}T00:00:00`)

    const remaining = Math.max(0, dailyLimit - (count || 0))
    return NextResponse.json({ subscribed: true, plan, unlimited: false, remaining, limit: dailyLimit })

  } catch (error) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 })
  }
}
