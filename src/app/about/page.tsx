import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AboutPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <h1 className="text-3xl font-bold mb-8">关于创业导航</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>这是做什么的？</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              创业导航是一个持续更新的创业项目库。每一个项目都是可落地的——
              有具体步骤、工具清单、收入预期。不用再到处搜"做什么副业好"，
              这里整理好了可以直接开干的项目。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>为什么做这个？</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              创始人自己也在探索副业和创业。在搜项目、试项目的过程发现一个问题：
              好项目太散了——这个博主说一个，那个文章写一个，没有一个地方能集中看到
              可执行的创业项目清单。
            </p>
            <p className="text-muted-foreground leading-relaxed mt-3">
              所以自己搭了这个平台。一边整理自己试过的项目，一边收集别人跑通的经验，
              全部用一个标准化模板写清楚，让后来的人少走弯路。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>收费吗？</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground leading-relaxed">
              <strong>目前全部免费。</strong>所有项目都可以直接查看。
            </p>
            <p className="text-muted-foreground leading-relaxed mt-2">
              未来可能会对**新上线的项目**设置付费订阅（老项目一直免费）。
              订阅费用会很低（大概一杯奶茶钱/月），用来覆盖服务器成本和激励创作者。
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>如何参与？</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                1
              </div>
              <div>
                <p className="font-medium">浏览项目</p>
                <p className="text-sm text-muted-foreground">在项目库中找到感兴趣的</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                2
              </div>
              <div>
                <p className="font-medium">组队协作</p>
                <p className="text-sm text-muted-foreground">申请参与项目，找到志同道合的队友</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="flex-shrink-0 w-6 h-6 rounded-full bg-primary text-primary-foreground text-xs flex items-center justify-center font-bold mt-0.5">
                3
              </div>
              <div>
                <p className="font-medium">开干</p>
                <p className="text-sm text-muted-foreground">按照步骤执行，跑通后分享经验</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>联系我</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              有问题、建议，或者想投稿自己的创业项目，欢迎在社区发帖或直接留言。
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
