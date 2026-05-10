"use client"

import { Check, Zap, Sparkles, Crown, Loader2, AlertTriangle, TrendingUp, Clock, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"

const PLANS = [
  {
    name: "免费版",
    icon: Zap,
    price: "0",
    description: "浏览基本项目库，了解创业方向",
    color: "border-gray-200",
    iconBg: "bg-gray-100",
    iconColor: "text-gray-600",
    popular: false,
    features: [
      { text: "浏览所有公开项目", included: true },
      { text: "社区讨论参与", included: true },
      { text: "基础协作功能", included: true },
      { text: "AI 创业雷达（每天5次查询）", included: true },
      { text: "最新项目优先查看", included: false },
      { text: "完整执行指南 + 模板", included: false },
      { text: "私密创业者社群", included: false },
      { text: "源码/文档模板下载", included: false },
    ],
    cta: "免费注册",
    href: "/login?tab=register",
    action: null,
  },
  {
    name: "创业者",
    icon: Sparkles,
    price: "29",
    planKey: "创业者",
    description: "获取完整项目方案，跟步骤落地执行",
    color: "border-purple-300 ring-2 ring-purple-200",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
    popular: true,
    features: [
      { text: "浏览所有公开项目", included: true },
      { text: "社区讨论参与", included: true },
      { text: "协作匹配功能", included: true },
      { text: "最新项目优先查看", included: true },
      { text: "完整执行指南 + 模板", included: true },
      { text: "AI 创业雷达（无限次查询）", included: true },
      { text: "一对一创业指导", included: false },
      { text: "行业内部群", included: false },
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
    description: "私密社群 + 1对1指导，快速跑通项目",
    color: "border-amber-300",
    iconBg: "bg-amber-100",
    iconColor: "text-amber-600",
    popular: false,
    features: [
      { text: "浏览所有公开项目", included: true },
      { text: "社区讨论参与", included: true },
      { text: "协作匹配功能", included: true },
      { text: "最新项目优先查看", included: true },
      { text: "完整执行指南 + 模板", included: true },
      { text: "AI 创业雷达（无限次查询）", included: true },
      { text: "一对一创业指导", included: true },
      { text: "行业内部群", included: true },
      { text: "私密创业者社群", included: true },
      { text: "源码/文档模板下载", included: true },
    ],
    cta: "立即订阅",
    action: "subscribe",
  },
]

const FAQ = [
  { q: "订阅后可以退款吗？", a: "7天内无条件退款，直接联系客服即可。" },
  { q: "免费版会一直免费吗？", a: "是的，免费版永久免费，每天可AI查询5次。升级付费版可获得无限次查询 + 行业内部群 + 一对一指导。" },
  { q: "AI创业雷达是什么？", a: "接入DeepSeek大模型的智能助手，实时分析全网最新创业项目、副业赛道和商业机会，给你具体可落地的建议。免费版每天5次，付费版无限次。" },
  { q: "行业内部群是什么？", a: "按行业细分的小群，群内有行业导师定期分享最新动态和实战经验，帮助你快速找到适合自己的赛道。" },
  { q: "一对一指导是什么？", a: "合伙人套餐专属服务，可以获得针对你个人情况的创业方向诊断和落地指导。" },
  { q: "支付方式有哪些？", a: "支持微信支付、支付宝、银行卡，通过微信转账给客服即可开通。" },
  { q: "如何订阅？", a: "点击下方「立即订阅」，然后添加客服微信好友后转账即可秒开订阅。" },
]

// 统计数据（模糊表述）
const STATS = [
  { icon: Users, value: "陆续加入", label: "创业者", color: "text-green-600" },
  { icon: TrendingUp, value: "稳步提升", label: "项目成功率", color: "text-blue-600" },
  { icon: Clock, value: "快速启动", label: "平均启动周期", color: "text-purple-600" },
]

// 焦虑文案
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
    <div className="container mx-auto px-4 py-12">
      {/* 焦虑文案区 */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="bg-gradient-to-r from-red-50 to-orange-50 border border-red-100 rounded-2xl p-6 mb-8">
          <div className="flex items-center gap-2 mb-4">
            <AlertTriangle className="h-5 w-5 text-red-500" />
            <span className="font-bold text-red-600">你可能正在犯的错</span>
          </div>
          <div className="grid md:grid-cols-3 gap-4">
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

      {/* 统计数据 */}
      <div className="max-w-3xl mx-auto mb-12">
        <div className="grid grid-cols-3 gap-4">
          {STATS.map((stat, i) => (
            <div key={i} className="text-center p-4 bg-muted/50 rounded-xl">
              <stat.icon className={`h-5 w-5 mx-auto mb-2 ${stat.color}`} />
              <div className="text-2xl font-bold">{stat.value}</div>
              <div className="text-xs text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">订阅方案</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">选择适合你的方案</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          所有老项目永久免费。新项目 + 深度内容仅对订阅用户开放。
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
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-8">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl border-2 ${plan.color} bg-white p-8 flex flex-col`}
          >
            {plan.popular && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white border-0 px-4 py-1">
                  最受欢迎
                </Badge>
              </div>
            )}

            <div className="flex items-center gap-3 mb-4">
              <div className={`w-10 h-10 rounded-xl ${plan.iconBg} flex items-center justify-center`}>
                <plan.icon className={`h-5 w-5 ${plan.iconColor}`} />
              </div>
              <h3 className="text-xl font-bold">{plan.name}</h3>
            </div>

            <p className="text-sm text-muted-foreground mb-4">{plan.description}</p>

            <div className="mb-6">
              <span className="text-4xl font-bold">¥{plan.price}</span>
              <span className="text-muted-foreground">/月</span>
            </div>

            {plan.action === null ? (
              <Link href={plan.href}>
                <Button
                  className="w-full mb-6"
                  variant={plan.popular ? "default" : "outline"}
                >
                  {plan.cta}
                </Button>
              </Link>
            ) : subscription ? (
              <Button
                className="w-full mb-6"
                variant="outline"
                disabled
              >
                已订阅
              </Button>
            ) : (
              <Button
                className="w-full mb-6"
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

            <ul className="space-y-2.5 flex-1">
              {plan.features.map((feat, i) => (
                <li key={i} className="flex items-center gap-2.5">
                  <Check
                    className={`h-4 w-4 shrink-0 ${
                      feat.included ? "text-green-500" : "text-gray-300"
                    }`}
                  />
                  <span
                    className={`text-sm ${
                      feat.included ? "text-foreground" : "text-muted-foreground"
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

      {/* 客服订阅说明 */}
      {!subscription && (
        <div className="max-w-2xl mx-auto mb-12">
          <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-2xl p-6 text-center">
            <div className="text-3xl mb-3">💬</div>
            <h3 className="font-bold text-lg mb-2">如何订阅？</h3>
            <p className="text-sm text-muted-foreground mb-4">
              点击上方「立即订阅」，然后<strong>添加客服微信 13785108266</strong><br />
              转账后 <strong>30秒内</strong> 为您开通订阅权限
            </p>
            <div className="flex flex-wrap justify-center gap-3 text-sm">
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border">
                <span className="text-green-500">✓</span> 微信支付
              </div>
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border">
                <span className="text-green-500">✓</span> 支付宝
              </div>
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border">
                <span className="text-green-500">✓</span> 银行卡转账
              </div>
              <div className="flex items-center gap-1.5 bg-white rounded-full px-3 py-1.5 border">
                <span className="text-green-500">✓</span> 7天退款保障
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 行动号召 */}
      {!subscription && (
        <div className="max-w-2xl mx-auto text-center mb-12">
          <div className="bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-2xl p-8">
            <h3 className="text-xl font-bold mb-2">别再观望了</h3>
            <p className="text-white/80 mb-4">
              每天不到1块钱，获取一个有结果的项目库。<br />
              别人已经在路上了，你还要等多久？
            </p>
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-white/90"
              onClick={() => {
                if (!user) router.push("/login?redirect=/pricing")
                else handleSubscribe("创业者")
              }}
            >
              立即开始 →
            </Button>
          </div>
        </div>
      )}

      {/* FAQ */}
      <div className="max-w-2xl mx-auto">
        <h2 className="text-2xl font-bold text-center mb-8">常见问题</h2>
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
