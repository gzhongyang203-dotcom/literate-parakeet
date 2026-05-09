"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Sparkles, ArrowRight, RefreshCw, Target, Clock, Wallet } from "lucide-react"
import Link from "next/link"

const QUESTIONS = [
  {
    key: "budget",
    question: "你的启动预算是多少？",
    icon: Wallet,
    options: [
      { label: "零成本", value: "0" },
      { label: "100-500元", value: "500" },
      { label: "500-2000元", value: "2000" },
      { label: "2000元以上", value: "9999" },
    ],
  },
  {
    key: "time",
    question: "每天能投入多少时间？",
    icon: Clock,
    options: [
      { label: "碎片时间（<1小时）", value: "1" },
      { label: "1-3小时", value: "3" },
      { label: "3小时以上", value: "8" },
    ],
  },
  {
    key: "skill",
    question: "你更擅长什么？",
    icon: Target,
    options: [
      { label: "文案写作", value: "writing" },
      { label: "设计/视觉", value: "design" },
      { label: "技术/开发", value: "tech" },
      { label: "销售/沟通", value: "sales" },
      { label: "以上都一般", value: "none" },
    ],
  },
]

const MATCH_RESULTS: Record<string, Array<{ id: string; title: string; hook: string; match: string }>> = {
  "0-1-writing": [
    { id: "1", title: "闲鱼AI代写服务", hook: "用AI帮人写文案，0成本启动", match: "预算匹配 100%" },
    { id: "9", title: "无脸知识短视频", hook: "做知识科普视频积累粉丝", match: "技能匹配 90%" },
  ],
  "0-1-design": [
    { id: "2", title: "小红书AI壁纸号", hook: "AI生成壁纸发小红书变现", match: "技能匹配 95%" },
    { id: "5", title: "AI表情包IP打造", hook: "制作表情包靠打赏变现", match: "预算匹配 100%" },
  ],
  "0-1-tech": [
    { id: "3", title: "情侣情绪价值小程序", hook: "微信小程序+知识付费", match: "技能匹配 90%" },
    { id: "12", title: "AI Agent企业服务", hook: "帮企业搭AI客服收月费", match: "收入潜力最高" },
  ],
  "0-1-sales": [
    { id: "6", title: "拼多多虚拟资料店", hook: "卖电子书/模板零成本高利润", match: "预算匹配 100%" },
    { id: "10", title: "闲鱼数码转卖", hook: "低买高卖二手数码赚差价", match: "销售导向 85%" },
  ],
  "0-3-writing": [
    { id: "1", title: "闲鱼AI代写服务", hook: "规模化接单，月入3000+", match: "时间充裕 95%" },
    { id: "11", title: "小红书好物测评", hook: "产品测评接广告佣金", match: "内容创作 90%" },
  ],
  "0-3-design": [
    { id: "2", title: "小红书AI壁纸号", hook: "矩阵号操作更快起量", match: "技能匹配 95%" },
    { id: "7", title: "AI+POD按需打印", hook: "T恤/帆布包设计变现", match: "设计变现 90%" },
  ],
  "default": [
    { id: "1", title: "闲鱼AI代写服务", hook: "最适合零基础入门", match: "入门首选" },
    { id: "6", title: "拼多多虚拟资料店", hook: "零成本高利润", match: "低门槛" },
    { id: "9", title: "无脸知识短视频", hook: "不需要出镜", match: "适合内向" },
  ],
}

export function SmartRecommendation() {
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [results, setResults] = useState<Array<{ id: string; title: string; hook: string; match: string }> | null>(null)

  const handleAnswer = (value: string) => {
    const q = QUESTIONS[step]
    const newAnswers = { ...answers, [q.key]: value }
    setAnswers(newAnswers)

    if (step < QUESTIONS.length - 1) {
      setStep(step + 1)
    } else {
      // Match results
      const key = `${newAnswers.budget}-${newAnswers.time}-${newAnswers.skill}`
      const matched = MATCH_RESULTS[key] || MATCH_RESULTS["default"]
      setResults(matched)
    }
  }

  const reset = () => {
    setStep(0)
    setAnswers({})
    setResults(null)
  }

  return (
    <Card className="border-2 border-purple-100 bg-gradient-to-br from-purple-50/50 via-white to-pink-50/50">
      <CardContent className="p-6">
        {!results ? (
          <>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">不知道做什么项目？</h3>
                <p className="text-xs text-muted-foreground">回答3个问题，AI帮你推荐</p>
              </div>
            </div>

            {/* Step indicator */}
            <div className="flex gap-1 mb-4">
              {QUESTIONS.map((_, i) => (
                <div
                  key={i}
                  className={`h-1 flex-1 rounded-full transition-colors ${
                    i < step ? "bg-primary" : i === step ? "bg-primary/60" : "bg-muted"
                  }`}
                />
              ))}
            </div>

            {/* Current question */}
            {(() => {
              const Q = QUESTIONS[step]
              const Icon = Q.icon
              return (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm font-medium">{Q.question}</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {Q.options.map((opt) => (
                  <Badge
                    key={opt.value}
                    variant="outline"
                    className="cursor-pointer hover:bg-primary hover:text-primary-foreground hover:border-primary transition-all px-3 py-2 text-sm"
                    onClick={() => handleAnswer(opt.value)}
                  >
                    {opt.label}
                  </Badge>
                ))}
              </div>
            </div>
              )
            })()}
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="font-semibold text-sm">为你推荐 {results.length} 个项目</span>
              </div>
              <Button variant="ghost" size="sm" onClick={reset} className="gap-1 text-xs">
                <RefreshCw className="h-3 w-3" /> 重新推荐
              </Button>
            </div>

            <div className="space-y-2 mb-4">
              {results.map((item) => (
                <Link key={item.id} href={`/projects/${item.id}`}>
                  <div className="flex items-start justify-between p-3 rounded-lg border hover:border-primary/40 hover:bg-primary/5 transition-all cursor-pointer">
                    <div className="min-w-0">
                      <p className="text-sm font-medium">{item.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5">{item.hook}</p>
                    </div>
                    <Badge variant="secondary" className="text-[10px] shrink-0 ml-2">
                      {item.match}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>

            <Link href="/projects" className="text-xs text-primary hover:underline flex items-center gap-1">
              浏览全部项目 <ArrowRight className="h-3 w-3" />
            </Link>
          </>
        )}
      </CardContent>
    </Card>
  )
}
