import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

const DEEPSEEK_API_KEY = process.env.DEEPSEEK_API_KEY || ""
const DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"

// 每日限额
const DAILY_LIMIT = {
  "免费版": 5,   // 免费版：每天5次
  "创业者": 999, // 29元：无限次
  "合伙人": 999, // 89元：无限次
}

// Burst 防护：每用户每分钟最多 3 次请求（防止刷接口）
const BURST_WINDOW_MS = 60_000
const BURST_MAX = 3
const burstTracker = new Map<string, number[]>()

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

// 获取今日已使用次数（表有 UNIQUE(user_id, date) 约束，每天每用户一行，count 字段追踪次数）
async function getTodayCount(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, today: string): Promise<number> {
  const { data: log } = await supabase
    .from("ai_chat_logs")
    .select("count")
    .eq("user_id", userId)
    .eq("date", today)
    .maybeSingle()
  return log?.count || 0
}

// 递增今日使用次数（upsert: 存在则 count+1，不存在则插入 count=1）
async function incrementTodayCount(supabase: Awaited<ReturnType<typeof createClient>>, userId: string, today: string, currentCount: number) {
  if (currentCount > 0) {
    // 已存在记录 → 更新 count
    await supabase
      .from("ai_chat_logs")
      .update({ count: currentCount + 1, updated_at: new Date().toISOString() })
      .eq("user_id", userId)
      .eq("date", today)
  } else {
    // 新记录 → 插入
    await supabase
      .from("ai_chat_logs")
      .insert({ user_id: userId, date: today, count: 1 })
  }
}

// Burst 限流检查: 滑动窗口内请求数超过阈值 → 拒绝
function checkBurst(userId: string): { allowed: boolean; retryAfter: number } {
  const now = Date.now()
  const timestamps = burstTracker.get(userId) || []

  // 清理过期时间戳
  const recent = timestamps.filter(t => now - t < BURST_WINDOW_MS)

  if (recent.length >= BURST_MAX) {
    const oldestInWindow = recent[0]
    const retryAfter = Math.ceil((oldestInWindow + BURST_WINDOW_MS - now) / 1000)
    return { allowed: false, retryAfter }
  }

  recent.push(now)
  burstTracker.set(userId, recent)
  return { allowed: true, retryAfter: 0 }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()

    // 验证登录
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    // Burst 防护：每分钟最多 3 次（防止刷接口）
    const burst = checkBurst(user.id)
    if (!burst.allowed) {
      return NextResponse.json(
        { error: "请求过于频繁，请稍后再试", code: "RATE_LIMITED" },
        {
          status: 429,
          headers: {
            "Retry-After": String(burst.retryAfter),
            "X-RateLimit-Limit": String(BURST_MAX),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil((Date.now() + burst.retryAfter * 1000) / 1000)),
          },
        }
      )
    }

    // 检查订阅（免费版用户也允许使用，但有次数限制）
    const { data: subscription } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    // 免费版用户使用5次限制，付费用户根据套餐
    const plan = (subscription?.plan as keyof typeof DAILY_LIMIT) || "免费版"
    const dailyLimit = DAILY_LIMIT[plan] || 5

    // 检查今日使用次数（仅对有限额套餐）
    let todayCount = 0
    if (dailyLimit < 999) {
      const today = new Date().toISOString().split("T")[0]
      todayCount = await getTodayCount(supabase, user.id, today)

      if (todayCount >= dailyLimit) {
        // 计算到明天0点的剩余秒数
        const now = new Date()
        const tomorrow = new Date(now)
        tomorrow.setDate(tomorrow.getDate() + 1)
        tomorrow.setHours(0, 0, 0, 0)
        const retryAfter = Math.ceil((tomorrow.getTime() - now.getTime()) / 1000)

        return NextResponse.json({
          error: `今日使用次数已达上限（${dailyLimit}次/天），升级到付费版可获得无限次`,
          code: "DAILY_LIMIT_EXCEEDED",
          remaining: 0,
          limit: dailyLimit,
        }, {
          status: 429,
          headers: {
            "Retry-After": String(retryAfter),
            "X-RateLimit-Limit": String(dailyLimit),
            "X-RateLimit-Remaining": "0",
            "X-RateLimit-Reset": String(Math.ceil(tomorrow.getTime() / 1000)),
          },
        })
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

    // 记录使用日志（upsert: 存在则 count+1，不存在则插入）
    if (dailyLimit < 999) {
      const today = new Date().toISOString().split("T")[0]
      await incrementTodayCount(supabase, user.id, today, todayCount)
    }

    // 计算剩余次数
    let remaining: number | null = null
    if (dailyLimit < 999) {
      remaining = Math.max(0, dailyLimit - (todayCount + 1))
    }

    // 响应头：限流信息
    const resHeaders: Record<string, string> = {}
    if (dailyLimit < 999) {
      resHeaders["X-RateLimit-Limit"] = String(dailyLimit)
      resHeaders["X-RateLimit-Remaining"] = String(remaining)
      // 明天0点时间戳
      const t = new Date()
      t.setDate(t.getDate() + 1)
      t.setHours(0, 0, 0, 0)
      resHeaders["X-RateLimit-Reset"] = String(Math.ceil(t.getTime() / 1000))
    }

    return NextResponse.json({
      content,
      remaining,
      limit: dailyLimit < 999 ? dailyLimit : null,
    }, { headers: resHeaders })

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

    // 免费版用户也允许使用AI
    const plan = (subscription?.plan as keyof typeof DAILY_LIMIT) || "免费版"
    const dailyLimit = DAILY_LIMIT[plan] || 5

    if (dailyLimit >= 999) {
      return NextResponse.json({ subscribed: true, plan, unlimited: true, remaining: null })
    }

    const today = new Date().toISOString().split("T")[0]
    const todayCount = await getTodayCount(supabase, user.id, today)
    const remaining = Math.max(0, dailyLimit - todayCount)

    return NextResponse.json({ subscribed: true, plan, unlimited: false, remaining, limit: dailyLimit })

  } catch (error) {
    return NextResponse.json({ error: "查询失败" }, { status: 500 })
  }
}
