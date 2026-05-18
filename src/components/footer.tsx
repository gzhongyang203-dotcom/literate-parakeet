import Link from "next/link"
import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="border-t py-6 sm:py-8 mt-12 sm:mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 sm:gap-8">
          <div>
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground mt-3">
              普通人也能上手的创业项目库。可落地、有步骤、有人一起干。
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-3">快速导航</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <Link href="/projects" className="block hover:text-primary py-0.5">项目库</Link>
              <Link href="/collaborate" className="block hover:text-primary py-0.5">协作广场</Link>
              <Link href="/community" className="block hover:text-primary py-0.5">社区讨论</Link>
            </div>
          </div>
          <div>
            <h3 className="font-medium mb-3">关于</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>一个持续更新的创业项目平台</p>
              <p>内容持续更新 · 项目可落地 · 社区可协作</p>
            </div>
          </div>
        </div>
        <div className="border-t mt-6 sm:mt-8 pt-4 sm:pt-6 text-center text-xs sm:text-sm text-muted-foreground">
          © {new Date().getFullYear()} 创业导航. 保留所有权利.
        </div>
      </div>
    </footer>
  )
}
