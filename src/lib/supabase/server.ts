import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === "your_supabase_url") {
    // Return a mock client when Supabase is not configured
    const { createClient: createMock } = await import("./mock")
    return createMock()
  }

  const cookieStore = await cookies()

  return createServerClient(
    supabaseUrl,
    supabaseKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Can be ignored if middleware handles sessions
          }
        },
      },
      // 全局 fetch 超时: 5秒（Server Component 场景）
      global: {
        fetch: (url, options) => {
          const controller = new AbortController()
          const timeoutId = setTimeout(() => controller.abort(), 5000)
          return fetch(url, {
            ...options,
            signal: controller.signal,
          }).finally(() => clearTimeout(timeoutId))
        },
      },
    }
  )
}
