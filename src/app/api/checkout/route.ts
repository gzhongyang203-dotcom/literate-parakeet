import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// Lemon Squeezy 套餐配置
// 在 Lemon Squeezy 后台创建产品后，替换这里的 variant ID
const PLAN_VARIANTS = {
  创业者: process.env.LEMON_SQUEEZY_VARIANT_29 || "your-variant-id-29",
  合伙人: process.env.LEMON_SQUEEZY_VARIANT_89 || "your-variant-id-89",
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { plan } = await request.json()

    if (!PLAN_VARIANTS[plan as keyof typeof PLAN_VARIANTS]) {
      return NextResponse.json({ error: "无效的套餐" }, { status: 400 })
    }

    // 检查是否已有活跃订阅
    const { data: existingSub } = await supabase
      .from("subscriptions")
      .select("*")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single()

    if (existingSub) {
      return NextResponse.json(
        { error: "您已有活跃订阅" },
        { status: 400 }
      )
    }

    // 如果没有配置 Lemon Squeezy，返回提示
    if (!process.env.LEMON_SQUEEZY_API_KEY || !process.env.LEMON_SQUEEZY_STORE_ID) {
      return NextResponse.json(
        { error: "支付功能尚未配置，请联系管理员" },
        { status: 503 }
      )
    }

    // 调用 Lemon Squeezy Checkout API
    const response = await fetch("https://api.lemonsqueezy.com/v1/checkouts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.LEMON_SQUEEZY_API_KEY}`,
        "Content-Type": "application/vnd.api+json",
        Accept: "application/vnd.api+json",
      },
      body: JSON.stringify({
        data: {
          type: "checkouts",
          attributes: {
            checkout_data: {
              email: user.email,
              custom: {
                user_id: user.id,
              },
            },
            product_options: {
              redirect_url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://literate-parakeet-mu.vercel.app"}/dashboard?subscribed=true`,
            },
          },
          relationships: {
            store: {
              data: {
                type: "stores",
                id: process.env.LEMON_SQUEEZY_STORE_ID,
              },
            },
            variant: {
              data: {
                type: "variants",
                id: PLAN_VARIANTS[plan as keyof typeof PLAN_VARIANTS],
              },
            },
          },
        },
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error("Lemon Squeezy error:", error)
      return NextResponse.json(
        { error: "创建支付链接失败" },
        { status: 500 }
      )
    }

    const checkout = await response.json()
    const checkoutUrl = checkout.data.attributes.url

    return NextResponse.json({ url: checkoutUrl })
  } catch (error) {
    console.error("Checkout error:", error)
    return NextResponse.json(
      { error: "服务器错误" },
      { status: 500 }
    )
  }
}
