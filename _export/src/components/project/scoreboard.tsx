"use client"

import { cn } from "@/lib/utils"

interface ScoreItem {
  label: string
  score: number // 1-5
  desc: string
}

interface ProjectScoreboardProps {
  scores: ScoreItem[]
  className?: string
}

function StarRating({ value }: { value: number }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg
          key={i}
          className={cn("h-3.5 w-3.5", i <= value ? "text-amber-400 fill-amber-400" : "text-gray-200 fill-gray-200")}
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </div>
  )
}

export function ProjectScoreboard({ scores, className }: ProjectScoreboardProps) {
  const avgScore = Math.round(scores.reduce((a, b) => a + b.score, 0) / scores.length / 0.5) * 0.5

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">项目评估</h3>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-primary">{avgScore}</span>
          <div className="flex flex-col">
            <StarRating value={Math.round(avgScore)} />
            <span className="text-[10px] text-muted-foreground">综合评分</span>
          </div>
        </div>
      </div>
      <div className="space-y-2.5">
        {scores.map((item) => (
          <div key={item.label} className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground w-16 shrink-0">{item.label}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-400 to-purple-600 transition-all duration-700"
                style={{ width: `${(item.score / 5) * 100}%` }}
              />
            </div>
            <span className="text-xs font-medium w-6 text-right">{item.score}</span>
          </div>
        ))}
      </div>
      <div className="text-[10px] text-muted-foreground bg-muted/50 rounded-lg p-2">
        💡 评分基于社区反馈和实际执行数据，定期更新
      </div>
    </div>
  )
}
