import { createBrowserClient } from "@supabase/ssr"
import { createClient as createMock } from "./mock"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey || supabaseUrl === "your_supabase_url") {
    return createMock()
  }

  return createBrowserClient(supabaseUrl, supabaseKey)
}
