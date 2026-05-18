import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AiChatWidget } from "@/components/ai-chat-widget"
import { FloatingWechatButton } from "@/components/floating-wechat-button"

export const metadata: Metadata = {
  // 微信分享卡片必须用绝对URL，这里设定基础URL
  metadataBase: new URL("https://chuangyedaohang.com"),
  title: "创业导航 | 普通人也能上手的创业项目库",
  description: "发现可落地的创业项目，找到一起干的小伙伴。持续更新，小白友好。",
  keywords: ["创业项目", "副业", "抖音变现", "小红书创业", "AI副业", "闲鱼赚钱", "短视频创业"],
  authors: [{ name: "创业导航" }],
  openGraph: {
    title: "创业导航 | 普通人也能上手的创业项目库",
    description: "发现可落地的创业项目，找到一起干的小伙伴。持续更新，小白友好。",
    url: "https://chuangyedaohang.com",
    siteName: "创业导航",
    locale: "zh_CN",
    type: "website",
    images: [
      {
        // 微信分享图用1:1比例（300x300以上），单独一张小图避免加载超时
        url: "/wechat-share.png",
        width: 500,
        height: 500,
        alt: "创业导航 - 普通人也能上手的创业项目库",
      },
      // 通用OG图（Facebook/Twitter等用）
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "创业导航",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "创业导航 | 普通人也能上手的创业项目库",
    description: "发现可落地的创业项目，找到一起干的小伙伴。持续更新，小白友好。",
  },
  icons: {
    icon: "/favicon.svg",
  },
}

// 手机端自适应 - 必须单独导出
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#ffffff",
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="zh-CN" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        {/* 主要转化入口 - 右下角悬浮微信按钮 */}
        <FloatingWechatButton />
        {/* 辅助客服入口 - 左下角，低侵入性 */}
        <AiChatWidget />
      </body>
    </html>
  )
}
