import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { NextRequest, NextResponse } from "next/server"

// GET - 获取项目评论列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("project_id")

    if (!projectId) {
      return NextResponse.json({ error: "缺少项目ID" }, { status: 400 })
    }

    const { data: comments, error } = await supabase
      .from("comments")
      .select(`
        id,
        content,
        parent_id,
        created_at,
        user_id
      `)
      .eq("project_id", projectId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Fetch comments error:", error)
      return NextResponse.json({ error: "获取评论失败" }, { status: 500 })
    }

    // 用 admin client 绕过 RLS 批量获取用户昵称
    const userIds = [...new Set((comments || []).map((c: any) => c.user_id).filter(Boolean))]
    const profileMap = new Map<string, string>()
    if (userIds.length > 0) {
      try {
        const adminClient = createAdminClient()
        const { data: profiles } = await adminClient
          .from("profiles")
          .select("id, nickname")
          .in("id", userIds)
        ;(profiles || []).forEach((p: any) => profileMap.set(p.id, p.nickname))
      } catch {
        // admin client 不可用时降级为匿名
      }
    }

    const formatted = (comments || []).map((c: any) => ({
      id: c.id,
      content: c.content,
      parent_id: c.parent_id,
      created_at: c.created_at,
      user: {
        id: c.user_id,
        nickname: profileMap.get(c.user_id) || "匿名用户",
      },
    }))

    return NextResponse.json({ comments: formatted })
  } catch (error) {
    console.error("Comments GET error:", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// POST - 发表评论
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { project_id, content, parent_id } = await request.json()

    if (!project_id || !content?.trim()) {
      return NextResponse.json({ error: "缺少必要参数" }, { status: 400 })
    }

    if (content.trim().length > 500) {
      return NextResponse.json({ error: "评论内容不能超过500字" }, { status: 400 })
    }

    // 获取用户昵称
    const { data: profile } = await supabase
      .from("profiles")
      .select("nickname")
      .eq("id", user.id)
      .single()

    const { data: comment, error } = await supabase
      .from("comments")
      .insert({
        project_id,
        user_id: user.id,
        content: content.trim(),
        parent_id: parent_id || null,
      })
      .select("id, content, parent_id, created_at, user_id")
      .single()

    if (error) {
      console.error("Insert comment error:", error)
      return NextResponse.json({ error: "发表评论失败" }, { status: 500 })
    }

    return NextResponse.json({
      comment: {
        id: comment.id,
        content: comment.content,
        parent_id: comment.parent_id,
        created_at: comment.created_at,
        user: {
          id: user.id,
          nickname: profile?.nickname || "匿名用户",
        },
      },
    })
  } catch (error) {
    console.error("Comments POST error:", error)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// DELETE - 删除评论
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const commentId = searchParams.get("id")

    if (!commentId) {
      return NextResponse.json({ error: "缺少评论ID" }, { status: 400 })
    }

    // 验证是本人
    const { data: comment } = await supabase
      .from("comments")
      .select("user_id")
      .eq("id", commentId)
      .single()

    if (!comment) {
      return NextResponse.json({ error: "评论不存在" }, { status: 404 })
    }

    if (comment.user_id !== user.id) {
      return NextResponse.json({ error: "只能删除自己的评论" }, { status: 403 })
    }

    await supabase.from("comments").delete().eq("id", commentId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Delete comment error:", error)
    return NextResponse.json({ error: "删除失败" }, { status: 500 })
  }
}
