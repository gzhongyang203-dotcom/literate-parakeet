"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import {
  Share2,
  TrendingUp,
  Gift,
  Users,
  DollarSign,
  ShieldCheck,
  ArrowRight,
  Copy,
  CheckCircle,
  Loader2,
} from "lucide-react"

export default function AgentLandingPage() {
  const [user, setUser] = useState<any>(null)
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data } = await supabase.auth.getUser()
      setUser(data.user)
      setLoading(false)
    }
    checkUser()
  }, [])

  const copyInviteLink = async () => {
    // 获取当前用户的邀请码
    if (!user) return
    const supabase = createClient()
    const { data: agent } = await supabase
      .from("agents")
      .select("invite_code")
      .eq("user_id", user.id)
      .single()

    const code = agent?.invite_code || ""
    const link = `${window.location.origin}/register?code=${code}`
    await navigator.clipboard.writeText(link)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const benefits = [
    {
      icon: Share2,
      color: "bg-blue-50 text-blue-600",
      title: "专属推广链接",
      desc: "生成专属邀请链接和二维码，分享到朋友圈、社群、短视频，系统自动追踪归属",
    },
    {
      icon: DollarSign,
      color: "bg-green-50 text-green-600",
      title: "最高50%分佣",
      desc: "下级代理每成交一单，你获得10%-50%的持续分佣。代理越多，收益越稳定",
    },
    {
      icon: TrendingUp,
      color: "bg-purple-50 text-purple-600",
      title: "二级分销体系",
      desc: "你的代理再发展代理，你也能获得收益。搭建属于自己的推广网络",
    },
    {
      icon: ShieldCheck,
      color: "bg-amber-50 text-amber-600",
      title: "透明结算",
      desc: "每笔佣金实时可见，支持一键结算。收益清晰，不拖不欠",
    },
    {
      icon: Users,
      color: "bg-rose-50 text-rose-600",
      title: "团队管理",
      desc: "查看下级代理列表、业绩数据、获客数量，轻松管理你的推广团队",
    },
    {
      icon: Gift,
      color: "bg-indigo-50 text-indigo-600",
      title: "无需成本",
      desc: "零门槛加入，无需押金、无需囤货。只需分享链接，成交即分佣",
    },
  ]

  const steps = [
    { step: "01", title: "免费注册", desc: "30秒注册成为代理，获得专属邀请码" },
    { step: "02", title: "分享推广", desc: "复制邀请链接或二维码，分享给朋友" },
    { step: "03", title: "坐享收益", desc: "下级成交后，自动计算分佣，随时结算" },
  ]

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-purple-50 via-white to-pink-50">
        <div className="container mx-auto px-4 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-1.5 px-4 py-1.5 bg-purple-100 text-purple-700 rounded-full text-sm font-medium mb-6">
              <TrendingUp className="h-4 w-4" />
              零成本创业 · 持续分佣
            </div>
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-6">
              成为<span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">代理推广者</span>
              <br />
              分享即赚钱
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
              无需囤货、无需押金，只需分享你的专属推广链接。
              每成交一单，获得10%-50%持续分佣。
            </p>

            {user ? (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/dashboard/agent">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    进入代理中心 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="gap-2" onClick={copyInviteLink}>
                  {copied ? (
                    <>
                      <CheckCircle className="h-4 w-4 text-green-500" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> 复制推广链接
                    </>
                  )}
                </Button>
              </div>
            ) : (
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link href="/register">
                  <Button size="lg" className="gap-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700">
                    免费注册成为代理 <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
                <Link href="/login">
                  <Button size="lg" variant="outline">
                    已注册？立即登录
                  </Button>
                </Link>
              </div>
            )}

            <p className="text-xs text-muted-foreground mt-4">无需信用卡 · 永久免费加入</p>
          </div>
        </div>

        {/* 装饰性背景 */}
        <div className="absolute top-0 left-0 w-full h-full pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-64 h-64 bg-purple-300 rounded-full blur-3xl" />
          <div className="absolute bottom-10 right-10 w-64 h-64 bg-pink-300 rounded-full blur-3xl" />
        </div>
      </section>

      {/* 三步流程 */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold mb-4">三步开始赚钱</h2>
          <p className="text-muted-foreground">简单三步，开启你的代理推广之旅</p>
        </div>
        <div className="grid md:grid-cols-3 gap-6 max-w-4xl mx-auto">
          {steps.map((s, i) => (
            <div key={s.step} className="relative text-center p-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-purple-100 to-pink-100 flex items-center justify-center">
                <span className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-pink-600">
                  {s.step}
                </span>
              </div>
              <h3 className="text-lg font-bold mb-2">{s.title}</h3>
              <p className="text-sm text-muted-foreground">{s.desc}</p>
              {i < steps.length - 1 && (
                <div className="hidden md:block absolute top-10 -right-3">
                  <ArrowRight className="h-6 w-6 text-purple-300" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* 权益卡片 */}
      <section className="bg-muted/30 py-16 md:py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">代理专属权益</h2>
            <p className="text-muted-foreground">加入代理网络，享受六大核心权益</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {benefits.map((b) => {
              const Icon = b.icon
              return (
                <Card key={b.title} className="border-primary/5 hover:shadow-md transition-shadow">
                  <CardContent className="p-6">
                    <div className={`w-10 h-10 rounded-xl ${b.color} flex items-center justify-center mb-4`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-bold mb-2">{b.title}</h3>
                    <p className="text-sm text-muted-foreground">{b.desc}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>
      </section>

      {/* 收益计算器 */}
      <section className="container mx-auto px-4 py-16 md:py-20">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-10">
            <h2 className="text-3xl font-bold mb-4">你能赚多少？</h2>
            <p className="text-muted-foreground">以推广创业课程为例，看看代理收益</p>
          </div>
          <Card className="border-primary/10 bg-gradient-to-r from-purple-50/50 to-pink-50/50">
            <CardContent className="p-8">
              <div className="grid md:grid-cols-3 gap-6 text-center">
                <div className="p-4 rounded-xl bg-white/60">
                  <p className="text-sm text-muted-foreground mb-2">每月推广注册</p>
                  <p className="text-3xl font-bold text-purple-600">10人</p>
                  <p className="text-xs text-muted-foreground mt-1">月均稳定获取</p>
                </div>
                <div className="p-4 rounded-xl bg-white/60">
                  <p className="text-sm text-muted-foreground mb-2">转化付费用户</p>
                  <p className="text-3xl font-bold text-pink-600">3人</p>
                  <p className="text-xs text-muted-foreground mt-1">30%转化率</p>
                </div>
                <div className="p-4 rounded-xl bg-white/60">
                  <p className="text-sm text-muted-foreground mb-2">月度分佣预估</p>
                  <p className="text-3xl font-bold text-green-600">¥897</p>
                  <p className="text-xs text-muted-foreground mt-1">30%分佣比例</p>
                </div>
              </div>
              <div className="mt-6 p-4 bg-white rounded-xl text-center">
                <p className="text-sm text-muted-foreground">
                  假设每位付费用户消费 ¥997/年，你的30%分佣 =
                  <strong className="text-green-600"> ¥299.1/人</strong>
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  代理越多、转化越高，收益无上限
                </p>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* 底部 CTA */}
      <section className="bg-gradient-to-r from-purple-600 to-pink-600 py-16 md:py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            准备好开始赚钱了吗？
          </h2>
          <p className="text-purple-100 mb-8 max-w-md mx-auto">
            零成本、零风险，今天注册明天就有收益
          </p>
          {user ? (
            <Link href="/dashboard/agent">
              <Button size="lg" variant="secondary" className="gap-2">
                进入代理管理中心 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          ) : (
            <Link href="/register">
              <Button size="lg" variant="secondary" className="gap-2 text-purple-700">
                免费注册成为代理 <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
