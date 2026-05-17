"use client"

import { useState } from "react"
import Image from "next/image"
import { X, MessageCircle } from "lucide-react"

const WECHAT_ID = "gcy892"

export function FloatingWechatButton() {
  const [showCard, setShowCard] = useState(false)

  return (
    <>
      {/* 悬浮圆形按钮 */}
      <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
        {/* 提示标签 */}
        {!showCard && (
          <div className="bg-white shadow-lg border rounded-xl px-3 py-1.5 animate-breathe">
            <p className="text-xs font-medium text-foreground whitespace-nowrap">
              免费咨询 ✨
            </p>
          </div>
        )}

        {/* 按钮 */}
        <button
          onClick={() => setShowCard(!showCard)}
          className={`
            w-14 h-14 rounded-full flex items-center justify-center
            shadow-lg transition-all duration-300
            ${showCard
              ? "bg-gray-100 text-gray-600 shadow-md scale-90"
              : "bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-green-500/30 hover:shadow-green-500/40 hover:scale-105"
            }
          `}
        >
          {showCard ? (
            <X className="h-6 w-6" />
          ) : (
            <MessageCircle className="h-6 w-6" />
          )}
          {/* 在线脉冲点 */}
          {!showCard && (
            <span className="absolute -top-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse-dot" />
          )}
        </button>
      </div>

      {/* 展开的二维码卡片 */}
      {showCard && (
        <div
          className="fixed bottom-24 right-6 z-50 w-72 bg-white rounded-2xl shadow-2xl border animate-slide-up overflow-hidden"
        >
          {/* 卡片头部 */}
          <div className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-5 py-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm">添加客服微信</h3>
                <p className="text-xs text-white/70">免费获取2个项目方案</p>
              </div>
            </div>
          </div>

          {/* 内容区 */}
          <div className="p-5 flex flex-col items-center">
            {/* 二维码 */}
            <div className="relative w-40 h-40 rounded-xl overflow-hidden border-2 border-green-200 mb-4">
              <Image
                src="/images/wechat-friend-qr.jpg"
                alt="微信客服二维码"
                width={160}
                height={160}
                className="block w-full h-full object-cover"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/90 to-transparent p-2 text-center">
                <span className="text-white text-xs">👆 长按识别</span>
              </div>
            </div>

            {/* 微信号 */}
            <div className="w-full bg-muted rounded-xl p-3 mb-3">
              <p className="text-xs text-muted-foreground text-center mb-1">或手动搜索微信号</p>
              <p className="text-center font-mono font-bold text-base text-green-600">{WECHAT_ID}</p>
            </div>

            {/* 好处列表 */}
            <div className="w-full bg-amber-50 border border-amber-200 rounded-xl p-3">
              <p className="text-xs font-medium text-amber-800 mb-2">添加后可获得：</p>
              <ul className="text-xs text-amber-700 space-y-1">
                <li>• 免费查看2个完整项目方案</li>
                <li>• 1对1帮选适合你的方向</li>
                <li>• 不满意随时删，零压力</li>
              </ul>
            </div>
          </div>

          {/* 底部 */}
          <div className="px-5 py-3 border-t bg-muted/30 text-center">
            <p className="text-xs text-muted-foreground">回复时间：9:00 - 22:00</p>
          </div>
        </div>
      )}
    </>
  )
}
