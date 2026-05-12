"use client"

import { useEffect, useState } from "react"

// 虚拟评价数据
const VIRTUAL_REVIEWS = [
  {
    name: "张同学",
    location: "深圳",
    avatar: "张",
    rating: 5,
    project: "闲鱼AI代写项目",
    comment: "教程非常详细！跟着做了一周就出单了，效果超出预期！客服态度也很好",
    date: "3天前",
  },
  {
    name: "李女士",
    location: "广州",
    avatar: "李",
    rating: 5,
    project: "小红书壁纸号项目",
    comment: "终于找到了靠谱的副业教程！现在每天稳定有收益，感谢勿念团队！",
    date: "5天前",
  },
  {
    name: "王先生",
    location: "北京",
    avatar: "王",
    rating: 5,
    project: "抖音带货教程",
    comment: "项目很全，更新也及时，值这个价！已经推荐给朋友了",
    date: "1周前",
  },
  {
    name: "赵学员",
    location: "上海",
    avatar: "赵",
    rating: 5,
    project: "创业者套餐订阅",
    comment: "社群氛围很好，大家互相交流进步！老师很专业，给了很多实用建议",
    date: "1周前",
  },
  {
    name: "周网友",
    location: "杭州",
    avatar: "周",
    rating: 5,
    project: "闲鱼无货源项目",
    comment: "性价比超高，比外面几千块的课都好！已经赚回学费了",
    date: "2周前",
  },
  {
    name: "吴用户",
    location: "成都",
    avatar: "吴",
    rating: 5,
    project: "知识付费项目",
    comment: "教程非常详细，小白也能看懂。已经赚了3000多了！",
    date: "2周前",
  },
]

interface ReviewCardProps {
  review: (typeof VIRTUAL_REVIEWS)[0]
  isNew?: boolean
}

function ReviewCard({ review, isNew }: ReviewCardProps) {
  return (
    <div
      className={`bg-white rounded-xl border p-4 ${
        isNew ? "border-green-200 bg-green-50/50" : "border-gray-100"
      }`}
    >
      <div className="flex items-start gap-3">
        {/* 头像 */}
        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm">
          {review.avatar}
        </div>

        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <span className="font-medium text-sm">{review.name}</span>
              <span className="text-xs text-muted-foreground ml-2">
                {review.location}
              </span>
            </div>
            <div className="flex text-yellow-400 text-xs">
              {"⭐".repeat(review.rating)}
            </div>
          </div>

          <p className="text-xs text-primary/70 mt-1">
            评价项目：{review.project}
          </p>

          <p className="text-sm text-gray-700 mt-2 leading-relaxed">
            "{review.comment}"
          </p>

          <div className="flex items-center justify-between mt-3">
            <span className="text-xs text-gray-400">{review.date}</span>
            {isNew && (
              <span className="text-xs bg-green-100 text-green-600 px-2 py-0.5 rounded-full">
                最新
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectReviews({ projectId }: { projectId?: string }) {
  const [reviews, setReviews] = useState(VIRTUAL_REVIEWS.slice(0, 4))
  const [filter, setFilter] = useState<"all" | "positive">("all")

  useEffect(() => {
    // 模拟实时更新评价
    const interval = setInterval(() => {
      const randomReview = VIRTUAL_REVIEWS[Math.floor(Math.random() * VIRTUAL_REVIEWS.length)]
      const newReview = {
        ...randomReview,
        date: "刚刚",
        name: randomReview.name + Math.floor(Math.random() * 100),
      }
      setReviews((current) => [newReview, ...current.slice(0, 3)])
    }, 15000)

    return () => clearInterval(interval)
  }, [])

  const filteredReviews = filter === "positive"
    ? reviews.filter(r => r.rating === 5)
    : reviews

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="font-bold">学员评价</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full">
            {VIRTUAL_REVIEWS.length}+ 条
          </span>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              filter === "all"
                ? "bg-primary text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter("positive")}
            className={`text-xs px-3 py-1 rounded-full transition-colors ${
              filter === "positive"
                ? "bg-green-500 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            好评优先
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredReviews.map((review, index) => (
          <ReviewCard key={`${review.name}-${index}`} review={review} isNew={index === 0} />
        ))}
      </div>

      <div className="text-center">
        <button className="text-sm text-primary hover:underline">
          查看全部 {VIRTUAL_REVIEWS.length}+ 条评价 →
        </button>
      </div>
    </div>
  )
}

// 简化的评价展示（用于首页）
export function MiniReviews() {
  const displayReviews = VIRTUAL_REVIEWS.slice(0, 3)

  return (
    <div className="space-y-3">
      {displayReviews.map((review, index) => (
        <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white text-xs font-bold">
            {review.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{review.name}</span>
              <span className="text-yellow-400 text-xs">{"⭐".repeat(review.rating)}</span>
            </div>
            <p className="text-xs text-muted-foreground truncate">
              "{review.comment.slice(0, 30)}..."
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
