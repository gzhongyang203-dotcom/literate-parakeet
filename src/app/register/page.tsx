"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Smartphone, Lock, User, Gift, Share2, TrendingUp } from "lucide-react"

// 格式化手机号为中国 E.164 格式
function formatPhone(raw: string): string {
  let digits = raw.replace(/\D/g, "")
  if (digits.startsWith("86") && digits.length > 11) {
    digits = digits.slice(2)
  }
  return `+86${digits}`
}

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get("code") || ""

  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    setError("")
    const digits = phone.replace(/\D/g, "")
    if (digits.length !== 11) {
      setError("请输入正确的11位手机号")
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

      const { error: signUpErr } = await supabase.auth.signUp({
        phone: formattedPhone,
        password,
        options: {
          data: {
            nickname: nickname || `用户${digits.slice(-4)}`,
            invite_code: inviteCode,
          },
        },
      })

      if (signUpErr) {
        if (signUpErr.message?.includes("provider") || signUpErr.message?.includes("not enabled")) {
          throw new Error("短信服务未配置，请联系管理员。或尝试使用密码登录。")
        }
        throw signUpErr
      }

      setSuccess(true)
    } catch (e: any) {
      setError(e.message || "注册失败")
    }
    setLoading(false)
  }

  const handleGoToLogin = () => {
    router.push("/login")
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <Card className="w-full max-w-md border-primary/10 shadow-xl">
        <CardHeader className="text-center space-y-2">
          {/* 代理邀请标识 */}
          {inviteCode && (
            <div className="mx-auto mb-2 px-4 py-1.5 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-full inline-flex items-center gap-1.5">
              <Gift className="h-3.5 w-3.5 text-purple-600" />
              <span className="text-xs font-medium text-purple-700">代理邀请注册</span>
              <span className="text-xs text-purple-500 font-mono">{inviteCode.slice(0, 8)}...</span>
            </div>
          )}

          {success ? (
            <div className="space-y-4 py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
                <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-xl">注册成功！</CardTitle>
              <CardDescription className="text-sm">
                注册成功！已自动登录，正在跳转...
              </CardDescription>
              <Button className="w-full" onClick={() => { router.push("/dashboard"); router.refresh() }}>
                进入工作台
              </Button>
            </div>
          ) : (
            <>
              <CardTitle className="text-2xl">
                {inviteCode ? "加入代理网络" : "注册创业导航"}
              </CardTitle>
              <CardDescription>
                {inviteCode
                  ? "注册后自动与邀请人建立代理关系，享受分佣权益"
                  : "用手机号注册，即可浏览全部创业项目"}
              </CardDescription>

              {/* 价值展示 - 仅代理邀请时显示 */}
              {inviteCode && (
                <div className="grid grid-cols-3 gap-2 py-2">
                  <div className="text-center p-2 rounded-lg bg-blue-50">
                    <Share2 className="h-4 w-4 mx-auto mb-1 text-blue-600" />
                    <p className="text-[10px] text-blue-700 font-medium">推广获客</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-green-50">
                    <TrendingUp className="h-4 w-4 mx-auto mb-1 text-green-600" />
                    <p className="text-[10px] text-green-700 font-medium">分佣收益</p>
                  </div>
                  <div className="text-center p-2 rounded-lg bg-purple-50">
                    <Gift className="h-4 w-4 mx-auto mb-1 text-purple-600" />
                    <p className="text-[10px] text-purple-700 font-medium">专属权益</p>
                  </div>
                </div>
              )}

              {/* 注册表单 */}
              <div className="space-y-3 pt-2">
                {/* 手机号 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">手机号</label>
                  <div className="relative">
                    <Smartphone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="tel"
                      placeholder="输入11位手机号"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 11))}
                      className="pl-9"
                    />
                  </div>
                </div>

                {/* 密码 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">设置密码</label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="password"
                      placeholder="至少6位密码"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => { if (e.key === "Enter") handleRegister() }}
                    />
                  </div>
                </div>

                {/* 昵称 */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium">昵称（选填）</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      type="text"
                      placeholder="给自己起个名字吧"
                      value={nickname}
                      onChange={(e) => setNickname(e.target.value)}
                      className="pl-9"
                      onKeyDown={(e) => { if (e.key === "Enter") handleRegister() }}
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">{error}</div>
                )}

                <Button className="w-full" size="lg" onClick={handleRegister} disabled={loading}>
                  {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                  {inviteCode ? "注册并加入代理网络" : "注册"}
                </Button>

                {/* 微信注册 */}
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
                  微信扫码注册
                </a>

                <p className="text-xs text-center text-muted-foreground pt-2">
                  已有账号？{" "}
                  <button onClick={handleGoToLogin} className="text-primary hover:underline font-medium">
                    立即登录
                  </button>
                </p>
              </div>
            </>
          )}
        </CardHeader>
        <CardContent>{/* placeholder */}</CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense fallback={
      <div className="flex justify-center items-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    }>
      <RegisterForm />
    </Suspense>
  )
}
