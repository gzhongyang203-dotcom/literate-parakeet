import type { Metadata, Viewport } from "next"
import "./globals.css"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AiChatWidget } from "@/components/ai-chat-widget"

export const metadata: Metadata = {
  title: "创业导航 | 普通人也能上手的创业项目库",
  description: "发现可落地的创业项目，找到一起干的小伙伴。持续更新，小白友好。",
  keywords: ["创业项目", "副业", "抖音变现", "小红书创业", "AI副业", "闲鱼赚钱", "短视频创业"],
  authors: [{ name: "创业导航" }],
  openGraph: {
    title: "创业导航 | 普通人也能上手的创业项目库",
    description: "发现可落地的创业项目，找到一起干的小伙伴。持续更新，小白友好。",
    url: "https://literate-parakeet-mu.vercel.app",
    siteName: "创业导航",
    locale: "zh_CN",
    type: "website",
    images: [
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
        <AiChatWidget />
      </body>
    </html>
  )
}
