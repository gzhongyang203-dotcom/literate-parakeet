"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { Check, Copy, CheckCheck, ExternalLink } from "lucide-react"

interface ToolStep {
  name: string
  desc: string
  link?: string
  free?: boolean
}

interface ToolChecklistProps {
  tools: ToolStep[]
  className?: string
}

export function ToolChecklist({ tools, className }: ToolChecklistProps) {
  const [checked, setChecked] = useState<Set<string>>(new Set())
  const [copied, setCopied] = useState(false)

  const allChecked = checked.size === tools.length

  const toggle = (name: string) => {
    setChecked((prev) => {
      const next = new Set(prev)
      if (next.has(name)) next.delete(name)
      else next.add(name)
      return next
    })
  }

  const copyAll = async () => {
    const text = tools.map((t) => `${t.name} — ${t.desc}${t.link ? ` (${t.link})` : ""}`).join("\n")
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-sm">所需工具清单</h3>
        <div className="flex items-center gap-2">
          {allChecked && <span className="text-xs text-green-600 font-medium flex items-center gap-1"><CheckCheck className="h-3 w-3" /> 已集齐</span>}
          <button onClick={copyAll} className="text-xs text-muted-foreground hover:text-primary flex items-center gap-1">
            {copied ? <Check className="h-3 w-3" /> : <Copy className="h-3 w-3" />}
            {copied ? "已复制" : "复制清单"}
          </button>
        </div>
      </div>
      <div className="space-y-1.5">
        {tools.map((tool) => (
          <label
            key={tool.name}
            className={cn(
              "flex items-start gap-3 p-2.5 rounded-lg border cursor-pointer transition-all hover:border-primary/30",
              checked.has(tool.name) ? "bg-primary/5 border-primary/20" : "bg-white"
            )}
          >
            <input
              type="checkbox"
              checked={checked.has(tool.name)}
              onChange={() => toggle(tool.name)}
              className="mt-0.5 rounded"
            />
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className={cn("text-sm font-medium", checked.has(tool.name) && "line-through text-muted-foreground")}>
                  {tool.name}
                </span>
                {tool.free && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full font-medium">免费</span>}
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">{tool.desc}</p>
            </div>
            {tool.link && (
              <a href={tool.link} target="_blank" rel="noopener noreferrer" className="shrink-0 text-muted-foreground hover:text-primary mt-0.5">
                <ExternalLink className="h-3.5 w-3.5" />
              </a>
            )}
          </label>
        ))}
      </div>
    </div>
  )
}
