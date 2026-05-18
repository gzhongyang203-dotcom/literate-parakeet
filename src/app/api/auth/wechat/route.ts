import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET() {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.VERCEL_URL ||
    "http://localhost:3000"

  // Ensure siteUrl has protocol
  const origin = siteUrl.startsWith("http") ? siteUrl : `https://${siteUrl}`

  try {
    const supabase = await createClient()

    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "wechat",
      options: {
        redirectTo: `${origin}/auth/callback`,
      },
    })

    if (error) {
      return NextResponse.redirect(
        new URL(`/login?error=${encodeURIComponent(error.message)}`, origin)
      )
    }

    // supabase returns the WeChat OAuth URL
    return NextResponse.redirect(data.url)
  } catch (e: any) {
    return NextResponse.redirect(
      new URL(`/login?error=${encodeURIComponent(e.message || "微信登录失败")}`, origin)
    )
  }
}
