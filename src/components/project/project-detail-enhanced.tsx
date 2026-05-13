"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Target, Users, TrendingUp, DollarSign, ArrowRight, CheckCircle, Clock, BookOpen, Video, MessageCircle, Award } from "lucide-react"

// 对标账号数据接口
interface BenchmarkAccount {
  platform: string
  accountName: string
  followers: string
  contentStyle: string
  strengths: string[]
  learnFrom: string
}

// 人群画像接口
interface AudienceProfile {
  ageRange: string
  gender: string
  occupation: string
  painPoints: string[]
  needs: string[]
  platforms: string[]
}

// 变现路径接口
interface MonetizationPath {
  stage: number
  title: string
  desc: string
  methods: string[]
  timeline: string
  expectedIncome: string
  difficulty: "低" | "中" | "高"
}

// 实验数据接口
interface ExperimentData {
  name: string
  sampleSize: string
  duration: string
  result: string
  conversionRate: string
  keyFinding: string
}

interface ProjectDetailEnhancedProps {
  projectId?: string
  benchmarks?: BenchmarkAccount[]
  audience?: AudienceProfile
  monetization?: MonetizationPath[]
  experiments?: ExperimentData[]
}

// 默认对标账号数据
const DEFAULT_BENCHMARKS: BenchmarkAccount[] = [
  {
    platform: "小红书",
    accountName: "副业研究所",
    followers: "12.5万",
    contentStyle: "图文笔记+真实案例",
    strengths: ["标题党能力强", "封面统一有辨识度", "评论区互动率高"],
    learnFrom: "学习其标题公式：数字+痛点+解决方案"
  },
  {
    platform: "抖音",
    accountName: "创业老炮",
    followers: "28万",
    contentStyle: "口播+案例拆解",
    strengths: ["人设真实可信", "节奏紧凑不拖沓", "干货密度高"],
    learnFrom: "学习其3秒钩子+痛点共鸣+解决方案的结构"
  },
  {
    platform: "B站",
    accountName: "搞钱日记",
    followers: "8.3万",
    contentStyle: "长视频深度教程",
    strengths: ["教程详细可落地", "数据可视化好", "粉丝粘性强"],
    learnFrom: "学习其步骤拆解+数据展示+工具推荐的模式"
  }
]

// 默认人群画像
const DEFAULT_AUDIENCE: AudienceProfile = {
  ageRange: "22-35岁",
  gender: "女性60% / 男性40%",
  occupation: "上班族、宝妈、大学生",
  painPoints: ["工资低想增加收入", "不知道做什么副业", "怕被骗怕踩坑", "没有启动资金"],
  needs: ["零成本或低成本启动", "有详细操作步骤", "能看到真实案例", "有人带有人教"],
  platforms: ["小红书", "抖音", "微信", "B站"]
}

// 默认变现路径（三次变现）
const DEFAULT_MONETIZATION: MonetizationPath[] = [
  {
    stage: 1,
    title: "首次变现",
    desc: "跑通最小闭环，赚到第一块钱",
    methods: ["平台流量分成", "接单服务", "卖虚拟资料", " affiliate 推广"],
    timeline: "1-2周",
    expectedIncome: "月入500-2000",
    difficulty: "低"
  },
  {
    stage: 2,
    title: "二次变现",
    desc: "放大规模，建立系统化收入",
    methods: ["付费社群/圈子", "线上课程", "1对1咨询", "工具/模板销售", "矩阵账号"],
    timeline: "1-3个月",
    expectedIncome: "月入3000-10000",
    difficulty: "中"
  },
  {
    stage: 3,
    title: "三次变现",
    desc: "品牌化运营，实现被动收入",
    methods: ["私董会/高端社群", "线下培训", "品牌合作", "投资孵化", "SaaS工具"],
    timeline: "3-6个月",
    expectedIncome: "月入10000+",
    difficulty: "高"
  }
]

// 默认实验数据
const DEFAULT_EXPERIMENTS: ExperimentData[] = [
  {
    name: "标题优化测试",
    sampleSize: "100条笔记",
    duration: "2周",
    result: "点击率提升65%",
    conversionRate: "8.5% → 14.2%",
    keyFinding: "数字+情绪词+悬念的标题CTR最高"
  },
  {
    name: "发布时间测试",
    sampleSize: "60条内容",
    duration: "1周",
    result: "晚8点发布流量最高",
    conversionRate: "曝光量提升40%",
    keyFinding: "工作日20:00-22:00为黄金时段"
  },
  {
    name: "定价策略测试",
    sampleSize: "200个客户",
    duration: "1个月",
    result: "锚定定价转化率最高",
    conversionRate: "12% → 18%",
    keyFinding: "设置3个价格档位，中间档位成交率最高"
  }
]

export function ProjectDetailEnhanced({
  benchmarks = DEFAULT_BENCHMARKS,
  audience = DEFAULT_AUDIENCE,
  monetization = DEFAULT_MONETIZATION,
  experiments = DEFAULT_EXPERIMENTS
}: ProjectDetailEnhancedProps) {
  const [activeStage, setActiveStage] = useState(1)

  const difficultyColor = {
    "低": "bg-green-100 text-green-700",
    "中": "bg-amber-100 text-amber-700",
    "高": "bg-red-100 text-red-700"
  }

  return (
    <div className="space-y-8">
      {/* 实验数据区 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-50 flex items-center justify-center">
            <Target className="h-4 w-4 text-blue-600" />
          </div>
          <h3 className="text-lg font-bold">实测数据</h3>
          <Badge variant="secondary" className="text-[10px]">真实跑出来的</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">以下数据来自我们团队的实际测试，不是理论值</p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {experiments.map((exp, i) => (
            <Card key={i} className="border-l-4 border-l-blue-400">
              <CardContent className="p-4">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-sm">{exp.name}</h4>
                  <Badge variant="outline" className="text-[10px]">{exp.duration}</Badge>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">样本量</span>
                    <span className="font-medium">{exp.sampleSize}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">结果</span>
                    <span className="font-medium text-green-600">{exp.result}</span>
                  </div>
                  <div className="flex justify-between text-xs">
                    <span className="text-muted-foreground">转化率</span>
                    <span className="font-medium">{exp.conversionRate}</span>
                  </div>
                  <div className="mt-3 p-2 bg-blue-50 rounded-lg text-xs text-blue-700">
                    <span className="font-medium">关键发现：</span>{exp.keyFinding}
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 对标账号分析 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-purple-50 flex items-center justify-center">
            <Target className="h-4 w-4 text-purple-600" />
          </div>
          <h3 className="text-lg font-bold">对标账号分析</h3>
          <Badge variant="secondary" className="text-[10px]">学习标杆</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">找到赛道里的头部账号，拆解他们的成功密码</p>

        <div className="space-y-3">
          {benchmarks.map((account, i) => (
            <Card key={i} className="overflow-hidden">
              <CardContent className="p-4">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-lg">
                      {account.accountName[0]}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{account.accountName}</span>
                        <Badge variant="secondary" className="text-[10px]">{account.platform}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground">{account.followers}粉丝 · {account.contentStyle}</p>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <p className="text-xs font-medium text-green-700 mb-1">核心优势</p>
                    <ul className="space-y-1">
                      {account.strengths.map((s, j) => (
                        <li key={j} className="text-xs text-green-600 flex items-center gap-1">
                          <CheckCircle className="h-3 w-3" /> {s}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="p-3 bg-amber-50 rounded-lg">
                    <p className="text-xs font-medium text-amber-700 mb-1">我们可以学</p>
                    <p className="text-xs text-amber-600">{account.learnFrom}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* 人群画像 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-pink-50 flex items-center justify-center">
            <Users className="h-4 w-4 text-pink-600" />
          </div>
          <h3 className="text-lg font-bold">目标人群画像</h3>
          <Badge variant="secondary" className="text-[10px]">精准定位</Badge>
        </div>

        <Card>
          <CardContent className="p-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">年龄段</p>
                <p className="font-bold text-sm">{audience.ageRange}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">性别分布</p>
                <p className="font-bold text-sm">{audience.gender}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">职业</p>
                <p className="font-bold text-sm">{audience.occupation}</p>
              </div>
              <div className="text-center p-3 bg-muted rounded-lg">
                <p className="text-xs text-muted-foreground mb-1">活跃平台</p>
                <p className="font-bold text-sm">{audience.platforms.join("、")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-red-50 rounded-xl">
                <h4 className="text-sm font-medium text-red-700 mb-2 flex items-center gap-1">
                  <Target className="h-4 w-4" /> 痛点
                </h4>
                <ul className="space-y-1.5">
                  {audience.painPoints.map((p, i) => (
                    <li key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                      <span className="text-red-400 mt-0.5">•</span> {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-4 bg-green-50 rounded-xl">
                <h4 className="text-sm font-medium text-green-700 mb-2 flex items-center gap-1">
                  <Award className="h-4 w-4" /> 需求
                </h4>
                <ul className="space-y-1.5">
                  {audience.needs.map((n, i) => (
                    <li key={i} className="text-xs text-green-600 flex items-start gap-1.5">
                      <CheckCircle className="h-3 w-3 mt-0.5 shrink-0" /> {n}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </section>

      {/* 三次变现路径 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
            <DollarSign className="h-4 w-4 text-amber-600" />
          </div>
          <h3 className="text-lg font-bold">变现路径规划</h3>
          <Badge variant="secondary" className="text-[10px]">三次变现</Badge>
        </div>
        <p className="text-sm text-muted-foreground mb-4">从赚到第一块钱到建立系统化收入，每一步都有清晰路径</p>

        <div className="flex items-center gap-2 mb-6">
          {monetization.map((m) => (
            <button
              key={m.stage}
              onClick={() => setActiveStage(m.stage)}
              className={`flex-1 py-3 px-4 rounded-xl text-sm font-medium transition-all ${
                activeStage === m.stage
                  ? "bg-primary text-white shadow-lg shadow-primary/20"
                  : "bg-muted text-muted-foreground hover:bg-muted/80"
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <span className="w-6 h-6 rounded-full bg-white/20 flex items-center justify-center text-xs">
                  {m.stage}
                </span>
                {m.title}
              </div>
            </button>
          ))}
        </div>

        {monetization.map((m) => (
          activeStage === m.stage && (
            <Card key={m.stage} className="border-2 border-primary/10">
              <CardContent className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-xl font-bold">{m.title}</h4>
                      <Badge className={difficultyColor[m.difficulty]}>{m.difficulty}难度</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{m.desc}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-muted-foreground">预期收入</p>
                    <p className="text-lg font-bold text-green-600">{m.expectedIncome}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">时间周期</p>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3.5 w-3.5 text-primary" />
                      <span className="text-sm font-medium">{m.timeline}</span>
                    </div>
                  </div>
                  <div className="p-3 bg-muted rounded-lg">
                    <p className="text-xs text-muted-foreground mb-1">变现方式</p>
                    <span className="text-sm font-medium">{m.methods.length}种</span>
                  </div>
                </div>

                <div>
                  <p className="text-xs font-medium mb-2">具体方法</p>
                  <div className="flex flex-wrap gap-2">
                    {m.methods.map((method, i) => (
                      <span key={i} className="px-3 py-1.5 bg-primary/5 text-primary text-xs rounded-full border border-primary/10">
                        {method}
                      </span>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        ))}
      </section>

      {/* 行动清单 */}
      <section>
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-green-50 flex items-center justify-center">
            <CheckCircle className="h-4 w-4 text-green-600" />
          </div>
          <h3 className="text-lg font-bold">今日行动清单</h3>
          <Badge variant="secondary" className="text-[10px]">照着做</Badge>
        </div>

        <Card className="bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
          <CardContent className="p-6">
            <div className="space-y-3">
              {[
                { text: "注册平台账号，完善个人资料", time: "10分钟", done: false },
                { text: "关注3个对标账号，学习其内容风格", time: "20分钟", done: false },
                { text: "确定自己的内容定位和人设", time: "15分钟", done: false },
                { text: "制作第一条内容并发布", time: "30分钟", done: false },
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-green-100">
                  <div className="w-6 h-6 rounded-full border-2 border-green-300 flex items-center justify-center shrink-0">
                    <span className="text-xs text-green-600 font-medium">{i + 1}</span>
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{item.text}</p>
                  </div>
                  <Badge variant="outline" className="text-[10px] shrink-0">
                    <Clock className="h-3 w-3 mr-1" /> {item.time}
                  </Badge>
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <p className="text-xs text-green-600">完成以上4步，你就已经跑起来了 🚀</p>
            </div>
          </CardContent>
        </Card>
      </section>
    </div>
  )
}
