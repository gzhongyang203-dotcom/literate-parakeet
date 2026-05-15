"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, Lock } from "lucide-react"

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login"
  const redirect = searchParams.get("redirect") || "/"
  const inviteCode = searchParams.get("code") || ""

  const [tab, setTab] = useState<"login" | "register">(initialTab)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const handleLogin = async () => {
    setError("")
    setMessage("")
    if (!email || !password) {
      setError("请填写邮箱和密码")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signInWithPassword({ email, password })
      if (err) throw err
      router.push(redirect)
      router.refresh()
    } catch (e: any) {
      setError(e.message || "登录失败")
    }
    setLoading(false)
  }

  const handleRegister = async () => {
    setError("")
    setMessage("")
    if (!email || !password) {
      setError("请填写邮箱和密码")
      return
    }
    if (password.length < 6) {
      setError("密码至少6位")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { error: err } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            nickname: email.split("@")[0],
            invite_code: inviteCode,
          },
        },
      })
      if (err) throw err
      setMessage("注册成功！请检查邮箱确认注册。如已确认，请直接登录。")
    } catch (e: any) {
      setError(e.message || "注册失败")
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{tab === "login" ? "登录" : "注册"}</CardTitle>
          <CardDescription>
            {tab === "login" ? "登录后浏览项目和参与协作" : "注册后即可浏览全部创业项目"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex rounded-lg border p-1">
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "login" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
              onClick={() => setTab("login")}
            >
              登录
            </button>
            <button
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-colors ${
                tab === "register" ? "bg-primary text-primary-foreground" : "text-muted-foreground"
              }`}
              onClick={() => setTab("register")}
            >
              注册
            </button>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">邮箱</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">密码</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="password"
                placeholder={tab === "register" ? "至少6位密码" : "输入密码"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          {message && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</div>}

          <Button className="w-full" size="lg" onClick={tab === "login" ? handleLogin : handleRegister} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {tab === "login" ? "登录" : "注册"}
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}
