import { createClient as supabaseCreateClient } from "@supabase/supabase-js"
import type { SupabaseClient } from "@supabase/supabase-js"

// Service Role Key 客户端，绕过 RLS 策略
// 仅用于服务端 API 路由，切勿在前端使用！

/**
 * 获取 admin client（安全版本，不抛异常）
 * 返回 null 表示 Service Role Key 未配置
 */
export function getAdminClient(): SupabaseClient | null {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return null
  }

  return supabaseCreateClient(supabaseUrl, serviceRoleKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}

/**
 * @deprecated 使用 getAdminClient() 代替，它会返回 null 而不是抛异常
 */
export function createAdminClient(): SupabaseClient {
  const client = getAdminClient()
  if (!client) {
    throw new Error("SUPABASE_SERVICE_ROLE_KEY 未配置，请在 .env.local 和 Vercel 环境变量中添加")
  }
  return client
}
