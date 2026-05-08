"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Check, Loader2, Upload, AlertCircle, Copy, CheckCircle2 } from "lucide-react"

const PLAN_INFO = {
  "创业者": {
    price: 29,
    color: "border-purple-300",
    badge: "bg-purple-100 text-purple-700",
  },
  "合伙人": {
    price: 89,
    color: "border-amber-300",
    badge: "bg-amber-100 text-amber-700",
  },
}

export default function PaymentPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const planKey = searchParams.get("plan") || "创业者"
  const info = PLAN_INFO[planKey as keyof typeof PLAN_INFO] || PLAN_INFO["创业者"]

  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [orderNo, setOrderNo] = useState("")
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string>("")
  const [submitted, setSubmitted] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)

      if (user) {
        const { data: sub } = await supabase
          .from("subscriptions")
          .select("*")
          .eq("user_id", user.id)
          .eq("status", "active")
          .single()
        setSubscription(sub)
      }
    }
    checkAuth()
  }, [])

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

      // 上传截图
      let screenshotUrl = ""
      if (screenshot) {
        const ext = screenshot.name.split(".").pop()
        const fileName = `${user.id}/${Date.now()}.${ext}`
        const { data, error } = await supabase.storage
          .from("payment-screenshots")
          .upload(fileName, screenshot, { upsert: true })

        if (!error) {
          const { data: urlData } = supabase.storage
            .from("payment-screenshots")
            .getPublicUrl(fileName)
          screenshotUrl = urlData.publicUrl
        }
      }

      // 提交记录
      const { error } = await supabase.from("payment_submissions").insert({
        user_id: user.id,
        plan: planKey,
        amount: info.price * 100,
        order_no: orderNo.trim(),
        screenshot_url: screenshotUrl,
        status: "pending",
      })

      if (error) throw error
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

  return (
    <div className="container mx-auto px-4 py-12 max-w-lg">
      {/* Plan Badge */}
      <div className="text-center mb-8">
        <Badge className={info.badge}>订阅 {planKey} 套餐</Badge>
        <h1 className="text-2xl font-bold mt-4">支付 ¥{info.price}</h1>
      </div>

      {/* Steps */}
      <div className="space-y-4 mb-8">
        {/* Step 1: Pay */}
        <Card className={`border-2 ${info.color}`}>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">1</div>
              <span className="font-bold">扫码付款</span>
            </div>
            <p className="text-sm text-muted-foreground mb-4">请使用微信或支付宝扫码支付 <strong>¥{info.price}</strong></p>
            <div className="grid grid-cols-2 gap-4">
              <div className="border rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">💬</div>
                <p className="text-sm font-medium">微信支付</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={copyWechat}>
                  {copied ? <Check className="h-4 w-4 mr-1" /> : <Copy className="h-4 w-4 mr-1" />}
                  {copied ? "已复制" : "复制微信"}
                </Button>
              </div>
              <div className="border rounded-xl p-4 text-center">
                <div className="text-4xl mb-2">💙</div>
                <p className="text-sm font-medium">支付宝</p>
                <Button variant="outline" size="sm" className="mt-2" onClick={copyWechat}>
                  <Copy className="h-4 w-4 mr-1" />
                  复制账号
                </Button>
              </div>
            </div>
            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 mt-4">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-amber-600 mt-0.5 shrink-0" />
                <p className="text-xs text-amber-800">
                  转账时备注 <strong>订阅{planKey}</strong>，方便我们对账审核
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step 2: Submit */}
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold">2</div>
              <span className="font-bold">提交凭证</span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1.5 block">
                  交易单号 <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={orderNo}
                  onChange={(e) => setOrderNo(e.target.value)}
                  placeholder="微信/支付宝账单中的交易单号"
                  className="w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  在微信支付/支付宝账单中查找，格式如：2xxx0123xxxxxxxxxx
                </p>
              </div>

              <div>
                <label className="text-sm font-medium mb-1.5 block">付款截图</label>
                <label className="border-2 border-dashed rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:border-purple-400 transition-colors">
                  {screenshotPreview ? (
                    <img src={screenshotPreview} alt="预览" className="max-h-48 rounded-lg" />
                  ) : (
                    <>
                      <Upload className="h-8 w-8 text-muted-foreground mb-2" />
                      <p className="text-sm text-muted-foreground">点击上传付款截图</p>
                    </>
                  )}
                  <input type="file" accept="image/*" onChange={handleScreenshot} className="hidden" />
                </label>
                <p className="text-xs text-muted-foreground mt-1">可选，帮助加快审核速度</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Submit */}
      <Button
        className="w-full"
        size="lg"
        onClick={handleSubmit}
        disabled={loading || !orderNo.trim()}
      >
        {loading ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
            提交中...
          </>
        ) : (
          "提交支付凭证"
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground mt-4">
        提交后将由人工审核，审核通过后自动开通订阅<br />
        客服微信：13785108266
      </p>
    </div>
  )
}
