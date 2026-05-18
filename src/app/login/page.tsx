"use client"

import { Suspense, useState, useEffect, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Smartphone, Lock, ShieldCheck } from "lucide-react"

// 格式化手机号为中国 E.164 格式
function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("86") && digits.length > 11) {
    digits = digits.slice(2)
  }
  return `+86${digits}`
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialTab = searchParams.get("tab") === "register" ? "register" : "login"
  const redirect = searchParams.get("redirect") || "/"
  const inviteCode = searchParams.get("code") || ""
  const errorParam = searchParams.get("error") || ""

  const [tab, setTab] = useState<"login" | "register">(initialTab)
  // 登录模式下的子模式
  const [loginMode, setLoginMode] = useState<"code" | "password">("code")
  const [phone, setPhone] = useState("")
  const [code, setCode] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(errorParam)
  const [message, setMessage] = useState("")
  // 验证码倒计时
  const [countdown, setCountdown] = useState(0)
  const [codeSent, setCodeSent] = useState(false)

  // 倒计时
  useEffect(() => {
    if (countdown <= 0) return
    const timer = setTimeout(() => setCountdown(countdown - 1), 1000)
    return () => clearTimeout(timer)
  }, [countdown])

  // 发送验证码
  const sendCode = useCallback(async () => {
    setError("")
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 11) {
      setError("请输入正确的11位手机号")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const formattedPhone = formatPhone(phone)
      const { error: err } = await supabase.auth.signInWithOtp({
        phone: formattedPhone,
        options: {
          shouldCreateUser: tab === "register",
          channel: "sms",
        },
      })
      if (err) throw err
      setCodeSent(true)
      setCountdown(60)
      setMessage("验证码已发送，请注意查收短信")
    } catch (e: any) {
      if (e.message?.includes("provider") || e.message?.includes("not enabled")) {
        setError("短信服务未配置，请先用密码登录。管理员请配置 Supabase SMS Provider")
      } else {
        setError(e.message || "发送验证码失败")
      }
    }
    setLoading(false)
  }, [phone, tab])

  // 验证码登录
  const handleCodeLogin = async () => {
    setError("")
    setMessage("")
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 11) {
      setError("请输入正确的11位手机号")
      return
    }
    if (!code || code.length < 6) {
      setError("请输入6位验证码")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const formattedPhone = formatPhone(phone)
      const { error: err } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: "sms",
      })
      if (err) throw err
      router.push(redirect)
      router.refresh()
    } catch (e: any) {
      setError(e.message || "验证失败，请检查验证码")
    }
    setLoading(false)
  }

  // 密码登录
  const handlePasswordLogin = async () => {
    setError("")
    setMessage("")
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 11) {
      setError("请输入正确的11位手机号")
      return
    }
    if (!password) {
      setError("请输入密码")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const formattedPhone = formatPhone(phone)
      const { error: err } = await supabase.auth.signInWithPassword({
        phone: formattedPhone,
        password,
      })
      if (err) throw err
      router.push(redirect)
      router.refresh()
    } catch (e: any) {
      setError(e.message || "登录失败，请检查手机号或密码")
    }
    setLoading(false)
  }

  // 验证码注册（先设密码）
  const handleCodeRegister = async () => {
    setError("")
    setMessage("")
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 11) {
      setError("请输入正确的11位手机号")
      return
    }
    if (!code || code.length < 6) {
      setError("请输入6位验证码")
      return
    }
    if (!password || password.length < 6) {
      setError("请设置至少6位密码")
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const formattedPhone = formatPhone(phone)

      // 先验证手机号
      const { error: verifyErr } = await supabase.auth.verifyOtp({
        phone: formattedPhone,
        token: code,
        type: "sms",
      })
      if (verifyErr) throw verifyErr

      // 验证通过后更新密码
      const { error: updateErr } = await supabase.auth.updateUser({
        password,
        data: {
          nickname: `用户${digits.slice(-4)}`,
          invite_code: inviteCode,
        },
      })
      if (updateErr) throw updateErr

      setMessage("注册成功！正在跳转...")
      setTimeout(() => {
        router.push(redirect)
        router.refresh()
      }, 1000)
    } catch (e: any) {
      setError(e.message || "注册失败")
    }
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-10 sm:py-16 flex justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">{tab === "login" ? "登录" : "注册"}</CardTitle>
          <CardDescription>
            {tab === "login" ? "登录后浏览全部创业项目" : "注册后即可浏览全部创业项目"}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* 登录/注册 切换 */}
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

          {/* 登录模式：验证码/密码 子切换 */}
          {tab === "login" && (
            <div className="flex gap-1 bg-muted rounded-lg p-1">
              <button
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  loginMode === "code" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setLoginMode("code")}
              >
                验证码登录
              </button>
              <button
                className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-colors ${
                  loginMode === "password" ? "bg-background shadow-sm" : "text-muted-foreground"
                }`}
                onClick={() => setLoginMode("password")}
              >
                密码登录
              </button>
            </div>
          )}

          {/* 手机号 */}
          <div className="space-y-2">
            <label className="text-sm font-medium">手机号</label>
            <div className="relative">
              <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="tel"
                placeholder="输入11位手机号"
                value={phone}
                onChange={(e) => {
                  // 只允许数字，最多11位
                  const v = e.target.value.replace(/\D/g, "").slice(0, 11)
                  setPhone(v)
                }}
                className="pl-9"
              />
            </div>
          </div>

          {/* 验证码输入 - 登录验证码模式 或 注册模式 */}
          {(tab === "register" || (tab === "login" && loginMode === "code")) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">验证码</label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <ShieldCheck className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    inputMode="numeric"
                    maxLength={6}
                    placeholder="输入6位验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 6))}
                    className="pl-9"
                  />
                </div>
                <Button
                  variant="outline"
                  className="shrink-0"
                  onClick={sendCode}
                  disabled={loading || countdown > 0 || phone.replace(/\D/g, "").length !== 11}
                >
                  {countdown > 0 ? `${countdown}s` : codeSent ? "重新发送" : "发送验证码"}
                </Button>
              </div>
            </div>
          )}

          {/* 密码输入 - 注册模式 或 登录密码模式 */}
          {(tab === "register" || (tab === "login" && loginMode === "password")) && (
            <div className="space-y-2">
              <label className="text-sm font-medium">
                {tab === "register" ? "设置密码" : "密码"}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder={tab === "register" ? "至少6位密码" : "输入密码"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-9"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      if (tab === "register") handleCodeRegister()
                      else if (loginMode === "code") handleCodeLogin()
                      else handlePasswordLogin()
                    }
                  }}
                />
              </div>
            </div>
          )}

          {error && <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>}
          {message && <div className="text-sm text-green-600 bg-green-50 p-3 rounded-md">{message}</div>}

          {/* 操作按钮 */}
          <Button
            className="w-full"
            size="lg"
            onClick={() => {
              if (tab === "register") handleCodeRegister()
              else if (loginMode === "code") handleCodeLogin()
              else handlePasswordLogin()
            }}
            disabled={loading}
          >
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            {tab === "register" ? "注册" : "登录"}
          </Button>

          {/* 登录模式切换提示 */}
          {tab === "login" && (
            <p className="text-xs text-center text-muted-foreground">
              还没有账号？{" "}
              <button
                onClick={() => setTab("register")}
                className="text-primary hover:underline font-medium"
              >
                立即注册
              </button>
            </p>
          )}
          {tab === "register" && (
            <p className="text-xs text-center text-muted-foreground">
              已有账号？{" "}
              <button
                onClick={() => setTab("login")}
                className="text-primary hover:underline font-medium"
              >
                立即登录
              </button>
            </p>
          )}

          {/* 微信登录（备选） */}
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
            微信扫码登录
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
