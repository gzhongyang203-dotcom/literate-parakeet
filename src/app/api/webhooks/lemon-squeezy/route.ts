import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"
import crypto from "crypto"

// Lemon Squeezy webhook 签名验证
function verifySignature(payload: string, signature: string, secret: string): boolean {
  const hmac = crypto.createHmac("sha256", secret)
  const digest = hmac.update(payload).digest("hex")
  return crypto.timingSafeEqual(Buffer.from(digest), Buffer.from(signature))
}

export async function POST(request: NextRequest) {
  try {
    const rawBody = await request.text()
    const signature = request.headers.get("x-signature")

    // 验证 webhook 签名
    if (process.env.LEMON_SQUEEZY_WEBHOOK_SECRET) {
      if (!signature) {
        return NextResponse.json({ error: "Missing signature" }, { status: 401 })
      }

      if (!verifySignature(rawBody, signature, process.env.LEMON_SQUEEZY_WEBHOOK_SECRET)) {
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
    }

    const event = JSON.parse(rawBody)
    const eventName = event.meta?.event_name
    const subscriptionId = event.data?.id
    const attributes = event.data?.attributes || {}

    console.log(`Received webhook: ${eventName}`)

    const supabase = await createClient()

    switch (eventName) {
      case "subscription_created":
      case "subscription_updated": {
        const userId = attributes.custom_data?.user_id || event.meta?.custom_data?.user_id
        const planName = attributes.first_order_item?.variant_name?.includes("合伙人") ? "合伙人" : "创业者"
        const status = attributes.status === "active" ? "active" : "canceled"
        const endDate = attributes.ends_at

        if (!userId) {
          console.log("No user_id in subscription webhook")
          break
        }

        // 检查是否已有订阅记录
        const { data: existing } = await supabase
          .from("subscriptions")
          .select("id")
          .eq("lemon_squeezy_id", subscriptionId)
          .single()

        if (existing) {
          // 更新现有订阅
          await supabase
            .from("subscriptions")
            .update({
              plan: planName,
              status,
              end_date: endDate,
            })
            .eq("lemon_squeezy_id", subscriptionId)
        } else {
          // 创建新订阅
          await supabase.from("subscriptions").insert({
            user_id: userId,
            plan: planName,
            status,
            lemon_squeezy_id: subscriptionId,
            start_date: new Date().toISOString(),
            end_date: endDate,
          })
        }

        console.log(`Subscription ${eventName}: ${planName} for user ${userId}`)
        break
      }

      case "subscription_cancelled":
      case "subscription_expired": {
        // 更新订阅状态为取消
        await supabase
          .from("subscriptions")
          .update({ status: "canceled" })
          .eq("lemon_squeezy_id", subscriptionId)

        console.log(`Subscription cancelled: ${subscriptionId}`)
        break
      }

      default:
        console.log(`Unhandled event: ${eventName}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook error:", error)
    return NextResponse.json({ error: "Webhook processing failed" }, { status: 500 })
  }
}
