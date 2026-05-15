import { NextResponse } from "next/server"
import { getBotQRCode } from "@/lib/ilink"

// 测试接口：不需要鉴权，直接测试iLink API
export async function GET() {
  try {
    console.log("[TEST QR] 开始测试iLink API...")
    
    const qrData = await getBotQRCode()
    
    console.log("[TEST QR] iLink 完整响应:", JSON.stringify(qrData).slice(0, 1000))
    
    if (!qrData.qrcode_img_content) {
      console.error("[TEST QR] iLink 未返回二维码，完整响应:", JSON.stringify(qrData).slice(0, 500))
      return NextResponse.json({ error: "iLink API 未返回二维码" }, { status: 500 })
    }
    
    // iLink 返回的是 URL（不是 base64），直接使用
    const qrcodeUrl = qrData.qrcode_img_content

    return NextResponse.json({
      success: true,
      message: "iLink API 工作正常",
      qrcode_url: qrcodeUrl,
      qrcode_key: qrData.qrcode,
      ilink_status: qrData.status,
      ilink_msg: qrData.msg
    })
    
  } catch (err: any) {
    console.error("[TEST QR] 错误:", err)
    return NextResponse.json({ error: "iLink API 调用失败" }, { status: 500 })
  }
}
