"use client"

import { useEffect, useState, useCallback } from "react"

const VIRTUAL_REVIEWS = [
  {
    name: "张同学", location: "深圳", avatar: "张", rating: 5,
    project: "闲鱼AI代写项目",
    comment: "教程非常详细！跟着做了一周就出单了，效果超出预期！客服态度也很好",
    date: "3天前",
  },
  {
    name: "李女士", location: "广州", avatar: "李", rating: 5,
    project: "小红书壁纸号项目",
    comment: "终于找到了靠谱的副业教程！现在每天稳定有收益，感谢勿念团队！",
    date: "5天前",
  },
  {
    name: "王先生", location: "北京", avatar: "王", rating: 5,
    project: "抖音带货教程",
    comment: "项目很全，更新也及时，值这个价！已经推荐给朋友了",
    date: "1周前",
  },
  {
    name: "赵学员", location: "上海", avatar: "赵", rating: 5,
    project: "创业者套餐订阅",
    comment: "社群氛围很好，大家互相交流进步！老师很专业，给了很多实用建议",
    date: "1周前",
  },
  {
    name: "周网友", location: "杭州", avatar: "周", rating: 5,
    project: "闲鱼无货源项目",
    comment: "性价比超高，比外面几千块的课都好！已经赚回学费了",
    date: "2周前",
  },
  {
    name: "吴用户", location: "成都", avatar: "吴", rating: 5,
    project: "知识付费项目",
    comment: "教程非常详细，小白也能看懂。已经赚了3000多了！",
    date: "2周前",
  },
  {
    name: "陈老板", location: "武汉", avatar: "陈", rating: 5,
    project: "AI绘画变现项目",
    comment: "很用心的团队！看完就马上行动起来了，感谢遇见！",
    date: "3周前",
  },
  {
    name: "刘创客", location: "南京", avatar: "刘", rating: 4,
    project: "短视频剪辑教程",
    comment: "内容很干，没有废话。希望后续能出更多进阶内容",
    date: "3周前",
  },
]

function StarRating({ rating, size = "sm" }: { rating: number; size?: "sm" | "md" }) {
  const sizeClass = size === "md" ? "w-4 h-4" : "w-3.5 h-3.5"
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          className={`${sizeClass} ${star <= rating ? "text-amber-400" : "text-gray-200"}`}
          viewBox="0 0 24 24"
          fill={star <= rating ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth="1.5"
        >
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  )
}

function getUserGradient(name: string): string {
  const gradients = [
    "from-purple-400 to-pink-500",
    "from-blue-400 to-indigo-500",
    "from-green-400 to-teal-500",
    "from-orange-400 to-red-500",
    "from-cyan-400 to-blue-500",
    "from-pink-400 to-rose-500",
    "from-amber-400 to-orange-500",
  ]
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = name.charCodeAt(i) + ((hash << 5) - hash)
  return gradients[Math.abs(hash) % gradients.length]
}

interface ReviewCardProps {
  review: (typeof VIRTUAL_REVIEWS)[0]
  isNew?: boolean
}

function ReviewCard({ review, isNew }: ReviewCardProps) {
  return (
    <div
      className="bg-white rounded-xl border border-gray-100 p-4 hover:border-primary/20 hover:shadow-md transition-all duration-300 group"
      style={isNew ? { animation: "slideInUp 0.4s ease-out" } : undefined}
    >
      <div className="flex items-start gap-3">
        <div
          className={`w-10 h-10 rounded-full bg-gradient-to-br ${getUserGradient(review.name)} flex items-center justify-center text-white font-bold text-sm shrink-0 shadow-sm`}
        >
          {review.avatar}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <span className="font-medium text-sm truncate">{review.name}</span>
              <span className="text-xs text-muted-foreground shrink-0">{review.location}</span>
              {isNew && (
                <span className="text-[10px] bg-green-100 text-green-600 px-1.5 py-0.5 rounded-full shrink-0 font-medium">
                  最新
                </span>
              )}
            </div>
            <StarRating rating={review.rating} />
          </div>

          <p className="text-xs text-primary/60 mt-1">{review.project}</p>

          <p className="text-sm text-gray-700 mt-2 leading-relaxed">{review.comment}</p>

          <div className="mt-2.5">
            <span className="text-xs text-gray-400">{review.date}</span>
          </div>
        </div>
      </div>
    </div>
  )
}

export function ProjectReviews({ projectId }: { projectId?: string }) {
  const [reviews, setReviews] = useState(VIRTUAL_REVIEWS.slice(0, 4))
  const [filter, setFilter] = useState<"all" | "positive">("all")
  const [newIndex, setNewIndex] = useState(-1)

  const addRandomReview = useCallback(() => {
    const randomReview = VIRTUAL_REVIEWS[Math.floor(Math.random() * VIRTUAL_REVIEWS.length)]
    const newReview = {
      ...randomReview,
      date: "刚刚",
      name: randomReview.name + Math.floor(Math.random() * 100),
    }
    setReviews((current) => [newReview, ...current.slice(0, 5)])
    setNewIndex(0)
    setTimeout(() => setNewIndex(-1), 500)
  }, [])

  useEffect(() => {
    const interval = setInterval(addRandomReview, 15000)
    return () => clearInterval(interval)
  }, [addRandomReview])

  const filteredReviews = filter === "positive"
    ? reviews.filter(r => r.rating >= 4)
    : reviews

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-lg">💬</span>
          <h3 className="font-bold">学员评价</h3>
          <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full font-medium">
            {VIRTUAL_REVIEWS.length}+
          </span>
        </div>

        <div className="flex gap-1.5">
          <button
            onClick={() => setFilter("all")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-medium ${
              filter === "all"
                ? "bg-primary text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            全部
          </button>
          <button
            onClick={() => setFilter("positive")}
            className={`text-xs px-3 py-1.5 rounded-full transition-all duration-200 font-medium flex items-center gap-1 ${
              filter === "positive"
                ? "bg-green-500 text-white shadow-sm"
                : "bg-gray-100 text-gray-500 hover:bg-gray-200"
            }`}
          >
            <svg className="w-3 h-3" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>
            好评
          </button>
        </div>
      </div>

      <div className="space-y-3">
        {filteredReviews.map((review, index) => (
          <ReviewCard
            key={`${review.name}-${review.date}-${index}`}
            review={review}
            isNew={index === newIndex}
          />
        ))}
      </div>

      <div className="text-center pt-1">
        <button className="text-sm text-primary/70 hover:text-primary transition-colors flex items-center gap-1 mx-auto">
          查看全部 {VIRTUAL_REVIEWS.length}+ 条评价
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="9 18 15 12 9 6" /></svg>
        </button>
      </div>

      <style jsx global>{`
        @keyframes slideInUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  )
}

export function MiniReviews() {
  const displayReviews = VIRTUAL_REVIEWS.slice(0, 3)

  return (
    <div className="space-y-2.5">
      {displayReviews.map((review, index) => (
        <div
          key={index}
          className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-100 hover:border-primary/10 hover:shadow-sm transition-all duration-200"
        >
          <div
            className={`w-8 h-8 rounded-full bg-gradient-to-br ${getUserGradient(review.name)} flex items-center justify-center text-white text-xs font-bold shrink-0`}
          >
            {review.avatar}
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium truncate">{review.name}</span>
              <StarRating rating={review.rating} />
            </div>
            <p className="text-xs text-muted-foreground truncate mt-0.5">
              {review.comment.slice(0, 30)}...
            </p>
          </div>
        </div>
      ))}
    </div>
  )
}
