import { NextResponse } from "next/server"
import { getBotQRCode } from "@/lib/ilink"

// 测试接口：不需要鉴权，直接测试iLink API
export async function GET() {
  try {
    console.log("[TEST QR] 开始测试iLink API...")
    
    const qrData = await getBotQRCode()
    
    console.log("[TEST QR] iLink 完整响应:", JSON.stringify(qrData).slice(0, 1000))
    
    if (!qrData.qrcode_img_content) {
      return NextResponse.json({ 
        error: "iLink API 未返回二维码",
        ilink_response: qrData,
        hint: "请检查 iLink API 是否正常，或 bot_type=3 是否正确"
      }, { status: 500 })
    }
    
    const qrcodeUrl = `data:image/png;base64,${qrData.qrcode_img_content}`
    
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
    return NextResponse.json({ 
      error: err.message,
      stack: err.stack,
      hint: "iLink API 调用失败，请检查网络或API地址"
    }, { status: 500 })
  }
}
