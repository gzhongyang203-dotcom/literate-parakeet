// iLink 微信 Bot API 工具库
// 官方协议文档（2026年3月22日发布）
// Base URL: https://ilinkai.weixin.qq.com

export const ILINK_BASE = "https://ilinkai.weixin.qq.com"

// 生成防重放随机 uint32 的 base64
export function makeILinkHeaders(): Record<string, string> {
  const uin = Buffer.from(
    Math.floor(Math.random() * 0xFFFFFFFF).toString()
  ).toString("base64")
  
  return {
    "X-WECHAT-UIN": uin,
    "Content-Type": "application/json",
  }
}

// 生成带认证的请求头（登录后的所有请求必须用这个）
export function makeILinkAuthHeaders(botToken: string): Record<string, string> {
  const headers = makeILinkHeaders()
  headers["AuthorizationType"] = "ilink_bot_token"
  headers["Authorization"] = `Bearer ${botToken}`
  return headers
}

// 通用 POST 请求封装（带 Authorization，登录后使用）
export async function iLinkPost(
  endpoint: string,
  body: any,
  botToken: string,
  timeout = 15000
) {
  const controller = new AbortController()
  const tid = setTimeout(() => controller.abort(), timeout)

  try {
    const res = await fetch(`${ILINK_BASE}/${endpoint}`, {
      method: "POST",
      headers: makeILinkAuthHeaders(botToken),
      body: JSON.stringify(body),
      signal: controller.signal,
    })
    clearTimeout(tid)
    return await res.json()
  } catch (err) {
    clearTimeout(tid)
    throw err
  }
}

// 通用 GET 请求封装
export async function iLinkGet(
  endpoint: string,
  params: Record<string, string> = {},
  botToken?: string
) {
  const qs = new URLSearchParams(params).toString()
  const url = `${ILINK_BASE}/${endpoint}${qs ? "?" + qs : ""}`
  const headers = botToken 
    ? makeILinkAuthHeaders(botToken) 
    : makeILinkHeaders()
  
  const res = await fetch(url, { headers })
  return await res.json()
}

// ---------- 登录相关 ----------

// 获取登录二维码（不需要认证）
export async function getBotQRCode() {
  const url = `${ILINK_BASE}/ilink/bot/get_bot_qrcode?bot_type=3`
  const headers = makeILinkHeaders()
  
  console.log("[iLink] getBotQRCode URL:", url)
  console.log("[iLink] getBotQRCode headers:", JSON.stringify(headers))
  
  const res = await fetch(url, { 
    method: "GET",
    headers: {
      ...headers,
      "Accept": "application/json",
    }
  })
  
  console.log("[iLink] getBotQRCode status:", res.status)
  console.log("[iLink] getBotQRCode content-type:", res.headers.get("content-type"))
  
  const text = await res.text()
  console.log("[iLink] getBotQRCode response (first 500 chars):", text.slice(0, 500))
  
  try {
    return JSON.parse(text)
  } catch {
    return { raw: text, parse_error: "response is not JSON" }
  }
}

// 单次查询扫码状态（供前端轮询调用）
export async function checkQRCodeStatus(qrcodeKey: string) {
  return iLinkGet("ilink/bot/get_qrcode_status", {
    qrcode: qrcodeKey,
  })
}

// ---------- 消息接收 ----------

// 长轮询获取消息（单次，最长等 35s）
export async function getUpdates(
  botToken: string,
  baseUrl: string,
  cursor: string
) {
  const endpoint = `ilink/bot/getupdates`
  return iLinkPost(
    endpoint,
    {
      get_updates_buf: cursor,
      base_info: { channel_version: "1.0.2" },
    },
    botToken,
    40000 // 40s timeout（比服务端35s稍长）
  )
}

// ---------- 消息发送 ----------

// 发送文本消息
export async function sendTextMessage(
  botToken: string,
  baseUrl: string,
  toUserId: string,
  contextToken: string,
  text: string
) {
  return iLinkPost(
    "ilink/bot/sendmessage",
    {
      msg: {
        from_user_id: "",
        to_user_id: toUserId,
        client_id: `bot-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        message_type: 2, // BOT 发送
        message_state: 2, // FINISH
        context_token: contextToken,
        item_list: [{ type: 1, text_item: { text } }],
      },
      base_info: { channel_version: "1.0.2" },
    },
    botToken
  )
}

// 发送"正在输入"状态
export async function sendTyping(
  botToken: string,
  toUserId: string,
  contextToken: string
) {
  return iLinkPost(
    "ilink/bot/sendtyping",
    {
      to_user_id: toUserId,
      context_token: contextToken,
      typing: true,
      base_info: { channel_version: "1.0.2" },
    },
    botToken,
    10000
  )
}

// ---------- 工具函数 ----------

export function sleep(ms: number) {
  return new Promise((r) => setTimeout(r, ms))
}

// 从 iLink 消息体中提取文本
export function extractTextFromMessage(msg: any): string {
  return (
    msg.item_list
      ?.filter((i: any) => i.type === 1 && i.text_item)
      .map((i: any) => i.text_item.text)
      .join("") || ""
  )
}
