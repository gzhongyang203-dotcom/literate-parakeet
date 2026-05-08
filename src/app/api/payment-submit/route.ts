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

    // 上传截图
    let screenshotUrl = ""
    if (screenshotFile) {
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
