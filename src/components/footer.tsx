import { Logo } from "@/components/logo"

export function Footer() {
  return (
    <footer className="border-t py-8 mt-16">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <Logo size="sm" />
            <p className="text-sm text-muted-foreground mt-3">
              普通人也能上手的创业项目库。可落地、有步骤、有人一起干。
            </p>
          </div>
          <div>
            <h3 className="font-medium mb-3">快速导航</h3>
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href="/projects" className="block hover:text-primary">项目库</a>
              <a href="/collaborate" className="block hover:text-primary">协作广场</a>
              <a href="/community" className="block hover:text-primary">社区讨论</a>
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
        <div className="border-t mt-8 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} 创业导航. 保留所有权利.
        </div>
      </div>
    </footer>
  )
}
