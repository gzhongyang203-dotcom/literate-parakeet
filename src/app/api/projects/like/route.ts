import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// POST - 点赞/取消点赞 toggle
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { project_id } = await request.json()
    if (!project_id) {
      return NextResponse.json({ error: "缺少项目ID" }, { status: 400 })
    }

    // 检查是否已点赞
    const { data: existing } = await supabase
      .from("likes")
      .select("id")
      .eq("project_id", project_id)
      .eq("user_id", user.id)
      .single()

    if (existing) {
      // 已点赞 → 取消
      await supabase.from("likes").delete().eq("id", existing.id)
      return NextResponse.json({ liked: false, action: "unliked" })
    } else {
      // 未点赞 → 点赞
      await supabase.from("likes").insert({
        project_id,
        user_id: user.id,
      })
      return NextResponse.json({ liked: true, action: "liked" })
    }
  } catch (error) {
    console.error("Like toggle error:", error)
    return NextResponse.json({ error: "操作失败" }, { status: 500 })
  }
}

// GET - 获取点赞状态和数量
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("project_id")

    if (!projectId) {
      return NextResponse.json({ error: "缺少项目ID" }, { status: 400 })
    }

    // 点赞总数
    const { count: likeCount } = await supabase
      .from("likes")
      .select("*", { count: "exact", head: true })
      .eq("project_id", projectId)

    // 当前用户是否已点赞
    const { data: { user } } = await supabase.auth.getUser()
    let userLiked = false
    if (user) {
      const { data } = await supabase
        .from("likes")
        .select("id")
        .eq("project_id", projectId)
        .eq("user_id", user.id)
        .single()
      userLiked = !!data
    }

    return NextResponse.json({
      like_count: likeCount || 0,
      user_liked: userLiked,
    })
  } catch (error) {
    console.error("Like status error:", error)
    return NextResponse.json({ error: "获取失败" }, { status: 500 })
  }
}
