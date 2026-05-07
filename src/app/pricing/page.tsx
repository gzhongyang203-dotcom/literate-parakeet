"use client"

import { Check, Zap, Sparkles, Crown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

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
      { text: "最新项目优先查看", included: false },
      { text: "完整执行指南 + 模板", included: false },
      { text: "AI 创业助手咨询", included: false },
      { text: "私密创业者社群", included: false },
      { text: "源码/文档模板下载", included: false },
    ],
    cta: "免费注册",
    href: "/login?tab=register",
  },
  {
    name: "创业者",
    icon: Sparkles,
    price: "29",
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
      { text: "AI 创业助手咨询", included: true },
      { text: "私密创业者社群", included: false },
      { text: "源码/文档模板下载", included: false },
    ],
    cta: "立即订阅",
    href: "/login?tab=register",
  },
  {
    name: "合伙人",
    icon: Crown,
    price: "89",
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
      { text: "AI 创业助手（无限次）", included: true },
      { text: "私密创业者社群", included: true },
      { text: "源码/文档模板下载", included: true },
    ],
    cta: "立即订阅",
    href: "/login?tab=register",
  },
]

const FAQ = [
  { q: "订阅后可以退款吗？", a: "7天内无条件退款，直接联系客服即可。" },
  { q: "免费版会一直免费吗？", a: "是的，老项目永远免费。最新项目会对订阅用户开放。" },
  { q: "AI创业助手是什么？", a: "内置的智能问答系统，可以咨询创业方向、项目建议、工具推荐。" },
  { q: "支付方式有哪些？", a: "支持微信支付和支付宝，通过 Lemon Squeezy 安全处理。" },
]

export default function PricingPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      {/* Header */}
      <div className="text-center mb-12">
        <Badge variant="secondary" className="mb-4">订阅方案</Badge>
        <h1 className="text-3xl md:text-4xl font-bold mb-4">选择适合你的方案</h1>
        <p className="text-muted-foreground max-w-md mx-auto">
          所有老项目永久免费。新项目 + 深度内容仅对订阅用户开放。
        </p>
      </div>

      {/* Plans */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto mb-16">
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

            <Link href={plan.href}>
              <Button
                className="w-full mb-6"
                variant={plan.popular ? "default" : "outline"}
              >
                {plan.cta}
              </Button>
            </Link>

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
