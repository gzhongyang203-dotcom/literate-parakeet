"use client"

import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import { Clock, Flag } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface CheckStep {
  id: string
  title: string
  desc: string
  time: string
  phase: "准备" | "执行" | "优化"
}

interface ExecutionChecklistProps {
  steps: CheckStep[]
  className?: string
}

export function ExecutionChecklist({ steps, className }: ExecutionChecklistProps) {
  const [completed, setCompleted] = useState<Set<string>>(new Set())

  // Load from localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem("project-checklist")
      if (saved) setCompleted(new Set(JSON.parse(saved)))
    } catch {}
  }, [])

  const toggle = (id: string) => {
    setCompleted((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      localStorage.setItem("project-checklist", JSON.stringify([...next]))
      return next
    })
  }

  const progress = steps.length > 0 ? Math.round((completed.size / steps.length) * 100) : 0
  const phases = [...new Set(steps.map((s) => s.phase))]

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">执行检查清单</h3>
        <span className="text-xs text-muted-foreground">
          {completed.size}/{steps.length} 完成
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className="h-full rounded-full bg-gradient-to-r from-green-400 to-emerald-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Steps by phase */}
      {phases.map((phase) => (
        <div key={phase}>
          <Badge variant="outline" className="mb-2 text-[10px] gap-1">
            <Flag className="h-3 w-3" />
            {phase}阶段
          </Badge>
          <div className="space-y-1.5">
            {steps
              .filter((s) => s.phase === phase)
              .map((step) => (
                <label
                  key={step.id}
                  className={cn(
                    "flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-primary/20",
                    completed.has(step.id) ? "bg-green-50/50 border-green-200" : "bg-white"
                  )}
                >
                  <input
                    type="checkbox"
                    checked={completed.has(step.id)}
                    onChange={() => toggle(step.id)}
                    className="mt-0.5 rounded"
                  />
                  <div className="flex-1 min-w-0">
                    <span className={cn("text-sm", completed.has(step.id) && "line-through text-muted-foreground")}>
                      {step.title}
                    </span>
                    <p className="text-xs text-muted-foreground mt-0.5">{step.desc}</p>
                  </div>
                  <span className="text-[10px] text-muted-foreground flex items-center gap-1 shrink-0 mt-0.5">
                    <Clock className="h-3 w-3" />
                    {step.time}
                  </span>
                </label>
              ))}
          </div>
        </div>
      ))}

      {progress === 100 && (
        <div className="text-center py-3 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl border border-green-200">
          <p className="text-sm font-medium text-green-700">🎉 全部完成！你已经准备好了</p>
          <p className="text-xs text-green-600 mt-0.5">发布你的成果到社区，让更多人看到</p>
        </div>
      )}
    </div>
  )
}
