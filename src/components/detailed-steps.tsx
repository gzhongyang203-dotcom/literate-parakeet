"use client"

import { useState } from "react"
import { Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface Step {
  id: string
  phase: "准备" | "执行" | "优化" | "变现"
  title: string
  desc: string
  time: string
  tips?: string[]
  example?: string
  checked?: boolean
}

interface DetailedStepsProps {
  projectId?: string
  defaultSteps?: Step[]
}

// 默认详细步骤（以闲鱼项目为例）
const DEFAULT_STEPS: Step[] = [
  {
    id: "s1",
    phase: "准备",
    title: "注册闲鱼账号",
    desc: "下载闲鱼App，使用支付宝登录，完成实名认证",
    time: "10分钟",
    tips: [
      "使用芝麻信用650+的支付宝账号",
      "完善个人资料，头像清晰、昵称好记",
      "填写个人简介，突出专业领域",
    ],
    example: "昵称示例：数码好物精选 / 家居生活馆",
  },
  {
    id: "s2",
    phase: "准备",
    title: "账号养号（提升权重）",
    desc: "新账号需要7天养号期，提升权重后才能获得更多曝光",
    time: "7天",
    tips: [
      "第1-3天：每天浏览30分钟，点赞10个，收藏5个",
      "第4-5天：开始评论，学习同行话术",
      "第6-7天：可以下单一个小商品增加权重",
    ],
    example: "养号期间多浏览同类商品，了解市场需求",
  },
  {
    id: "s3",
    phase: "准备",
    title: "确定选品方向",
    desc: "根据自己熟悉的领域或兴趣选择主攻品类",
    time: "30分钟",
    tips: [
      "推荐品类：数码配件、家居好物、美妆工具",
      "分析目标用户群体和需求痛点",
      "参考闲鱼热搜榜单确定方向",
    ],
    example: "数据线、充电宝、手机壳（利润30-50%）",
  },
  {
    id: "s4",
    phase: "准备",
    title: "找供货渠道",
    desc: "确定从哪里拿货，初期建议一件代发模式",
    time: "1小时",
    tips: [
      "推荐平台：拼多多、1688、淘宝联盟",
      "筛选5-10元商品，加价50-100%上架",
      "优先选择有退货保障的商家",
    ],
    example: "拼多多数据线3元 → 闲鱼上架9.9元",
  },
  {
    id: "s5",
    phase: "执行",
    title: "拍摄商品主图",
    desc: "主图是吸引点击的关键，必须高清、有卖点",
    time: "30分钟",
    tips: [
      "使用纯白或浅色背景",
      "商品占图片80%以上",
      "可以添加小标签突出卖点",
    ],
    example: "标签示例：工厂直销 | 9.9包邮 | 买一送一",
  },
  {
    id: "s6",
    phase: "执行",
    title: "优化商品标题",
    desc: "标题决定搜索曝光，必须包含关键词",
    time: "15分钟",
    tips: [
      "品牌/品类 + 核心卖点 + 数量/规格",
      "参考同行爆款标题",
      "包含热搜关键词",
    ],
    example: "小米数据线 快充1.5米 3条装 买一送一",
  },
  {
    id: "s7",
    phase: "执行",
    title: "编写商品详情页",
    desc: "详细介绍产品优势，消除买家顾虑",
    time: "20分钟",
    tips: [
      "突出3-5个核心卖点",
      "说明发货时间和售后政策",
      "可以添加对比图展示优势",
    ],
    example: "✅品质保证 | ✅工厂直销 | ✅7天无理由",
  },
  {
    id: "s8",
    phase: "执行",
    title: "设置价格策略",
    desc: "价格影响转化率，初期可略低吸引流量",
    time: "10分钟",
    tips: [
      "参考同行定价，略低10-20%吸引首单",
      "设置SKU选项，增加客单价",
      "设置限时优惠，制造紧迫感",
    ],
    example: "单买9.9元，3条装23.9元更划算",
  },
  {
    id: "s9",
    phase: "执行",
    title: "发布商品并优化",
    desc: "选择最佳发布时间，持续优化提升曝光",
    time: "持续",
    tips: [
      "最佳发布时间：早7-9点、中12-14点、晚20-22点",
      "每天擦亮商品提升曝光",
      "观察数据，持续优化主图和标题",
    ],
    example: "每天固定时间擦亮，养成良好习惯",
  },
  {
    id: "s10",
    phase: "优化",
    title: "及时回复客户咨询",
    desc: "响应速度影响转化率，保持在线及时回复",
    time: "持续",
    tips: [
      "保持账号在线，设置消息提醒",
      "使用快捷回复提高效率",
      "引导客户下单：库存有限、发货快",
    ],
    example: "话术：亲，这款还有货的哦，现在拍下下午就发～",
  },
  {
    id: "s11",
    phase: "优化",
    title: "引导好评积累权重",
    desc: "好评率影响店铺权重，好评多曝光更高",
    time: "持续",
    tips: [
      "发货时放置好评返现卡",
      "签收后主动询问使用体验",
      "遇到问题及时解决，争取中差评改好评",
    ],
    example: "返现卡：确认收货+全5星截图返现2元",
  },
  {
    id: "s12",
    phase: "优化",
    title: "分析数据持续优化",
    desc: "根据曝光、浏览、转化数据优化各个环节",
    time: "每天",
    tips: [
      "曝光低→优化标题，增加标签",
      "浏览少→降低价格，优化主图",
      "转化低→优化详情页，增加对比图",
    ],
    example: "每周分析数据，找出提升空间",
  },
  {
    id: "s13",
    phase: "变现",
    title: "扩大品类矩阵",
    desc: "稳定出单后，拓展同品类其他SKU",
    time: "第2周起",
    tips: [
      "找到爆款后，快速复制到其他商品",
      "每周上架2-3个新品测试",
      "淘汰表现差的商品",
    ],
    example: "数据线爆了 → 上架充电宝、耳机线、手机壳",
  },
  {
    id: "s14",
    phase: "变现",
    title: "建立私域流量池",
    desc: "把客户引到微信，做复购和转介绍",
    time: "第3周起",
    tips: [
      "发货时放置引流卡片",
      "朋友圈持续发布新品",
      "建立粉丝群发优惠券",
    ],
    example: "卡片文案：加微信返现5元，进群享专属优惠",
  },
  {
    id: "s15",
    phase: "变现",
    title: "招募代理或合伙人",
    desc: "放大规模，实现被动收入",
    time: "1个月后",
    tips: [
      "分享赚钱方法，邀请代理加入",
      "提供培训和支持",
      "建立分销体系",
    ],
    example: "代理帮你卖货，你负责发货，利润分成",
  },
]

export function DetailedSteps({ projectId, defaultSteps = DEFAULT_STEPS }: DetailedStepsProps) {
  const [steps, setSteps] = useState(
    defaultSteps.map((s) => ({ ...s, checked: false }))
  )
  const [expandedStep, setExpandedStep] = useState<string | null>(null)
  const [filterPhase, setFilterPhase] = useState<string>("全部")

  const phases = ["全部", "准备", "执行", "优化", "变现"]

  const filteredSteps =
    filterPhase === "全部"
      ? steps
      : steps.filter((s) => s.phase === filterPhase)

  const completedCount = steps.filter((s) => s.checked).length
  const progress = Math.round((completedCount / steps.length) * 100)

  const toggleStep = (id: string) => {
    setSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, checked: !s.checked } : s))
    )
  }

  const phaseColors: Record<string, string> = {
    准备: "bg-blue-100 text-blue-700 border-blue-200",
    执行: "bg-green-100 text-green-700 border-green-200",
    优化: "bg-purple-100 text-purple-700 border-purple-200",
    变现: "bg-amber-100 text-amber-700 border-amber-200",
  }

  return (
    <div className="space-y-4">
      {/* 进度条 */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-green-700">
            📋 执行进度
          </span>
          <span className="text-sm font-bold text-green-600">
            {completedCount}/{steps.length} 步
          </span>
        </div>
        <div className="h-2 bg-green-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-xs text-green-600/70 mt-2">
          {progress < 30 && "🚀 刚刚开始，坚持就是胜利！"}
          {progress >= 30 && progress < 60 && "💪 进度不错，继续加油！"}
          {progress >= 60 && progress < 90 && "🌟 快要完成了！"}
          {progress >= 90 && "🎉 马上就能见到收益了！"}
        </p>
      </div>

      {/* 阶段筛选 */}
      <div className="flex flex-wrap gap-2">
        {phases.map((phase) => (
          <button
            key={phase}
            onClick={() => setFilterPhase(phase)}
            className={cn(
              "px-3 py-1.5 text-xs rounded-full border transition-all",
              filterPhase === phase
                ? "bg-primary text-white border-primary"
                : "bg-white text-gray-600 border-gray-200 hover:border-primary/50"
            )}
          >
            {phase}
          </button>
        ))}
      </div>

      {/* 步骤列表 */}
      <div className="space-y-2">
        {filteredSteps.map((step, index) => (
          <div
            key={step.id}
            className={cn(
              "border rounded-xl overflow-hidden transition-all",
              step.checked
                ? "border-green-200 bg-green-50/30"
                : expandedStep === step.id
                ? "border-primary/50 bg-primary/5"
                : "border-gray-200 bg-white hover:border-gray-300"
            )}
          >
            {/* 步骤头部 */}
            <div
              className="flex items-center gap-3 p-4 cursor-pointer"
              onClick={() => setExpandedStep(expandedStep === step.id ? null : step.id)}
            >
              {/* 序号/勾选 */}
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  toggleStep(step.id)
                }}
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all shrink-0",
                  step.checked
                    ? "bg-green-500 text-white"
                    : "bg-gray-100 text-gray-400 hover:bg-gray-200"
                )}
              >
                {step.checked ? <Check className="h-4 w-4" /> : index + 1}
              </button>

              {/* 内容 */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={cn(
                      "text-[10px] px-2 py-0.5 rounded-full border",
                      phaseColors[step.phase]
                    )}
                  >
                    {step.phase}
                  </span>
                  <span
                    className={cn(
                      "text-sm font-medium",
                      step.checked ? "text-green-700 line-through" : "text-gray-900"
                    )}
                  >
                    {step.title}
                  </span>
                </div>
                <p className="text-xs text-gray-500 truncate">{step.desc}</p>
              </div>

              {/* 时间 */}
              <span className="text-xs text-gray-400 shrink-0">{step.time}</span>

              {/* 展开箭头 */}
              <svg
                className={cn(
                  "h-4 w-4 text-gray-400 transition-transform shrink-0",
                  expandedStep === step.id && "rotate-180"
                )}
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {/* 展开详情 */}
            {expandedStep === step.id && (
              <div className="px-4 pb-4 pt-0 border-t border-gray-100">
                <div className="pt-4 space-y-3">
                  {/* 提示 */}
                  {step.tips && step.tips.length > 0 && (
                    <div>
                      <h4 className="text-xs font-medium text-gray-500 mb-2">💡 实战技巧</h4>
                      <ul className="space-y-1.5">
                        {step.tips.map((tip, i) => (
                          <li key={i} className="flex items-start gap-2 text-sm">
                            <span className="text-green-500 shrink-0">•</span>
                            <span className="text-gray-600">{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                  {/* 示例 */}
                  {step.example && (
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                      <h4 className="text-xs font-medium text-amber-600 mb-1">📝 示例参考</h4>
                      <p className="text-sm text-amber-700">{step.example}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
