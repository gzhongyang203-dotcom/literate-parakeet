import { createClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// ===== 类型定义 =====
interface ProjectInput {
  title: string
  category: string
  difficulty: string
  hook: string
  income_estimate: string
  content: string
  is_premium?: boolean
  is_featured?: boolean
  is_practitioner_recommended?: boolean
  recommend_reason?: string
  tools_required?: string[]
}

// GET /api/projects - 获取我的项目列表
export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status") // published | draft | all

    let query = supabase
      .from("projects")
      .select("id, title, category, difficulty, status, hook, income_estimate, is_premium, is_featured, is_practitioner_recommended, created_at, updated_at")
      .eq("author_id", user.id)
      .order("updated_at", { ascending: false })

    if (status && status !== "all") {
      query = query.eq("status", status)
    }

    const { data, error } = await query

    if (error) {
      console.error("GET projects error:", error)
      return NextResponse.json({ error: "获取项目列表失败" }, { status: 500 })
    }

    return NextResponse.json({ projects: data || [] })
  } catch (err) {
    console.error("Projects GET error:", err)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// POST /api/projects - 创建新项目
export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const body: ProjectInput = await request.json()

    // 参数验证
    if (!body.title?.trim()) {
      return NextResponse.json({ error: "请填写项目标题" }, { status: 400 })
    }
    if (!body.category?.trim()) {
      return NextResponse.json({ error: "请选择项目分类" }, { status: 400 })
    }
    if (!body.hook?.trim()) {
      return NextResponse.json({ error: "请填写一句话钩子" }, { status: 400 })
    }
    if (body.title.trim().length > 100) {
      return NextResponse.json({ error: "标题不能超过100字" }, { status: 400 })
    }
    if (body.hook.trim().length > 200) {
      return NextResponse.json({ error: "钩子不能超过200字" }, { status: 400 })
    }

    const now = new Date().toISOString()

    const { data, error } = await supabase
      .from("projects")
      .insert({
        title: body.title.trim(),
        category: body.category,
        difficulty: body.difficulty || "初级",
        hook: body.hook.trim(),
        income_estimate: body.income_estimate || "",
        content: body.content || "",
        is_premium: body.is_premium || false,
        is_featured: false, // 用户不能设推荐
        is_practitioner_recommended: false, // 用户不能设推荐
        recommend_reason: body.recommend_reason || "",
        status: "draft", // 用户创建默认为草稿
        author_id: user.id,
        created_at: now,
        updated_at: now,
      })
      .select("id, title, category, difficulty, status, hook, income_estimate, created_at")
      .single()

    if (error) {
      console.error("Create project error:", error)
      return NextResponse.json({ error: "创建项目失败: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ project: data })
  } catch (err) {
    console.error("Projects POST error:", err)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// PUT /api/projects - 更新项目
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const body: { id: string } & Partial<ProjectInput> = await request.json()

    if (!body.id) {
      return NextResponse.json({ error: "缺少项目ID" }, { status: 400 })
    }

    // 验证项目归属
    const { data: existing } = await supabase
      .from("projects")
      .select("author_id, status")
      .eq("id", body.id)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 })
    }
    if (existing.author_id !== user.id) {
      return NextResponse.json({ error: "无权编辑此项目" }, { status: 403 })
    }

    // 只允许更新部分字段（用户不能改 is_featured / is_practitioner_recommended）
    const updates: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    }

    const allowedFields: (keyof ProjectInput)[] = [
      "title", "category", "difficulty", "hook", "income_estimate", "content", "is_premium", "recommend_reason"
    ]

    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updates[field] = typeof body[field] === "string" ? (body[field] as string).trim() : body[field]
      }
    }

    // 状态：用户可以将草稿提交为待审核（pending），但不能直接发布
    if (body.status && existing.status === "draft" && body.status === "pending") {
      updates.status = "pending"
    }

    const { data, error } = await supabase
      .from("projects")
      .update(updates)
      .eq("id", body.id)
      .select("id, title, category, difficulty, status, hook, income_estimate, updated_at")
      .single()

    if (error) {
      console.error("Update project error:", error)
      return NextResponse.json({ error: "更新项目失败: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ project: data })
  } catch (err) {
    console.error("Projects PUT error:", err)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}

// DELETE /api/projects - 删除项目
export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "请先登录" }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const projectId = searchParams.get("id")

    if (!projectId) {
      return NextResponse.json({ error: "缺少项目ID" }, { status: 400 })
    }

    // 验证项目归属
    const { data: existing } = await supabase
      .from("projects")
      .select("author_id")
      .eq("id", projectId)
      .single()

    if (!existing) {
      return NextResponse.json({ error: "项目不存在" }, { status: 404 })
    }
    if (existing.author_id !== user.id) {
      return NextResponse.json({ error: "无权删除此项目" }, { status: 403 })
    }

    const { error } = await supabase
      .from("projects")
      .delete()
      .eq("id", projectId)

    if (error) {
      console.error("Delete project error:", error)
      return NextResponse.json({ error: "删除失败: " + error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error("Projects DELETE error:", err)
    return NextResponse.json({ error: "服务器错误" }, { status: 500 })
  }
}
