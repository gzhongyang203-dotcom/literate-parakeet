"use client"

import { useEffect, useState } from "react"

// 虚拟订单数据
const VIRTUAL_ORDERS = [
  { name: "张同学", location: "深圳", item: "闲鱼AI代写项目", time: "刚刚" },
  { name: "李女士", location: "广州", item: "小红书壁纸号项目", time: "3分钟前" },
  { name: "王先生", location: "北京", item: "创业者套餐订阅", time: "5分钟前" },
  { name: "赵学员", location: "上海", item: "抖音带货教程", time: "8分钟前" },
  { name: "周网友", location: "杭州", item: "合伙人套餐订阅", time: "12分钟前" },
  { name: "吴用户", location: "成都", item: "闲鱼无货源项目", time: "15分钟前" },
  { name: "郑会员", location: "武汉", item: "小红书变现教程", time: "18分钟前" },
  { name: "孙伙伴", location: "南京", item: "创业者套餐订阅", time: "22分钟前" },
  { name: "陈网友", location: "西安", item: "AI工具项目合集", time: "25分钟前" },
  { name: "林同学", location: "天津", item: "短视频变现项目", time: "28分钟前" },
  { name: "黄女士", location: "重庆", item: "创业者套餐订阅", time: "32分钟前" },
  { name: "许先生", location: "济南", item: "闲鱼数码转卖", time: "35分钟前" },
]

// 虚拟统计数据
const VIRTUAL_STATS = {
  totalUsers: 12580,
  totalProjects: 68,
  totalOrders: 28650,
  satisfaction: 98.6,
}

export function VirtualStats() {
  const [stats, setStats] = useState({
    users: 0,
    projects: 0,
    orders: 0,
    satisfaction: 0,
  })

  useEffect(() => {
    // 模拟数字增长动画
    const duration = 2000
    const steps = 60
    const interval = duration / steps

    let step = 0
    const timer = setInterval(() => {
      step++
      const progress = step / steps
      const eased = 1 - Math.pow(1 - progress, 3) // ease-out

      setStats({
        users: Math.floor(eased * VIRTUAL_STATS.totalUsers),
        projects: Math.floor(eased * VIRTUAL_STATS.totalProjects),
        orders: Math.floor(eased * VIRTUAL_STATS.totalOrders),
        satisfaction: Math.min(eased * VIRTUAL_STATS.satisfaction, 99.9),
      })

      if (step >= steps) clearInterval(timer)
    }, interval)

    return () => clearInterval(timer)
  }, [])

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto">
      <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl border border-blue-200">
        <div className="text-2xl md:text-3xl font-bold text-blue-600">
          {stats.users.toLocaleString()}+
        </div>
        <div className="text-xs text-blue-600/70 mt-1">注册用户</div>
        <div className="text-[10px] text-blue-400">较上月 +23%</div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl border border-purple-200">
        <div className="text-2xl md:text-3xl font-bold text-purple-600">
          {stats.projects}+
        </div>
        <div className="text-xs text-purple-600/70 mt-1">精选项目</div>
        <div className="text-[10px] text-purple-400">持续更新中</div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-xl border border-green-200">
        <div className="text-2xl md:text-3xl font-bold text-green-600">
          {stats.orders.toLocaleString()}+
        </div>
        <div className="text-xs text-green-600/70 mt-1">完成订单</div>
        <div className="text-[10px] text-green-400">好评率 98.6%</div>
      </div>

      <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl border border-orange-200">
        <div className="text-2xl md:text-3xl font-bold text-orange-600">
          {stats.satisfaction.toFixed(1)}%
        </div>
        <div className="text-xs text-orange-600/70 mt-1">用户满意度</div>
        <div className="text-[10px] text-orange-400">超过 2.3万评价</div>
      </div>
    </div>
  )
}

export function OrderScroll() {
  const [orders, setOrders] = useState(VIRTUAL_ORDERS.slice(0, 6))
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    // 每5秒滚动一条新订单
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const newIndex = (prev + 1) % VIRTUAL_ORDERS.length
        // 随机生成新订单
        const newOrder = {
          ...VIRTUAL_ORDERS[newIndex],
          time: "刚刚",
        }
        setOrders((current) => [newOrder, ...current.slice(0, 5)])
        return newIndex
      })
    }, 5000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4 max-w-4xl mx-auto">
      <div className="flex items-center gap-2 mb-3">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
        </span>
        <span className="text-sm font-medium text-green-700">实时成交动态</span>
      </div>

      <div className="space-y-2">
        {orders.map((order, index) => (
          <div
            key={`${order.name}-${index}`}
            className={`flex items-center justify-between text-sm ${
              index === 0 ? "text-green-700 font-medium" : "text-green-600/80"
            }`}
            style={{
              animation: index === 0 ? "fadeIn 0.3s ease-out" : undefined,
            }}
          >
            <div className="flex items-center gap-2">
              <span className="text-green-400">✓</span>
              <span>{order.name}</span>
              <span className="text-green-400/60">·</span>
              <span>{order.location}</span>
              <span className="text-green-400/60">·</span>
              <span>购买了 {order.item}</span>
            </div>
            <span className="text-xs text-green-400/60">{order.time}</span>
          </div>
        ))}
      </div>
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
