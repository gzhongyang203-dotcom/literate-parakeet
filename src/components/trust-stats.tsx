"use client"

import { useEffect, useState, useRef } from "react"
import { cn } from "@/lib/utils"

interface CounterProps {
  end: number
  suffix?: string
  label: string
  icon?: string
  duration?: number
  className?: string
}

function AnimatedCounter({ end, suffix = "", label, icon, duration = 2000, className }: CounterProps) {
  const [count, setCount] = useState(0)
  const ref = useRef<HTMLDivElement>(null)
  const counted = useRef(false)

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !counted.current) {
          counted.current = true
          const startTime = Date.now()
          const step = () => {
            const elapsed = Date.now() - startTime
            const progress = Math.min(elapsed / duration, 1)
            // ease-out cubic
            const eased = 1 - Math.pow(1 - progress, 3)
            setCount(Math.floor(eased * end))
            if (progress < 1) requestAnimationFrame(step)
          }
          requestAnimationFrame(step)
        }
      },
      { threshold: 0.3 }
    )
    if (ref.current) observer.observe(ref.current)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <div ref={ref} className={cn("text-center", className)}>
      <div className="text-3xl md:text-4xl font-bold text-primary animate-count">
        {icon && <span className="mr-1">{icon}</span>}
        {count}
        {suffix}
      </div>
      <div className="text-sm text-muted-foreground mt-1.5">{label}</div>
    </div>
  )
}

export function TrustStats() {
  return (
    <section className="border-y bg-gradient-to-r from-purple-50/30 via-white to-pink-50/30">
      <div className="container mx-auto px-4 py-10">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-3xl mx-auto">
          <AnimatedCounter end={68} suffix="+" label="创业项目" duration={2500} />
          <AnimatedCounter end={256} suffix="+" label="社区成员" duration={2500} />
          <AnimatedCounter end={6} label="项目分类" duration={1500} />
          <AnimatedCounter end={89} suffix="%" label="项目可落地率" duration={2500} />
        </div>
      </div>
    </section>
  )
}

export function ActivityIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 rounded-full px-3 py-1.5">
      <span className="relative flex h-2 w-2">
        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
        <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
      </span>
      当前 <strong className="text-foreground">12</strong> 人在浏览 · 今日新增 <strong className="text-foreground">3</strong> 个项目
    </div>
  )
}
