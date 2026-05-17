import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const formData = await request.formData()
    const plan = formData.get("plan") as string
    const amount = parseInt(formData.get("amount") as string)
    const orderNo = formData.get("order_no") as string
    const screenshotFile = formData.get("screenshot") as File | null

    if (!plan || !amount || !orderNo) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
    }

    // 订单号防重：同一订单号只能提交一次
    const { data: existingOrder } = await supabase
      .from("payment_submissions")
      .select("id")
      .eq("order_no", orderNo)
      .maybeSingle()

    if (existingOrder) {
      return NextResponse.json({ error: "该订单已提交，请勿重复提交" }, { status: 409 })
    }

    // 上传截图（含类型+大小校验）
    const ALLOWED_TYPES = ["image/png", "image/jpeg", "image/webp", "image/gif"]
    const MAX_SIZE = 10 * 1024 * 1024 // 10MB

    let screenshotUrl = ""
    if (screenshotFile) {
      // 校验文件类型
      if (!ALLOWED_TYPES.includes(screenshotFile.type)) {
        return NextResponse.json(
          { error: "只支持 PNG、JPG、WebP、GIF 格式的图片" },
          { status: 400 }
        )
      }
      // 校验文件大小
      if (screenshotFile.size > MAX_SIZE) {
        return NextResponse.json(
          { error: "文件过大，请上传 10MB 以内的图片" },
          { status: 400 }
        )
      }

      const ext = screenshotFile.name.split(".").pop()
      const fileName = `${user.id}/${Date.now()}.${ext}`
      const { data, error } = await supabase.storage
        .from("payment-screenshots")
        .upload(fileName, screenshotFile, { upsert: true })

      if (!error) {
        const { data: urlData } = supabase.storage
          .from("payment-screenshots")
          .getPublicUrl(fileName)
        screenshotUrl = urlData.publicUrl
      }
    }

    // 写入支付记录
    const { error } = await supabase.from("payment_submissions").insert({
      user_id: user.id,
      plan,
      amount,
      order_no: orderNo,
      screenshot_url: screenshotUrl,
      status: "pending",
    })

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Payment submit error:", error)
    return NextResponse.json({ error: "提交失败" }, { status: 500 })
  }
}
