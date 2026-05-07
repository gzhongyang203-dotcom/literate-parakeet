"use client"

import { useState } from "react"
import { MessageCircle, X, QrCode, Copy, Check } from "lucide-react"

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
      {/* 悬浮按钮 */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30 hover:shadow-xl hover:shadow-green-500/40 hover:scale-105 transition-all flex items-center justify-center group"
        >
          <MessageCircle className="h-6 w-6" />
          <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse-dot" />
          <span className="absolute top-full mt-2 right-0 bg-white text-xs text-foreground px-2 py-1 rounded-lg shadow-sm border opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
            添加客服微信
          </span>
        </button>
      )}

      {/* 客服窗口 */}
      {open && (
        <div className="fixed bottom-6 right-6 z-50 w-[360px] bg-white rounded-2xl shadow-2xl border flex flex-col overflow-hidden animate-fade-up">
          {/* Header */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-4 flex items-center justify-between shrink-0">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
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
            <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-green-100 to-emerald-100 flex items-center justify-center mb-4">
              <svg className="w-12 h-12 text-green-600" viewBox="0 0 24 24" fill="currentColor">
                <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm5.34 2.867c-1.797-.052-3.746.512-5.28 1.786-1.72 1.428-2.687 3.72-1.78 6.22.942 2.453 3.666 4.229 6.884 4.229.826 0 1.622-.12 2.361-.336a.722.722 0 0 1 .598.082l1.584.926a.272.272 0 0 0 .14.047c.134 0 .24-.111.24-.247 0-.06-.023-.12-.038-.177l-.327-1.233a.582.582 0 0 1-.023-.156.49.49 0 0 1 .201-.398C23.024 18.48 24 16.82 24 14.98c0-3.21-2.931-5.837-6.656-6.088V8.89c-.135-.01-.269-.022-.406-.022zm-1.834 2.994c.536 0 .97.44.97.983a.976.976 0 0 1-.97.983.976.976 0 0 1-.97-.983c0-.542.434-.983.97-.983zm4.857 0c.536 0 .97.44.97.983a.976.976 0 0 1-.97.983.976.976 0 0 1-.97-.983c0-.542.434-.983.97-.983z"/>
              </svg>
            </div>

            <h4 className="font-bold text-lg mb-1">识别二维码添加客服</h4>
            <p className="text-sm text-muted-foreground mb-4">
              或直接搜索微信号，备注"创业"优先通过
            </p>

            {/* 搜索提示 */}
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-4 mb-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="text-left">
                  <p className="text-sm font-medium text-amber-800">添加客服的好处</p>
                  <ul className="text-xs text-amber-700 mt-1 space-y-0.5">
                    <li>• 获取最新创业项目信息</li>
                    <li>• 1对1咨询适合你的方向</li>
                    <li>• 加入创业者交流群</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* 微信号 */}
            <div className="w-full bg-muted rounded-xl p-4">
              <p className="text-xs text-muted-foreground mb-2">微信号（长按复制）</p>
              <div className="flex items-center justify-between">
                <span className="font-mono font-bold text-lg">{WECHAT_ID}</span>
                <button
                  onClick={handleCopy}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm transition-colors"
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
