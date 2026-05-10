"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  MessageCircle,
  Zap,
  Shield,
  Users,
  ArrowRight,
  CheckCircle,
  Smartphone,
  Bot,
  Rocket,
  Star,
  Flame,
} from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function WechatBotPage() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkUser = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      setUser(user)
      setLoading(false)
    }
    checkUser()
  }, [])

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600 mx-auto"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-white to-red-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center">
          <Badge className="mb-6 bg-orange-100 text-orange-700 hover:bg-orange-200">
            <Flame className="h-3 w-3 mr-1" />
            创业核心功能
          </Badge>
          
          <h1 className="text-5xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-orange-600 to-red-600 bg-clip-text text-transparent">
            微信Bot
          </h1>
          
          <p className="text-xl md:text-2xl text-gray-600 mb-4 max-w-3xl mx-auto">
            用AI武装你的微信
          </p>
          <p className="text-lg text-gray-500 mb-12 max-w-2xl mx-auto">
            自动回复、智能聊天、24小时在线 — 让你的微信变成赚钱工具
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {user ? (
              <Link href="/admin/wechat-bot">
                <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  <Bot className="h-5 w-5 mr-2" />
                  立即使用
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            ) : (
              <Link href="/login?redirect=/admin/wechat-bot">
                <Button size="lg" className="text-lg px-8 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-700 hover:to-red-700">
                  <Rocket className="h-5 w-5 mr-2" />
                  免费开始
                  <ArrowRight className="h-5 w-5 ml-2" />
                </Button>
              </Link>
            )}
            <Link href="#features">
              <Button size="lg" variant="outline" className="text-lg px-8">
                了解更多
              </Button>
            </Link>
          </div>

          {/* Social Proof */}
          <div className="flex items-center justify-center gap-2 mt-12 text-sm text-gray-500">
            <div className="flex -space-x-2">
              {[1, 2, 3, 4].map((i) => (
                <div
                  key={i}
                  className="w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-red-400 border-2 border-white"
                ></div>
              ))}
            </div>
            <span>已有 <strong className="text-orange-600">500+</strong> 创业者在使用</span>
            <div className="flex items-center gap-1 ml-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <Star key={i} className="h-4 w-4 fill-yellow-400 text-yellow-400" />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">为什么选择微信Bot？</h2>
            <p className="text-xl text-gray-600">不是所有Bot都叫微信Bot</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <Card className="border-orange-100 hover:border-orange-300 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>AI智能回复</CardTitle>
                <CardDescription>
                  基于DeepSeek大模型，理解上下文，回复更自然
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    支持多轮对话
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    自动学习你的风格
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    7×24小时在线
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-100 hover:border-orange-300 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Smartphone className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>微信原生体验</CardTitle>
                <CardDescription>
                  扫码登录，无需下载APP，不占手机内存
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    扫码即可使用
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    支持多开管理
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    消息实时同步
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="border-orange-100 hover:border-orange-300 transition-colors">
              <CardHeader>
                <div className="w-12 h-12 rounded-lg bg-orange-100 flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>安全可控</CardTitle>
                <CardDescription>
                  数据加密存储，随时可断开，不封号
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    API加密传输
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    一键断开连接
                  </li>
                  <li className="flex items-center gap-2 text-sm text-gray-600">
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    合规使用方案
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">3步开始使用</h2>
            <p className="text-xl text-gray-600">简单到不敢相信</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {[
              {
                step: "1",
                title: "扫码登录",
                desc: "用微信扫描二维码，授权登录iLink平台",
              },
              {
                step: "2",
                title: "配置Bot",
                desc: "设置自动回复规则，选择AI模型",
              },
              {
                step: "3",
                title: "开始赚钱",
                desc: "Bot自动回复消息，帮你成交客户",
              },
            ].map((item, i) => (
              <div key={i} className="text-center">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-red-500 text-white text-2xl font-bold flex items-center justify-center mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-xl font-semibold mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-orange-600 to-red-600 text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-4">准备好开始了嘛？</h2>
          <p className="text-xl mb-8 opacity-90">
            免费试用，无信用卡要求
          </p>
          {user ? (
            <Link href="/admin/wechat-bot">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <Bot className="h-5 w-5 mr-2" />
                进入控制台
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          ) : (
            <Link href="/login?redirect=/admin/wechat-bot">
              <Button size="lg" variant="secondary" className="text-lg px-8">
                <Rocket className="h-5 w-5 mr-2" />
                免费注册
                <ArrowRight className="h-5 w-5 ml-2" />
              </Button>
            </Link>
          )}
        </div>
      </section>
    </div>
  )
}
