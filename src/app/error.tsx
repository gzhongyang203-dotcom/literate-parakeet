"use client"

import { Button } from "@/components/ui/button"
import { ArrowRight, RefreshCw } from "lucide-react"

export default function HomeError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="text-center max-w-md">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mx-auto mb-6">
          <RefreshCw className="h-8 w-8 text-muted-foreground" />
        </div>
        <h2 className="text-xl font-bold mb-2">加载失败</h2>
        <p className="text-sm text-muted-foreground mb-6">
          网络不太稳定，请重试一下。如果多次失败，可以先用电脑访问。
        </p>
        <div className="flex justify-center gap-3">
          <Button onClick={reset} variant="outline" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            重试
          </Button>
          <a href="/projects">
            <Button className="gap-2">
              直接浏览项目 <ArrowRight className="h-4 w-4" />
            </Button>
          </a>
        </div>
      </div>
    </div>
  )
}
