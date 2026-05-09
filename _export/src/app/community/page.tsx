import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageSquare, Lightbulb, HelpCircle } from "lucide-react"

const TOPICS = [
  { title: "闲鱼AI代写单子太多做不过来怎么办？", replies: 12, category: "经验交流" },
  { title: "小红书壁纸号流量突然掉了，求诊断", replies: 8, category: "求助" },
  { title: "分享：一个月从0做到月入3000的完整经历", replies: 24, category: "经验交流" },
  { title: "想做情侣向小程序，有没有人一起？", replies: 15, category: "组队" },
  { title: "AI工具更新太快了，大家现在用什么？", replies: 9, category: "讨论" },
  { title: "拼多多虚拟资料店被投诉怎么办？", replies: 5, category: "求助" },
]

export default function CommunityPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">社区</h1>
        <p className="text-muted-foreground">交流创业经验，互相解答问题</p>
      </div>

      {/* Category filters */}
      <div className="flex flex-wrap gap-2 mb-8">
        {["全部", "经验交流", "求助", "讨论", "组队", "资源分享"].map((cat) => (
          <Badge key={cat} variant={cat === "全部" ? "default" : "outline"} className="cursor-pointer">
            {cat}
          </Badge>
        ))}
      </div>

      {/* Topic list */}
      <div className="space-y-3">
        {TOPICS.map((topic, i) => (
          <Card key={i} className="hover:border-primary/50 transition-all cursor-pointer">
            <CardContent className="p-4 flex items-start justify-between">
              <div className="flex items-start gap-3">
                <div className="mt-1">
                  {topic.category === "求助" ? (
                    <HelpCircle className="h-5 w-5 text-amber-500" />
                  ) : topic.category === "经验交流" ? (
                    <Lightbulb className="h-5 w-5 text-blue-500" />
                  ) : (
                    <MessageSquare className="h-5 w-5 text-purple-500" />
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-sm">{topic.title}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge variant="outline" className="text-xs">
                      {topic.category}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap ml-4">
                {topic.replies} 回复
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Placeholder with CTA */}
      <div className="text-center mt-12 py-8 bg-muted/30 rounded-xl">
        <h3 className="font-semibold mb-2">社区即将开放</h3>
        <p className="text-sm text-muted-foreground mb-4">
          注册后即可发帖交流，分享你的创业经历
        </p>
      </div>
    </div>
  )
}
