"use client"

import { Check, Zap, Sparkles, Crown, Loader2, AlertTriangle, TrendingUp, Clock, Users, Timer, Flame, ShieldCheck, ArrowRight, ExternalLink, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { WechatQRCode } from "@/components/wechat-qrcode"

const PLANS = [
  {
    name: "先看看",
    icon: Zap,
    price: "0",
    description: "免费浏览基础项目，了解创业方向",
    color: "border-gray-100 bg-gray-50/50",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-400",
    popular: false,
    muted: true,
    features: [
      { text: "浏览公开项目（部分可见）", included: true },
      { text: "AI 创业雷达（每天5次）", included: true },
      { text: "基础协作功能", included: true },
      { text: "最新项目优先查看", included: false },
      { text: "完整执行指南 + 模板", included: false },
      { text: "私密创业者社群", included: false },
      { text: "一对一创业指导", included: false },
      { text: "源码/文档模板下载", included: false },
    ],
    cta: "先看看",
    href: "/projects",
    action: null,
  },
  {
    name: "创业者",
    icon: Sparkles,
    price: "29",
    planKey: "创业者",
    originalPrice: "59",
    description: "获取完整项目方案，跟着步骤落地执行",
    color: "border-transparent ring-2 ring-purple-400",
    iconBg: "bg-gradient-to-br from-purple-500 to-pink-500",
    iconColor: "text-white",
    popular: true,
    gradientBorder: true,
    features: [
      { text: "100+ 可执行项目方案（价值¥999）", included: true, highlight: true },
      { text: "每日更新最新副业机会", included: true },
      { text: "完整执行指南 + 模板", included: true },
      { text: "AI 创业雷达（无限次查询）", included: true },
      { text: "微信1v1创业咨询（价值¥299）", included: false },
      { text: "行业内部群 + 私密社群", included: false },
      { text: "一对一创业指导", included: false },
      { text: "源码/文档模板下载", included: false },
    ],
    cta: "立即订阅",
    action: "subscribe",
  },
  {
    name: "合伙人",
    icon: Crown,
    price: "89",
    planKey: "合伙人",
    originalPrice: "199",
    description: "私密社群 + 1对1指导，快速跑通项目",
    color: "border-amber-300 bg-amber-50/20",
    iconBg: "bg-gradient-to-br from-amber-400 to-orange-500",
    iconColor: "text-white",
    popular: false,
    features: [
      { text: "创业者套餐全部权益", included: true },
      { text: "一对一创业指导（价值¥999）", included: true, highlight: true },
      { text: "行业内部群 + 私密社群", included: true, highlight: true },
      { text: "源码/文档模板下载", included: true },
      { text: "优先内测新项目", included: true },
      { text: "代理推广权（分佣50%）", included: true, highlight: true },
      { text: "每月1次视频诊断", included: true },
      { text: "无限次一对一指导", included: true },
    ],
    cta: "立即订阅",
    action: "subscribe",
  },
]

const FAQ = [
  { q: "订阅后可以退款吗？", a: "7天内无条件退款，直接联系客服即可。" },
  { q: "免费版会一直免费吗？", a: "是的，免费版永久免费，每天可AI查询5次。升级付费版可获得无限次查询 + 完整执行指南。" },
  { q: "AI创业雷达是什么？", a: "接入DeepSeek大模型的智能助手，实时分析全网最新创业项目、副业赛道和商业机会，给你具体可落地的建议。免费版每天5次，付费版无限次。" },
  { q: "一对一指导是什么？", a: "合伙人套餐专属服务，可以获得针对你个人情况的创业方向诊断和落地指导。" },
  { q: "支付方式有哪些？", a: "支持微信支付、支付宝、银行卡，通过微信转账给客服即可开通。" },
  { q: "如何订阅？", a: "点击下方「立即订阅」，然后添加客服微信好友后转账即可秒开订阅。" },
]

// 犹豫解答
const HESITATION_FAQ = [
  {
    q: "我什么都不会能行吗？",
    a: "所有方案从零开始，保姆级教程。每个项目都有完整步骤、工具清单和收入预期，照着做就能跑起来。我们的学员80%都是零基础起步的。",
    emoji: "🤔",
  },
  {
    q: "怕坚持不下去？",
    a: "微信社群每天打卡，别人都在跑。你看到群里天天有人晒收入截图，想偷懒都难。有目标有氛围，坚持变得容易。",
    emoji: "💪",
  },
  {
    q: "真的能赚到钱吗？",
    a: "来看真实案例（含收入截图）。闲鱼代写月入5000+、小红书壁纸号月入8000+、情感咨询月入10000+，都是学员真实成绩。不保证暴富，但认真做一定能见到效果。",
    emoji: "💰",
  },
]

const STATS = [
  { icon: Users, value: "陆续加入", label: "创业者", color: "text-green-600" },
  { icon: TrendingUp, value: "稳步提升", label: "项目成功率", color: "text-blue-600" },
  { icon: Clock, value: "快速启动", label: "平均启动周期", color: "text-purple-600" },
]

const TODAY_ORDERS = [
  { name: "张同学", location: "深圳", plan: "创业者套餐", time: "刚刚" },
  { name: "李女士", location: "广州", plan: "合伙人套餐", time: "2分钟前" },
  { name: "王先生", location: "北京", plan: "创业者套餐", time: "5分钟前" },
  { name: "赵学员", location: "上海", plan: "创业者套餐", time: "8分钟前" },
  { name: "周网友", location: "杭州", plan: "合伙人套餐", time: "12分钟前" },
]

const ANXIETY_ITEMS = [
  {
    emoji: "😰",
    title: "你缺的从来不是努力",
    desc: "方向选错了，再拼命也是白费。别人闷声赚钱的时候，你还在原地踩坑。",
  },
  {
    emoji: "⏰",
    title: "好项目不等人",
    desc: "2024年的闲鱼代写、2025年的小红书壁纸，现在入场还来得及吗？越晚越难。",
  },
  {
    emoji: "🎯",
    title: "免费的东西最贵",
    desc: "网上教程看了100G，真正落地时发现全是过时的。真正有用的，都在付费区。",
  },
]

function PricingContent() {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)
  const [subscription, setSubscription] = useState<any>(null)
  const [loading, setLoading] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  const openWechat = () => {
    window.location.href = "weixin://"
    setTimeout(() => {
      navigator.clipboard.writeText("gcy892")
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }, 500)
  }

  const copyWechat = () => {
    navigator.clipboard.writeText("gcy892")
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

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

  const handleSubscribe = async (planKey: string) => {
    if (!user) {
      router.push("/login?redirect=/payment?plan=" + encodeURIComponent(planKey))
      return
    }

    router.push("/payment?plan=" + encodeURIComponent(planKey))
  }

  return (
    <div className="container mx-auto px-4 py-8 sm:py-12">
      {/* 焦虑文案区 */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-bold text-red-600">你可能正在犯的错</span>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {ANXIETY_ITEMS.map((item, i) => (
              <div key={i} className="bg-white/80 rounded-xl p-4">
                <div className="text-2xl mb-2">{item.emoji}</div>
                <h4 className="font-bold text-sm mb-1">{item.title}</h4>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 今日订单滚动 */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Flame className="h-5 w-5 text-orange-500" />
              <span className="font-bold text-orange-600">🔥 今日疯抢中</span>
            </div>
            <span className="text-xs text-green-600/70">今日已有 28 人订阅</span>
          </div>
          <div className="space-y-2">
            {TODAY_ORDERS.map((order, index) => (
              <div
                key={index}
                className={`flex items-center justify-between text-xs sm:text-sm gap-2 ${
                  index === 0 ? "text-green-700 font-medium" : "text-green-600/80"
                }`}
              >
                <div className="flex items-center gap-1 min-w-0 overflow-hidden">
                  <span className="text-green-400 flex-shrink-0">✓</span>
                  <span className="truncate">{order.name}</span>
                  <span className="text-green-400/60 hidden sm:inline flex-shrink-0">·</span>
                  <span className="hidden sm:inline flex-shrink-0">{order.location}</span>
                  <span className="text-green-400/60 flex-shrink-0">·</span>
                  <span className="truncate">订阅了 {order.plan}</span>
                </div>
                <span className="text-xs text-green-400/60 flex-shrink-0">{order.time}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 统计数据 */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center p-4 bg-muted/50 rounded-xl">
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* 限时优惠横幅 */}
      <div className="max-w-3xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-amber-100 to-orange-100 border border-amber-300 rounded-xl p-4 text-center">
          <div className="flex items-center justify-center gap-2 text-amber-700 mb-2">
            <Timer className="h-5 w-5" />
            <span className="font-bold">🔥 限时特惠</span>
          </div>
          <p className="text-sm text-amber-600">
            创业者套餐 <span className="font-bold line-through text-amber-400">原价¥59/月</span>
            <span className="font-bold text-red-500 ml-2 text-lg">仅需 ¥29/月</span>
          </p>
          <p className="text-xs text-amber-500 mt-1">优惠截止：还剩 7 天 23 小时</p>
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">订阅方案</Badge>
        <h1 className="heading-lg text-2xl sm:text-3xl md:text-4xl mb-4">选择适合你的方案</h1>
        <p className="body-premium text-muted-foreground max-w-md mx-auto">
          所有老项目永久免费。新项目 + 深度内容仅对付费用户开放。
        </p>
        {subscription && (
          <Badge variant="success" className="mt-4">
            您已订阅 {subscription.plan} 套餐
          </Badge>
        )}
      </div>

      {/* Error message */}
      {error && (
        <div className="max-w-5xl mx-auto mb-6">
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
            {error}
          </div>
        </div>
      )}

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-12">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 ${plan.color} ${plan.muted ? "opacity-70 scale-[0.97]" : ""} p-8 flex flex-col ${
              plan.gradientBorder ? "bg-white" : "bg-white"
            }`}
          >
            {/* Popular badge */}
            {plan.popular && (
              <div className="absolute -top-4 left-1/2 -translate-x-1/2 z-10">
                <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-0 px-5 py-1.5 text-sm font-bold shadow-lg">
                  最多人选择 · 推荐
                </Badge>
              </div>
            )}

            {/* Price anchor badge */}
            {"originalPrice" in plan && plan.originalPrice && (
              <div className="absolute -top-4 right-3 z-10">
                <Badge className="bg-red-100 text-red-600 border-red-200 text-xs">
                  省¥{Number(plan.originalPrice) - Number(plan.price)}
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-11 h-11 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                <plan.icon className={`h-5 w-5 ${plan.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

            {/* Price */}
            <div className="mb-6">
              <div className="flex items-baseline gap-1">
                <span className="text-4xl font-bold">¥{plan.price}</span>
                <span className="text-muted-foreground text-sm">/月</span>
              </div>
              {"originalPrice" in plan && plan.originalPrice && (
                <p className="text-xs text-muted-foreground mt-1">
                  <span className="line-through">¥{plan.originalPrice}/月</span>
                  <span className="text-red-500 ml-2 font-medium">限时优惠</span>
                </p>
              )}
            </div>

            {/* CTA */}
            {plan.action === null ? (
              <Link href={plan.href}>
                <Button
                  className="w-full mb-6 btn-rounded"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            ) : subscription ? (
              <Button
                className="w-full mb-6 btn-rounded"
                variant="outline"
                disabled
              >
                已订阅
              </Button>
            ) : (
              <Button
                className={`w-full mb-6 btn-rounded ${plan.popular ? "shadow-premium" : ""}`}
                variant={plan.popular ? "default" : "outline"}
                onClick={() => handleSubscribe(plan.planKey!)}
                disabled={loading === plan.planKey}
              >
                {loading === plan.planKey ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                    跳转支付...
                  </>
                ) : (
                  plan.cta
                )}
              </Button>
            )}

            {/* Features */}
            <ul className="space-y-3 flex-1">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-start gap-2.5">
                  <Check
                    className={`h-4 w-4 shrink-0 mt-0.5 ${
                      feat.included ? "text-green-500" : "text-gray-300"
                    }`}
                  />
                  <span
                    className={`text-sm leading-relaxed ${
                      feat.included
                        ? (feat as any).highlight
                          ? "text-foreground font-semibold"
                          : "text-foreground"
                        : "text-muted-foreground line-through"
                    }`}
                  >
                    {feat.text}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>

      {/* 犹豫解答 - 核心新增 */}
      <div className="max-w-3xl mx-auto mb-16">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-amber-50 border border-amber-200 rounded-full mb-3">
            <ShieldCheck className="h-4 w-4 text-amber-600" />
            <span className="text-sm font-medium text-amber-700">还在犹豫？看看这个</span>
          </div>
          <h2 className="heading-lg text-2xl">你可能在担心的，我们都想到了</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {HESITATION_FAQ.map((item, i) => (
            <div
              key={i}
              className="bg-white border rounded-xl p-5 card-premium"
            >
              <div className="text-2xl mb-3">{item.emoji}</div>
              <h3 className="font-bold text-base mb-2">{item.q}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{item.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 客服订阅说明 */}
      {!subscription && (
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg mb-2">💬 如何订阅？</h3>
              <p className="text-sm text-muted-foreground">
                扫码添加客服微信 <span className="font-bold text-green-600">gcy892</span><br />
                转账后 <strong>30秒内</strong> 为您开通订阅权限
              </p>
            </div>

            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 justify-center mb-4">
              <div className="text-center">
                <div className="relative mx-auto rounded-lg overflow-hidden border-2 border-green-200 w-28">
                  <WechatQRCode />
                </div>
                <p className="text-xs text-muted-foreground mt-2">👆 长按识别</p>
              </div>

              <div className="flex flex-col items-center gap-2">
                <button
                  onClick={openWechat}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-medium transition-all"
                  style={{ backgroundColor: "#07C160", color: "#fff" }}
                >
                  <ExternalLink className="h-4 w-4" />
                  一键跳转微信
                </button>
                <button
                  onClick={copyWechat}
                  className="flex items-center gap-1 text-xs text-purple-600 hover:text-purple-800"
                >
                  <Copy className="h-3 w-3" />
                  {copied ? "已复制" : "复制微信号 gcy892"}
                </button>

                <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm mt-1">
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 微信支付
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 支付宝
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 银行卡转账
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-green-500">✓</span> 7天退款保障
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 行动号召 */}
      {!subscription && (
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-2xl p-8 shadow-premium">
            <h3 className="text-xl font-bold mb-2">别再观望了</h3>
            <p className="text-white/80 mb-4">
              每天不到1块钱，获取一个有结果的项目库。<br />
              别人已经在路上了，你还要等多久？
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90 btn-rounded shadow-lg"
              onClick={() => {
                if (!user) router.push("/login?redirect=/pricing")
                else handleSubscribe("创业者")
              }}
            >
              立即开始 <ArrowRight className="h-4 w-4 ml-1" />
            </Button>
          </div>
        </div>
      )}

      {/* 追加微信兜底卡片 */}
      <div className="max-w-md mx-auto text-center mb-12">
        <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6">
          <p className="text-sm text-green-700 mb-2">
            💬 不想马上付费？先加微信看看
          </p>
          <p className="text-xs text-green-600/70 mb-3">
            免费领2个项目方案，觉得靠谱再决定
          </p>
          <div className="bg-white rounded-xl p-3 border border-green-100 inline-block mb-3">
            <p className="text-xs text-muted-foreground mb-1">客服微信号</p>
            <p className="font-mono font-bold text-lg text-green-600">gcy892</p>
          </div>
          <div className="flex items-center justify-center gap-2">
            <button
              onClick={openWechat}
              className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all"
              style={{ backgroundColor: "#07C160", color: "#fff" }}
            >
              <ExternalLink className="h-4 w-4" />
              一键跳转微信
            </button>
            <button
              onClick={copyWechat}
              className="flex items-center gap-1 px-4 py-2 rounded-full text-xs text-green-700 bg-white border border-green-200 hover:bg-green-50 transition-colors"
            >
              <Copy className="h-3 w-3" />
              {copied ? "已复制" : "复制微信号"}
            </button>
          </div>
          <p className="text-xs text-green-600/70 mt-3">
            随时可删，零压力
          </p>
        </div>
      </div>

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="heading-lg text-2xl text-center mb-8">常见问题</h2>
        <div className="space-y-3">
          {FAQ.map((item, i) => (
            <details key={i} className="group border rounded-xl p-4 cursor-pointer hover:border-primary/30 transition-colors">
              <summary className="font-medium text-sm flex items-center justify-between gap-2">
                {item.q}
                <svg className="h-4 w-4 shrink-0 transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </summary>
              <p className="text-sm text-muted-foreground mt-2 pl-1">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function PricingPage() {
  return <PricingContent />
}
