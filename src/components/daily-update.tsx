"use client"

import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, Clock, Calendar } from "lucide-react"

interface UpcomingItem {
  date: string
  day: string
  title: string
  category: string
  teaser: string
}

const UPCOMING: UpcomingItem[] = [
  {
    date: "5月7日",
    day: "明天",
    title: "AI数字人直播带货完整指南",
    category: "AI工具",
    teaser: "用AI克隆自己的声音和形象，24小时直播卖货",
  },
  {
    date: "5月9日",
    day: "周五",
    title: "抖音小程序变现全攻略",
    category: "短视频",
    teaser: "不需要开发技能，套模板就能上线的抖音小程序",
  },
]

export function DailyUpdatePreview() {
  return (
    <section className="py-6">
      <div className="container mx-auto px-4">
        <Card className="border-2 border-amber-100 bg-gradient-to-r from-amber-50/60 via-white to-orange-50/60">
          <CardContent className="p-5 md:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <Calendar className="h-4 w-4 text-amber-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-sm">即将更新</h3>
                  <p className="text-xs text-muted-foreground">新项目预告，保持关注</p>
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
                    <div className="text-lg font-bold text-amber-600">{item.date.split("月")[0]}月</div>
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
                      预计更新
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
