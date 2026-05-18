"use client"

import { useState, useEffect, Suspense } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Loader2, Upload, AlertCircle, Copy, CheckCircle2, Clock, XCircle, History, Shield, Zap, Users, Sparkles, ArrowRight, ChevronDown, MessageCircle, ExternalLink } from "lucide-react"
import Image from "next/image"

const PLAN_INFO = {
  "创业者": {
    price: 29,
    originalPrice: 59,
    color: "border-purple-300",
    badge: "bg-purple-100 text-purple-700",
    gradient: "from-purple-500 to-pink-500",
  },
  "合伙人": {
    price: 89,
    originalPrice: 159,
    color: "border-amber-300",
    badge: "bg-amber-100 text-amber-700",
    gradient: "from-amber-500 to-orange-500",
  },
}

const BENEFITS = [
  { icon: Zap, text: "解锁全部创业项目方案（持续更新）" },
  { icon: Users, text: "加入创业者交流群，找人一起干" },
  { icon: Sparkles, text: "1对1帮你选适合的方向" },
  { icon: Shield, text: "不满意随时退款，零风险承诺" },
]

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: "不满意随时退款",
    desc: "购买后7天内，不满意无条件退款。不用解释理由，不用尴尬。",
  },
  {
    icon: Clock,
    title: "30分钟极速审核",
    desc: "付款凭证提交后，客服30分钟内完成审核。加急可联系微信。",
  },
  {
    icon: Users,
    title: "已有 328 人通过审核",
    desc: "真实用户，人工审核。每一笔都认真对待，不搞机器人自动通过。",
  },
]

const FAQ_ITEMS = [
  {
    q: "付款后多久能开通？",
    a: "提交凭证后30分钟内人工审核，审核通过立即开通。如急需可联系客服微信加急处理。",
  },
  {
    q: "手动审核安全吗？会不会被骗？",
    a: "每笔付款都有微信/支付宝交易记录可查。审核是为了防止机器人刷单，保证社区质量。7天内不满意随时退款。",
  },
  {
    q: "交易单号在哪里找？",
    a: "打开微信→我→服务→钱包→账单，找到对应付款记录，点进去就能看到交易单号（格式如 2xxx0123xxxxxxxxxx）。",
  },
]

export default function PaymentPage() {
  return (
    <Suspense fallback={
      <div className="container mx-auto px-4 py-16 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    }>
      <PaymentContent />
    </Suspense>
  )
}

function PaymentContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planKey = searchParams.get("plan") || "创业者"
  const info = PLAN_INFO[planKey as keyof typeof PLAN_INFO] || PLAN_INFO["创业者"]

  interface PaymentSubmission {
    id: string
    plan: string
    amount: number
    order_no: string
    status: string
    notes: string | null
    created_at: string
    approved_at: string | null
  }

  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [submissions, setSubmissions] = useState<PaymentSubmission[]>([])
  const [loading, setLoading] = useState(false)
  const [orderNo, setOrderNo] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string>("")
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)
  const [faqOpen, setFaqOpen] = useState<number | null>(null)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setUser(data.user)

      if (data.user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", data.user.id)
          .eq("status", "active")
          .single()
        setSubscription(sub)

        fetchPaymentStatus()
      }
    }
    checkAuth()
  }, [])

  const fetchPaymentStatus = async () => {
    try {
      const res = await fetch("/api/payment-status")
      if (res.ok) {
        const data = await res.json()
        setSubmissions(data.submissions || [])
      }
    } catch (err) {
      console.error("获取支付状态失败:", err)
    }
  }

  const handleScreenshot = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setScreenshot(file)
      setScreenshotPreview(URL.createObjectURL(file))
    }
  }

  const handleSubmit = async () => {
    if (!user) {
      router.push("/login?redirect=/payment")
      return
    }
    if (!orderNo.trim()) {
      alert("请填写微信/支付宝交易单号")
      return
    }

    setLoading(true)
    try {
      const supabase = createClient()

      let screenshotUrl = ""
      if (screenshot) {
        const ext = screenshot.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { error } = await supabase.storage
          .from("payment-screenshots")
          .upload(fileName, screenshot, { upsert: true })

        if (!error) {
          const { data: urlData } = supabase.storage
            .from("payment-screenshots")
            .getPublicUrl(fileName)
          screenshotUrl = urlData.publicUrl
        }
      }

      const { error } = await supabase.from("payment_submissions").insert({
        user_id: user.id,
        plan: planKey,
        amount: info.price * 100,
        order_no: orderNo.trim(),
        screenshot_url: screenshotUrl,
        status: "pending",
      })

      if (error) throw error
      await fetchPaymentStatus()
      setSubmitted(true)
    } catch (err) {
      console.error(err)
      alert("提交失败，请重试")
    } finally {
      setLoading(false)
    }
  }

  const copyWechat = () => {
    navigator.clipboard.writeText("13785108266")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const openWechat = () => {
    // 尝试拉起微信 App
    window.location.href = "weixin://"
    // 兜底：500ms 后复制微信号
    setTimeout(() => {
      navigator.clipboard.writeText("13785108266")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }, 500)
  }

  // Status badge helper
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "approved":
        return <Badge className="bg-green-100 text-green-700 gap-1"><CheckCircle2 className="h-3 w-3" /> 已通过</Badge>
      case "rejected":
        return <Badge className="bg-red-100 text-red-700 gap-1"><XCircle className="h-3 w-3" /> 已拒绝</Badge>
      case "pending":
      default:
        return <Badge className="bg-amber-100 text-amber-700 gap-1"><Clock className="h-3 w-3" /> 审核中</Badge>
    }
  }

  // ---- Already subscribed ----
  if (subscription) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="text-center">
          <CheckCircle2 className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">您已订阅 {subscription.plan} 套餐</h1>
          <p className="text-muted-foreground mb-6">感谢您的支持！</p>
          <Button onClick={() => router.push("/dashboard")}>进入工作台</Button>
        </div>
      </div>
    )
  }

  // ---- Submitted successfully ----
  if (submitted) {
    return (
      <div className="container mx-auto px-4 py-16 max-w-md">
        <div className="text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2">提交成功！</h1>
          <p className="text-muted-foreground mb-6">
            我们将在 <strong>30分钟内</strong> 审核您的付款凭证<br />
            审核通过后自动开通订阅，请留意通知
          </p>
          <div className="bg-muted/50 rounded-xl p-4 mb-6">
            <p className="text-sm text-muted-foreground">
              如需加急，请联系客服微信：
              <Button variant="link" className="text-purple-600 p-0 ml-1" onClick={copyWechat}>
                13785108266 {copied ? "(已复制)" : <Copy className="h-3 w-3 inline ml-1" />}
              </Button>
            </p>
          </div>
          <Button variant="outline" onClick={() => router.push("/dashboard")}>
            返回工作台
          </Button>
        </div>
      </div>
    )
  }

  // ---- Main payment page ----
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-purple-50/30 to-white">
      <div className="container mx-auto px-4 py-8 max-w-lg">

        {/* ===== Trust Banner ===== */}
        <div className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border border-green-200 rounded-xl p-4 mb-8">
          <div className="flex items-center justify-center gap-6 text-sm flex-wrap">
            <div className="flex items-center gap-1.5 text-green-800">
              <Users className="h-4 w-4 text-green-600" />
              <span><strong>328</strong> 人已开通</span>
            </div>
            <div className="w-px h-4 bg-green-300 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-green-800">
              <Clock className="h-4 w-4 text-green-600" />
              <span><strong>30分钟</strong> 极速审核</span>
            </div>
            <div className="w-px h-4 bg-green-300 hidden sm:block" />
            <div className="flex items-center gap-1.5 text-green-800">
              <Shield className="h-4 w-4 text-green-600" />
              <span><strong>7天</strong> 不满意退款</span>
            </div>
          </div>
        </div>

        {/* ===== Plan Header ===== */}
        <div className="text-center mb-6">
          <Badge className={`${info.badge} mb-2`}>订阅 {planKey} 套餐</Badge>
          <div className="flex items-center justify-center gap-3 mt-2">
            <span className="text-4xl font-extrabold bg-gradient-to-r bg-clip-text text-transparent" style={{
              backgroundImage: `linear-gradient(to right, ${
                planKey === "创业者" ? "#8b5cf6, #ec4899" : "#f59e0b, #f97316"
              })`
            }}>
              ¥{info.price}
            </span>
            <span className="text-lg text-muted-foreground line-through">¥{info.originalPrice}</span>
            <Badge className="bg-red-100 text-red-600">省 ¥{info.originalPrice - info.price}</Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-1">一次付费，永久有效</p>
        </div>

        {/* ===== Submission History ===== */}
        {submissions.length > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50/30">
            <CardContent className="p-4">
              <div className="flex items-center gap-2 mb-3">
                <History className="h-4 w-4 text-blue-600" />
                <span className="text-sm font-semibold text-blue-900">我的提交记录</span>
                <button
                  onClick={fetchPaymentStatus}
                  className="ml-auto text-xs text-blue-600 hover:text-blue-800 underline"
                >
                  刷新
                </button>
              </div>
              <div className="space-y-2">
                {submissions.map((s) => (
                  <div key={s.id} className="flex items-center justify-between bg-white rounded-lg p-3 border text-sm">
                    <div>
                      <span className="font-medium">{s.plan}</span>
                      <span className="text-muted-foreground ml-2">¥{(s.amount / 100).toFixed(0)}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        {new Date(s.created_at).toLocaleDateString("zh-CN")}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      {getStatusBadge(s.status)}
                      {s.status === "rejected" && s.notes && (
                        <span className="text-xs text-red-600 max-w-[120px] truncate" title={s.notes}>
                          {s.notes}
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* ===== Step 1: QR Payment ===== */}
        <Card className={`border-2 ${info.color} mb-4 overflow-hidden`}>
          <div className={`bg-gradient-to-r ${info.gradient} text-white px-5 py-3`}>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-white/20 rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="font-bold">扫码付款 ¥{info.price}</span>
            </div>
          </div>
          <CardContent className="p-6">
            {/* Main Payment QR - centered large */}
            <div className="flex flex-col items-center mb-6">
              <div className="relative w-48 h-48 rounded-2xl overflow-hidden border-2 border-green-200 shadow-lg mb-3">
                <Image
                  src="/images/wechat-pay-qr.jpg"
                  alt="微信扫码付款"
                  width={192}
                  height={192}
                  className="block w-full h-full object-cover"
                />
                <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/80 to-transparent p-2 text-center">
                  <span className="text-white text-xs font-medium">📱 微信扫码支付</span>
                </div>
              </div>
              <p className="text-sm font-medium text-foreground">使用微信扫一扫付款</p>
              <p className="text-xs text-muted-foreground mb-3">金额：¥{info.price}</p>

              {/* 一键跳转微信 */}
              <button
                onClick={openWechat}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                style={{ backgroundColor: "#07C160", color: "#fff" }}
              >
                <ExternalLink className="h-4 w-4" />
                一键跳转微信付款
                {copied && <span className="text-xs opacity-80 ml-1">(已复制微信号)</span>}
              </button>
              <p className="text-xs text-muted-foreground mt-1.5">如未跳转，微信号已自动复制</p>
            </div>

            {/* Secondary: Add friend QR */}
            <div className="border-t pt-4">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-xl overflow-hidden border shrink-0">
                  <Image
                    src="/images/wechat-friend-qr.jpg"
                    alt="加客服好友"
                    width={64}
                    height={64}
                    className="block w-full h-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">加客服好友，审核更快</p>
                  <p className="text-xs text-muted-foreground">备注「订阅{planKey}」，优先通过</p>
                  <div className="flex items-center gap-2 mt-2">
                    <button
                      onClick={openWechat}
                      className="text-xs px-3 py-1 rounded-full font-medium transition-colors inline-flex items-center gap-1"
                      style={{ backgroundColor: "#07C160", color: "#fff" }}
                    >
                      <ExternalLink className="h-3 w-3" />
                      跳转微信
                    </button>
                    <button
                      onClick={copyWechat}
                      className="text-xs text-purple-600 hover:text-purple-800 flex items-center gap-1"
                    >
                      <Copy className="h-3 w-3" />
                      {copied ? "已复制" : "复制微信号 13785108266"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Payment note */}
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <div>
                  <p className="text-xs font-medium text-amber-800">付款注意事项</p>
                  <p className="text-xs text-amber-700 mt-0.5">
                    转账时请备注 <strong>订阅{planKey}</strong>，方便快速对账审核。未备注可能延迟处理。
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== Step 2: Submit Proof ===== */}
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="font-bold">提交付款凭证</span>
              <span className="text-xs text-muted-foreground ml-auto">审核通过自动开通</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  微信/支付宝交易单号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="例如：2xxx0123xxxxxxxxxx"
                  className="w-full border rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 transition-shadow"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  💡 微信路径：我 → 服务 → 钱包 → 账单 → 找到付款记录
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">付款截图 <span className="text-xs text-muted-foreground font-normal">（可选，加快审核）</span></label>
                <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 hover:bg-purple-50/50 transition-all">
                  {screenshotPreview ? (
                    <img src={screenshotPreview} alt="付款截图预览" className="max-h-48 rounded-lg" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm font-medium">点击上传付款截图</p>
                      <p className="text-xs text-muted-foreground mt-1">支持 JPG、PNG 格式</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* ===== Benefits Section ===== */}
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-2xl p-6 mb-6">
          <h3 className="text-sm font-bold text-purple-900 mb-4 flex items-center gap-2">
            <Sparkles className="h-4 w-4 text-purple-500" />
            支付后你将获得
          </h3>
          <div className="space-y-3">
            {BENEFITS.map((item, i) => (
              <div key={i} className="flex items-start gap-3">
                <div className="w-8 h-8 rounded-lg bg-white border border-purple-200 flex items-center justify-center shrink-0">
                  <item.icon className="h-4 w-4 text-purple-500" />
                </div>
                <div>
                  <p className="text-sm font-medium text-purple-900">{item.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== Submit Button ===== */}
        <Button
          className="w-full h-12 text-base font-bold shadow-lg shadow-purple-500/20 hover:shadow-xl hover:shadow-purple-500/30 transition-all"
          size="lg"
          onClick={handleSubmit}
          disabled={loading || !orderNo.trim()}
        >
          {loading ? (
            <>
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              提交中...
            </>
          ) : (
            <>
              提交凭证，立即开通
              <ArrowRight className="h-5 w-5 ml-2" />
            </>
          )}
        </Button>

        <p className="text-xs text-center text-muted-foreground mt-3 mb-8">
          提交后30分钟内人工审核开通 · 客服微信：13785108266
        </p>

        {/* ===== Trust Section ===== */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-center text-muted-foreground mb-4">为什么选择我们</h3>
          <div className="grid gap-3">
            {TRUST_ITEMS.map((item, i) => (
              <div key={i} className="bg-white border rounded-xl p-4 flex items-start gap-3 hover:border-purple-200 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                  <item.icon className="h-5 w-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-bold text-foreground">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ===== FAQ ===== */}
        <div className="mb-8">
          <h3 className="text-sm font-bold text-center text-muted-foreground mb-4">常见问题</h3>
          <div className="space-y-2">
            {FAQ_ITEMS.map((item, i) => (
              <div key={i} className="bg-white border rounded-xl overflow-hidden">
                <button
                  onClick={() => setFaqOpen(faqOpen === i ? null : i)}
                  className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-muted/50 transition-colors"
                >
                  <span className="text-sm font-medium">{item.q}</span>
                  <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${faqOpen === i ? "rotate-180" : ""}`} />
                </button>
                {faqOpen === i && (
                  <div className="px-4 pb-3">
                    <p className="text-sm text-muted-foreground">{item.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* ===== Bottom WeChat CTA ===== */}
        <div className="text-center pb-8">
          <p className="text-xs text-muted-foreground mb-2">有疑问？直接加微信问</p>
          <div className="flex items-center justify-center gap-2 flex-wrap">
            <button
              onClick={openWechat}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{ backgroundColor: "#07C160", color: "#fff" }}
            >
              <ExternalLink className="h-4 w-4" />
              一键跳转微信
            </button>
            <button
              onClick={copyWechat}
              className="inline-flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-full text-sm text-green-700 hover:bg-green-100 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              {copied ? "已复制" : "13785108266"}
              {!copied && <Copy className="h-3 w-3" />}
            </button>
          </div>
        </div>

      </div>
    </div>
  )
}
