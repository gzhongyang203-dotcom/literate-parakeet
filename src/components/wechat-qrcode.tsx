"use client"

import Image from "next/image"
import { useState } from "react"

export function WechatQRCode({ size = 120 }: { size?: number }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="inline-block">
      <div
        className="cursor-pointer hover:opacity-80 transition-opacity"
        onClick={() => setIsExpanded(!isExpanded)}
        title="点击查看大图"
      >
        <div className="relative overflow-hidden rounded-lg border-2 border-green-200 bg-white shadow-md">
          <Image
            src="/images/wechat-friend-qr.jpg"
            alt="微信客服二维码"
            width={size}
            height={size}
            className="block"
          />
          <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-green-600/90 to-transparent p-2 text-center">
            <span className="text-white text-[10px]">👆 长按识别</span>
          </div>
        </div>
      </div>

      {/* 弹窗大图 */}
      {isExpanded && (
        <div
          className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4"
          onClick={() => setIsExpanded(false)}
        >
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full">
            <div className="text-center mb-4">
              <h3 className="font-bold text-lg">👆 长按识别二维码</h3>
              <p className="text-sm text-muted-foreground mt-1">
                或搜索微信号：<span className="font-bold text-primary">gcy892</span>
              </p>
            </div>
            <div className="relative mx-auto rounded-lg overflow-hidden border-2 border-green-200">
              <Image
                src="/images/wechat-friend-qr.jpg"
                alt="微信客服二维码"
                width={240}
                height={240}
                className="block w-full h-auto"
              />
            </div>
            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>💬 咨询格式：项目名称 + 遇到的问题</p>
              <p className="text-xs mt-1">⏰ 24小时内必回</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export function WechatQRCodeCard({ title = "扫码咨询客服" }: { title?: string }) {
  return (
    <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-xl p-5">
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xl">💬</span>
        <h3 className="font-bold text-green-800">{title}</h3>
      </div>

      <div className="flex items-start gap-4">
        <WechatQRCode size={100} />

        <div className="flex-1 text-sm text-green-700 space-y-2">
          <p className="font-medium">客服微信</p>
          <p className="text-lg font-bold text-green-600">gcy892</p>
          <div className="text-xs text-green-600/70 space-y-1">
            <p>• 长按二维码添加</p>
            <p>• 备注"项目咨询"</p>
            <p>• 24小时内回复</p>
          </div>
        </div>
      </div>

      <div className="mt-4 pt-4 border-t border-green-200">
        <p className="text-xs text-green-600/70 text-center">
          遇到问题？扫码找客服，1对1解答
        </p>
      </div>
    </div>
  )
}

export function WechatQRCodeFloating() {
  const [show, setShow] = useState(false)

  return (
    <>
      {/* 悬浮按钮 */}
      <button
        onClick={() => setShow(true)}
        className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-40 bg-green-500 hover:bg-green-600 active:scale-95 text-white rounded-full shadow-lg hover:shadow-xl transition-all p-3 sm:p-4 group"
        title="咨询客服"
      >
        <svg
          className="h-6 w-6"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
          />
        </svg>
        <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full animate-pulse" />
      </button>

      {/* 弹窗 */}
      {show && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-3 sm:p-4"
          onClick={() => setShow(false)}
        >
          <div
            className="bg-white rounded-2xl p-4 sm:p-6 max-w-[calc(100vw-24px)] sm:max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-bold text-lg">👆 长按识别二维码</h3>
              <button
                onClick={() => setShow(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="text-center mb-4">
              <p className="text-sm text-muted-foreground">
                微信号：<span className="font-bold text-primary">gcy892</span>
              </p>
            </div>

            <div className="relative mx-auto rounded-lg overflow-hidden border-2 border-green-200 w-48">
              <Image
                src="/images/wechat-friend-qr.jpg"
                alt="微信客服二维码"
                width={192}
                height={192}
                className="block w-full h-auto"
              />
            </div>

            <div className="mt-4 text-center text-sm text-muted-foreground">
              <p>💬 咨询格式：项目名称 + 遇到的问题</p>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
