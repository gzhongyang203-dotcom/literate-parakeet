"use client"

import { AdminSidebar } from "@/components/admin/sidebar"
import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Loader2 } from "lucide-react"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const [authorized, setAuthorized] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      // In demo mode (no Supabase config), allow admin access
      if (!user) {
        // Check if Supabase is configured
        const url = process.env.NEXT_PUBLIC_SUPABASE_URL
        if (!url || url === "your_supabase_url") {
          setAuthorized(true)
          setLoading(false)
          return
        }
        router.push("/login?redirect=/admin")
        return
      }
      setAuthorized(true)
      setLoading(false)
    }
    checkAuth()
  }, [router])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!authorized) return null

  return (
    <div className="min-h-screen bg-muted/30">
      <AdminSidebar />
      <div className="lg:pl-[70px] transition-all duration-200">
        <div className="p-6 min-h-screen">
          {children}
        </div>
      </div>
    </div>
  )
}
