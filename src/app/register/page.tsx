"use client"

import { Suspense, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { createClient } from "@/lib/supabase/client"
import { Loader2, Mail, Lock, User, Gift, Share2, TrendingUp } from "lucide-react"

function RegisterForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteCode = searchParams.get("code") || ""

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [nickname, setNickname] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)

  const handleRegister = async () => {
    setError("")
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
            nickname: nickname || email.split("@")[0],
            invite_code: inviteCode,
          },
        },
      })
      if (err) throw err
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
              <span className="text-xs font-medium text-purple-700">
                代理邀请注册
              </span>
              <span className="text-xs text-purple-500 font-mono">
                {inviteCode.slice(0, 8)}...
              </span>
            </div>
          )}

          {success ? (
            // 注册成功页面
            <div className="space-y-4 py-6">
              <div className="w-16 h-16 mx-auto rounded-full bg-green-50 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-green-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <CardTitle className="text-xl">注册成功！</CardTitle>
              <CardDescription className="text-sm">
                请检查邮箱 <strong className="text-primary">{email}</strong> 确认注册。
                <br />
                确认后即可登录并自动关联代理关系。
              </CardDescription>
              <Button className="w-full" onClick={handleGoToLogin}>
                前往登录
              </Button>
            </div>
          ) : (
            <>
              {inviteCode ? (
                <>
                  <CardTitle className="text-2xl">加入代理网络</CardTitle>
                  <CardDescription>
                    注册后自动与邀请人建立代理关系，享受分佣权益
                  </CardDescription>
                </>
              ) : (
                <>
                  <CardTitle className="text-2xl">注册创业导航</CardTitle>
                  <CardDescription>
                    注册后即可浏览全部创业项目并参与代理推广
                  </CardDescription>
                </>
              )}

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
            </>
          )}

          {/* 注册表单 - 仅在未成功时显示 */}
          {!success && (
            <div className="space-y-3 pt-2">
              <div className="space-y-1.5">
                <label className="text-sm font-medium">昵称</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="输入昵称（选填）"
                    value={nickname}
                    onChange={(e) => setNickname(e.target.value)}
                    className="pl-9"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
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

              <div className="space-y-1.5">
                <label className="text-sm font-medium">密码</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="至少6位密码"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="pl-9"
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleRegister()
                    }}
                  />
                </div>
              </div>

              {error && (
                <div className="text-sm text-destructive bg-destructive/10 p-3 rounded-md">
                  {error}
                </div>
              )}

              <Button
                className="w-full"
                size="lg"
                onClick={handleRegister}
                disabled={loading}
              >
                {loading ? (
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                ) : null}
                {inviteCode ? "注册并加入代理网络" : "注册"}
              </Button>

              <p className="text-xs text-center text-muted-foreground pt-2">
                已有账号？{" "}
                <button
                  onClick={handleGoToLogin}
                  className="text-primary hover:underline font-medium"
                >
                  立即登录
                </button>
              </p>
            </div>
          )}
        </CardHeader>
        <CardContent>
          {/* 空 content, 表单在 header 下方的独立区域 */}
        </CardContent>
      </Card>
    </div>
  )
}

export default function RegisterPage() {
  return (
    <Suspense
      fallback={
        <div className="flex justify-center items-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      }
    >
      <RegisterForm />
    </Suspense>
  )
}
