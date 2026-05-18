"use client"

import { useEffect, useState, useRef } from "react"

const VIRTUAL_ORDERS = [
  { name: "张同学", location: "深圳", item: "闲鱼AI代写项目" },
  { name: "李女士", location: "广州", item: "小红书壁纸号项目" },
  { name: "王先生", location: "北京", item: "创业者套餐订阅" },
  { name: "赵学员", location: "上海", item: "抖音带货教程" },
  { name: "周网友", location: "杭州", item: "闲鱼无货源项目" },
  { name: "吴用户", location: "成都", item: "AI工具项目合集" },
  { name: "郑会员", location: "武汉", item: "小红书变现教程" },
  { name: "孙伙伴", location: "南京", item: "创业者套餐订阅" },
  { name: "陈网友", location: "西安", item: "短视频变现项目" },
  { name: "林同学", location: "天津", item: "闲鱼数码转卖" },
]

const TIME_LABELS = ["刚刚", "3分钟前", "5分钟前", "8分钟前", "12分钟前", "15分钟前", "18分钟前", "22分钟前", "25分钟前", "28分钟前"]

export function VirtualStats() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
        <div className="text-2xl md:text-3xl font-bold text-blue-600">12,580+</div>
        <div className="text-xs text-blue-600/70 mt-1">注册用户</div>
        <div className="text-[10px] text-blue-400">较上月 +23%</div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
        <div className="text-2xl md:text-3xl font-bold text-purple-600">68+</div>
        <div className="text-xs text-purple-600/70 mt-1">精选项目</div>
        <div className="text-[10px] text-purple-400">持续更新中</div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
        <div className="text-2xl md:text-3xl font-bold text-green-600">28,650+</div>
        <div className="text-xs text-green-600/70 mt-1">完成订单</div>
        <div className="text-[10px] text-green-400">好评率 98.6%</div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
        <div className="text-2xl md:text-3xl font-bold text-orange-600">98.6%</div>
        <div className="text-xs text-orange-600/70 mt-1">用户满意度</div>
        <div className="text-[10px] text-orange-400">超过 2.3万评价</div>
      </div>
    </div>
  )
}

export function OrderScroll() {
  const containerRef = useRef<HTMLDivElement>(null)

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 max-w-4xl mx-auto overflow-hidden">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-sm font-medium text-green-700">实时成交动态</span>
      </div>

      {/* CSS 滚动动画 - 无 JS 定时器 */}
      <div className="relative h-[200px] overflow-hidden">
        <div
          ref={containerRef}
          className="animate-scroll space-y-2"
          style={{
            animation: "scrollUp 30s linear infinite",
          }}
        >
          {/* 展示2轮避免空白 */}
          {[...VIRTUAL_ORDERS, ...VIRTUAL_ORDERS].map((order, index) => (
            <div
              key={`${order.name}-${index}`}
              className="flex items-center justify-between text-sm text-green-600/80 gap-2"
            >
              <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
                <span className="text-green-400 flex-shrink-0">✓</span>
                <span className="flex-shrink-0">{order.name}</span>
                <span className="text-green-400/60 flex-shrink-0 hidden sm:inline">·</span>
                <span className="flex-shrink-0 hidden sm:inline">{order.location}</span>
                <span className="text-green-400/60 flex-shrink-0 hidden sm:inline">·</span>
                <span className="truncate hidden sm:inline">购买了 {order.item}</span>
                <span className="truncate sm:hidden">购买了</span>
              </div>
              <span className="text-xs text-green-400/60 whitespace-nowrap flex-shrink-0">{TIME_LABELS[index % TIME_LABELS.length]}</span>
            </div>
          ))}
        </div>

        {/* 渐变遮罩 */}
        <div className="absolute top-0 left-0 right-0 h-8 bg-gradient-to-b from-green-50/80 to-transparent pointer-events-none" />
        <div className="absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-emerald-50/80 to-transparent pointer-events-none" />
      </div>

      <style jsx>{`
        @keyframes scrollUp {
          0% { transform: translateY(0); }
          100% { transform: translateY(-50%); }
        }
      `}</style>
    </div>
  )
}

export function HotTags() {
  const tags = [
    { name: "#闲鱼副业", heat: "🔥🔥🔥🔥🔥" },
    { name: "#抖音带货", heat: "🔥🔥🔥🔥" },
    { name: "#小红书变现", heat: "🔥🔥🔥🔥🔥" },
    { name: "#AI创业", heat: "🔥🔥🔥🔥" },
    { name: "#微信赚钱", heat: "🔥🔥🔥" },
    { name: "#知识付费", heat: "🔥🔥🔥🔥" },
    { name: "#视频号", heat: "🔥🔥🔥🔥🔥" },
    { name: "#跨境电商", heat: "🔥🔥🔥" },
  ]

  return (
    <div className="flex flex-wrap justify-center gap-3 mt-6">
      {tags.map((tag) => (
        <div
          key={tag.name}
          className="px-3 py-1.5 bg-white border border-gray-200 rounded-full text-xs text-gray-600 hover:border-primary/50 hover:text-primary transition-colors cursor-pointer"
        >
          {tag.name} {tag.heat}
        </div>
      ))}
    </div>
  )
}
