"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { createClient } from "@/lib/supabase/client"

interface LikeButtonProps {
  projectId: string
  initialCount?: number
}

// 粒子动画 - 心形爆散
function HeartParticle({ x, y, index }: { x: number; y: number; index: number }) {
  const colors = ["#ff6b6b", "#ff8787", "#ffd43b", "#f06595", "#e599f7", "#74c0fc"]
  const color = colors[index % colors.length]
  const angle = (index / 8) * Math.PI * 2
  const distance = 20 + Math.random() * 20

  return (
    <span
      className="absolute pointer-events-none text-xs"
      style={{
        left: x,
        top: y,
        color,
        animation: `heartParticle 0.6s ease-out forwards`,
        animationDelay: `${index * 0.03}s`,
        opacity: 0,
        "--tx": `${Math.cos(angle) * distance}px`,
        "--ty": `${Math.sin(angle) * distance}px`,
      } as React.CSSProperties}
    >
      ♥
    </span>
  )
}

export function LikeButton({ projectId, initialCount = 0 }: LikeButtonProps) {
  const [liked, setLiked] = useState(false)
  const [count, setCount] = useState(initialCount)
  const [animating, setAnimating] = useState(false)
  const [loading, setLoading] = useState(true)
  const [showParticles, setShowParticles] = useState(false)
  const [countBounce, setCountBounce] = useState(false)
  const btnRef = useRef<HTMLButtonElement>(null)
  const prevCount = useRef(initialCount)

  useEffect(() => {
    let cancelled = false
    async function init() {
      try {
        const res = await fetch(`/api/projects/like?project_id=${projectId}`)
        if (!res.ok) return
        const data = await res.json()
        if (cancelled) return
        setCount(data.like_count || initialCount)
        setLiked(data.user_liked || false)
        prevCount.current = data.like_count || initialCount
      } catch {
        // 静默失败
      } finally {
        if (!cancelled) setLoading(false)
      }
    }
    init()
    return () => { cancelled = true }
  }, [projectId, initialCount])

  // 数字跳动效果
  useEffect(() => {
    if (count !== prevCount.current) {
      setCountBounce(true)
      const timer = setTimeout(() => setCountBounce(false), 300)
      prevCount.current = count
      return () => clearTimeout(timer)
    }
  }, [count])

  const handleToggle = useCallback(async () => {
    const supabase = createClient()
    const { data: { session } } = await supabase.auth.getSession()
    if (!session) {
      window.location.href = "/login"
      return
    }

    const wasLiked = liked
    setLiked(!wasLiked)
    setCount((c) => wasLiked ? c - 1 : c + 1)

    if (!wasLiked) {
      setAnimating(true)
      setShowParticles(true)
      setTimeout(() => {
        setAnimating(false)
        setShowParticles(false)
      }, 700)
    }

    try {
      const res = await fetch("/api/projects/like", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ project_id: projectId }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error)
    } catch {
      setLiked(wasLiked)
      setCount((c) => wasLiked ? c + 1 : c - 1)
    }
  }, [liked, projectId])

  return (
    <>
      {/* 注入粒子动画 keyframes */}
      <style jsx global>{`
        @keyframes heartParticle {
          0% { opacity: 1; transform: translate(0, 0) scale(1); }
          100% { opacity: 0; transform: translate(var(--tx), var(--ty)) scale(0.3); }
        }
        @keyframes heartBeat {
          0% { transform: scale(1); }
          15% { transform: scale(1.3); }
          30% { transform: scale(0.95); }
          45% { transform: scale(1.15); }
          60% { transform: scale(1); }
        }
        @keyframes countPop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
      `}</style>

      <button
        ref={btnRef}
        onClick={handleToggle}
        disabled={loading}
        className={`relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium
          transition-all duration-300 select-none overflow-visible
          ${liked
            ? "bg-gradient-to-r from-pink-50 to-red-50 text-red-500 border border-pink-200 shadow-sm"
            : "bg-white/60 text-gray-500 border border-gray-200 hover:border-pink-300 hover:text-pink-500 hover:bg-pink-50/50"}
          ${animating ? "scale-110" : ""}
          ${loading ? "opacity-50" : "cursor-pointer"}
        `}
        title={liked ? "取消点赞" : "点赞支持"}
      >
        {/* 粒子层 */}
        {showParticles && (
          <span className="absolute inset-0 pointer-events-none">
            {Array.from({ length: 8 }).map((_, i) => (
              <HeartParticle key={i} x={Math.random() * 30 + 15} y={Math.random() * 10} index={i} />
            ))}
          </span>
        )}

        {/* 心形图标 */}
        <svg
          className={`w-4 h-4 transition-all duration-300 ${animating ? "animate-pulse" : ""}`}
          viewBox="0 0 24 24"
          fill={liked ? "url(#heartGradient)" : "none"}
          stroke={liked ? "url(#heartGradient)" : "currentColor"}
          strokeWidth={liked ? 0 : 2}
          strokeLinecap="round"
          strokeLinejoin="round"
          style={animating ? { animation: "heartBeat 0.6s ease" } : undefined}
        >
          <defs>
            <linearGradient id="heartGradient" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#f06595" />
              <stop offset="100%" stopColor="#e03131" />
            </linearGradient>
          </defs>
          <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
        </svg>

        {/* 数字 */}
        <span
          className={`tabular-nums ${countBounce ? "animate-pulse" : ""}`}
          style={countBounce ? { animation: "countPop 0.3s ease" } : undefined}
        >
          {count > 999 ? `${(count / 1000).toFixed(1)}k` : count}
        </span>

        {/* 文字标签 */}
        <span className="hidden sm:inline">{liked ? "已赞" : "点赞"}</span>
      </button>
    </>
  )
}
