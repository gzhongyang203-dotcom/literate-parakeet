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

          {/* 微信登录 */}
          <div className="relative py-2">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-card px-2 text-muted-foreground">其他方式</span>
            </div>
          </div>

          <a
            href="/api/auth/wechat"
            className="flex items-center justify-center gap-2 w-full py-2.5 rounded-lg font-medium text-sm transition-colors"
            style={{ backgroundColor: "#07C160", color: "#fff" }}
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.002 5.55a.59.59 0 0 1 .213.665l-.39 1.48c-.019.07-.048.141-.048.213 0 .163.13.295.29.295a.326.326 0 0 0 .167-.054l1.903-1.114a.864.864 0 0 1 .717-.098 10.16 10.16 0 0 0 2.837.403c.276 0 .543-.027.811-.05-.857-2.578.157-4.972 1.932-6.446 1.703-1.415 3.882-1.98 5.853-1.838-.576-3.583-4.196-6.348-8.596-6.348zM5.785 5.991c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178A1.17 1.17 0 0 1 4.623 7.17c0-.651.52-1.18 1.162-1.18zm5.813 0c.642 0 1.162.529 1.162 1.18a1.17 1.17 0 0 1-1.162 1.178 1.17 1.17 0 0 1-1.162-1.178c0-.651.52-1.18 1.162-1.18zm3.547 4.371c-2.759 0-5.018 2.049-5.018 4.556 0 2.508 2.259 4.557 5.018 4.557.854 0 1.66-.192 2.407-.557a.77.77 0 0 1 .638-.086l1.691.975a.29.29 0 0 0 .148.047c.166 0 .29-.13.29-.296 0-.065-.029-.137-.047-.184l-.35-1.295a.52.52 0 0 1 .19-.603C22.027 18.12 23.5 16.579 23.5 14.65c0-2.511-2.256-4.1-5.018-4.1-.677 0-1.334.123-1.95.351a3.117 3.117 0 0 0-.668-.088c-.372 0-.731.056-1.078.159a5.201 5.201 0 0 0-.641-.179zm-1.484 2.42c.49 0 .888.407.888.908a.898.898 0 0 1-.888.907.898.898 0 0 1-.888-.907c0-.501.398-.908.888-.908zm4.105 0c.49 0 .888.407.888.908a.898.898 0 0 1-.888.907.898.898 0 0 1-.888-.907c0-.501.398-.908.888-.908z"/>
            </svg>
            微信{tab === "login" ? "登录" : "注册"}
          </a>
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
