"use client"

import { Button } from "@/components/ui/button"
import { useState } from "react"
import { Check, Copy } from "lucide-react"

export function ShareButton() {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {}
  }

  return (
    <Button variant="outline" size="sm" className="flex-1" onClick={handleCopy}>
      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? "已复制" : "复制链接"}
    </Button>
  )
}
