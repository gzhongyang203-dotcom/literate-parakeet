"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import { User as UserIcon, FileText, Users, LogOut, Loader2 } from "lucide-react"
import Link from "next/link"

export default function DashboardPage() {
  const router = useRouter()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setUser(data.user)
      setLoading(false)
    })
  }, [])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push("/")
    router.refresh()
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user) {
    router.push("/login?redirect=/dashboard")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">个人中心</h1>
          <p className="text-muted-foreground">{user.email}</p>
        </div>
        <Button variant="outline" size="sm" onClick={handleLogout} className="gap-2">
          <LogOut className="h-4 w-4" /> 退出登录
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <FileText className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">浏览的项目</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">开始浏览项目库吧</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <Users className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">协作申请</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">参与项目协作</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center gap-3">
            <UserIcon className="h-5 w-5 text-primary" />
            <CardTitle className="text-sm font-medium">我的项目</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">0</p>
            <p className="text-xs text-muted-foreground">发布自己的项目</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/projects">
          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">浏览项目库</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">发现可落地的创业项目</p>
            </CardContent>
          </Card>
        </Link>
        <Link href="/collaborate">
          <Card className="hover:border-primary/50 transition-all cursor-pointer">
            <CardHeader>
              <CardTitle className="text-lg">协作广场</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground">找队友一起干项目</p>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  )
}
