"use client"

import { useState } from "react"
import { MessageCircle, X, Copy, Check } from "lucide-react"

const WECHAT_ID = "13785108266"

export function AiChatWidget() {
  const [open, setOpen] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    await navigator.clipboard.writeText(WECHAT_ID)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      {/* 悬浮按钮 - 左下角，低调 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-20 sm:bottom-6 left-4 sm:left-6 z-40 w-10 h-10 rounded-full bg-white border border-gray-200 text-gray-500 shadow-sm hover:shadow-md hover:border-gray-300 hover:text-gray-700 transition-all flex items-center justify-center group"
          aria-label="客服咨询"
        >
          <MessageCircle className="h-4 w-4" />
          <span className="absolute top-full mt-2 left-0 bg-white text-xs text-foreground px-2 py-1 rounded-lg shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            在线客服
          </span>
        </button>
      )}

      {/* 客服窗口 */}
      {open && (
        <div className="fixed bottom-6 left-4 z-50 w-[calc(100vw-32px)] sm:w-[320px] max-w-[320px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-gray-700 to-gray-800 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/15 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">在线客服</h3>
                <p className="text-xs text-white/70">添加微信咨询创业问题</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="p-1.5 hover:bg-white/10 rounded-lg transition-colors">
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Content */}
          <div className="p-6 flex flex-col items-center text-center">
            <h4 className="font-bold text-lg mb-1">添加客服微信</h4>
            <p className="text-sm text-muted-foreground mb-4">
              咨询项目、付款问题、或申请加群
            </p>

            {/* 微信号 */}
            <div className="w-full bg-muted rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-2">微信号</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg">{WECHAT_ID}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700 hover:bg-gray-800 text-white text-sm transition-colors"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4" /> 已复制
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4" /> 复制
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-3 border-t bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">工作时间：9:00 - 22:00</p>
          </div>
        </div>
      )}
    </>
  )
}
