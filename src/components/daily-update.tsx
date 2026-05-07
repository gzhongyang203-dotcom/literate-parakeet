"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Clock, Calendar, ArrowRight, CheckCircle, Zap, Users } from "lucide-react"
import Link from "next/link"

interface UpcomingItem {
  date: string
  day: string
  title: string
  category: string
  teaser: string
}

const UPCOMING: UpcomingItem[] = [
  {
    date: "5月10日",
    day: "3天后",
    title: "抖音流量池机制深度解析",
    category: "短视频",
    teaser: "9层流量池晋级逻辑、算法推荐核心公式",
  },
  {
    date: "5月13日",
    day: "6天后",
    title: "快手老铁经济变现路径",
    category: "短视频",
    teaser: "从0粉到月入过万的完整闭环",
  },
]

// 深度钩子文案
const HOOKS = [
  {
    icon: "💭",
    text: "刷了3年抖音，你还在给平台打工？",
  },
  {
    icon: "🎯",
    text: "别人一个视频爆了10万粉，你发了100个为什么还是0播放？",
  },
  {
    icon: "💰",
    text: "知道很多道理，却还是赚不到钱——因为你缺的不是认知，是可复制的项目",
  },
]

export function DailyUpdatePreview() {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        {/* 深度钩子区 */}
        <div className="mb-6">
          <div className="bg-gradient-to-r from-slate-900 via-purple-900 to-slate-900 rounded-2xl p-6 md:p-8 relative overflow-hidden">
            {/* 背景装饰 */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500 rounded-full blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500 rounded-full blur-3xl" />
            </div>

            <div className="relative z-10">
              <div className="flex items-center gap-2 mb-4">
                <Badge variant="outline" className="bg-white/10 text-white border-white/20">
                  <Zap className="h-3 w-3 mr-1" /> 认知升级
                </Badge>
                <span className="text-white/60 text-sm">3天更新一个最新项目</span>
              </div>

              {/* 钩子文案 */}
              <div className="space-y-3 mb-6">
                {HOOKS.map((hook, i) => (
                  <div key={i} className="flex items-start gap-3 text-white/90">
                    <span className="text-xl shrink-0">{hook.icon}</span>
                    <p className="text-sm md:text-base leading-relaxed">{hook.text}</p>
                  </div>
                ))}
              </div>

              {/* 解决方案 */}
              <div className="bg-white/10 rounded-xl p-4 mb-5">
                <p className="text-white font-medium mb-2">🎯 这里有什么：</p>
                <ul className="text-white/80 text-sm space-y-1.5">
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    抖音/快手流量算法机制深度拆解
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    爆款视频底层规律（实测有效）
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle className="h-4 w-4 text-green-400 shrink-0" />
                    国内外工具对比（合规版本）
                  </li>
                </ul>
              </div>

              {/* CTA */}
              <div className="flex flex-col sm:flex-row gap-3">
                <Link href="/pricing" className="flex-1">
                  <button className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white font-semibold py-3 px-5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/25">
                    <Users className="h-4 w-4" />
                    订阅获取全部项目
                    <ArrowRight className="h-4 w-4" />
                  </button>
                </Link>
                <Link href="/projects" className="flex-1">
                  <button className="w-full bg-white/10 hover:bg-white/20 text-white font-medium py-3 px-5 rounded-xl transition-all border border-white/20">
                    先看看免费项目 →
                  </button>
                </Link>
              </div>

              {/* 数据证明 */}
              <div className="flex items-center justify-center gap-6 mt-5 text-white/60 text-xs">
                <span>👥 2879+ 创业者</span>
                <span>•</span>
                <span>📊 96% 成功率</span>
                <span>•</span>
                <span>⏰ 3天/项目</span>
              </div>
            </div>
          </div>
        </div>

        {/* 即将更新 */}
        <Card className="border-2 border-amber-100 bg-gradient-to-r from-amber-50/60 via-white to-orange-50/60">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">即将更新</h3>
                  <p className="text-xs text-muted-foreground">每3天更新一个新项目</p>
                </div>
              </div>
              <Badge variant="outline" className="gap-1 text-amber-600 border-amber-200">
                <Sparkles className="h-3 w-3" /> 抢先看
              </Badge>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {UPCOMING.map((item) => (
                <div
                  key={item.date}
                  className="flex items-start gap-3 p-3 rounded-lg bg-white/80 border hover:border-amber-200 transition-all cursor-pointer group"
                >
                  <div className="shrink-0 text-center min-w-[48px]">
                    <div className="text-sm font-bold text-amber-600">{item.date.split("月")[0]}月</div>
                    <div className="text-2xl font-bold leading-none">{item.date.split("月")[1]?.replace("日", "")}</div>
                    <Badge variant="secondary" className="text-[10px] mt-1 px-1.5">
                      {item.day}
                    </Badge>
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="text-sm font-medium group-hover:text-primary transition-colors">{item.title}</span>
                      <Badge variant="outline" className="text-[10px]">{item.category}</Badge>
                    </div>
                    <p className="text-xs text-muted-foreground">{item.teaser}</p>
                    <div className="flex items-center gap-1 mt-1.5 text-[10px] text-amber-600">
                      <Clock className="h-3 w-3" />
                      订阅用户优先获取
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  )
}
