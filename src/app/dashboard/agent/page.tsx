"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, Users, DollarSign, TrendingUp, QrCode, CheckCircle, Clock, Loader2 } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

// 类型定义
interface AgentStats {
  inviteCode: string
  commissionRate: number
  totalAgents: number
  activeAgents: number
  totalEarnings: number
  pendingSettlement: number
  todayEarnings: number
}

interface Agent {
  id: string
  user_id: string
  nickname: string
  phone: string
  status: string
  todayEarnings: number
  totalEarnings: number
  totalCustomers: number
  joinDate: string
  commission_rate: number
}

interface Settlement {
  id: string
  amount: number
  status: string
  payment_method?: string
  created_at: string
}

export default function AgentDashboardPage() {
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState<AgentStats | null>(null)
  const [agents, setAgents] = useState<Agent[]>([])
  const [settlements, setSettlements] = useState<Settlement[]>([])
  const [copied, setCopied] = useState(false)
  const [commissionRate, setCommissionRate] = useState(30)
  const [showQRCode, setShowQRCode] = useState(false)
  const [savingRate, setSavingRate] = useState(false)
  const [settling, setSettling] = useState(false)

  // 加载数据
  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    setLoading(true)
    try {
      // 并行获取统计数据和代理列表
      const [statsRes, agentsRes, settlementsRes] = await Promise.all([
        fetch("/api/agents?type=stats"),
        fetch("/api/agents?type=list"),
        fetch("/api/agents?type=settlements"),
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
        setCommissionRate(statsData.commissionRate)
      }

      if (agentsRes.ok) {
        const agentsData = await agentsRes.json()
        setAgents(agentsData)
      }

      if (settlementsRes.ok) {
        const settlementsData = await settlementsRes.json()
        setSettlements(settlementsData)
      }
    } catch (error) {
      console.error("加载代理数据失败:", error)
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = () => {
    if (!stats?.inviteCode) return
    navigator.clipboard.writeText(stats.inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const saveCommissionRate = async () => {
    setSavingRate(true)
    try {
      const res = await fetch("/api/agents?action=updateCommissionRate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ commissionRate }),
      })

      if (res.ok) {
        alert("分佣比例已更新！")
      } else {
        const data = await res.json()
        alert(data.error || "更新失败")
      }
    } catch (error) {
      alert("更新失败")
    } finally {
      setSavingRate(false)
    }
  }

  const handleSettle = async () => {
    if (settling) return
    if (!confirm("确认结算所有待结算佣金？")) return

    setSettling(true)
    try {
      const res = await fetch("/api/agents?action=settle", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      })

      if (res.ok) {
        const data = await res.json()
        alert(`结算成功！金额: ¥${data.amount}`)
        loadData() // 刷新数据
      } else {
        const data = await res.json()
        alert(data.error || "结算失败")
      }
    } catch (error) {
      alert("结算失败")
    } finally {
      setSettling(false)
    }
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-6xl flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
          <p className="text-muted-foreground">加载中...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">代理管理中心</h1>
        <p className="text-muted-foreground">管理你的下级代理，查看业绩，统一结算</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">下级代理</p>
                <p className="text-2xl font-bold">{stats?.totalAgents || 0}人</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">{stats?.activeAgents || 0}人活跃</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">累计分佣</p>
                <p className="text-2xl font-bold">¥{stats?.totalEarnings?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-green-50 flex items-center justify-center">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <p className="text-xs text-muted-foreground mt-2">代理总收益</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">今日新增</p>
                <p className="text-2xl font-bold">¥{stats?.todayEarnings?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">今日分佣收益</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待结算</p>
                <p className="text-2xl font-bold">¥{stats?.pendingSettlement?.toFixed(2) || "0.00"}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2">
              {(stats?.pendingSettlement ?? 0) > 0 ? "可立即结算" : "暂无待结算"}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 邀请码区域 */}
      <Card className="mb-8 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50">
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-lg mb-1">邀请新代理</h3>
              <p className="text-sm text-muted-foreground">分享邀请码，别人注册后自动成为你的下级代理</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-white border rounded-lg px-4 py-2">
                <span className="font-mono font-bold text-primary">{stats?.inviteCode || "加载中..."}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={copyInviteCode}
                  className="h-8 w-8 p-0"
                  disabled={!stats?.inviteCode}
                >
                  {copied ? (
                    <CheckCircle className="h-4 w-4 text-green-500" />
                  ) : (
                    <Copy className="h-4 w-4" />
                  )}
                </Button>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="gap-1"
                onClick={() => setShowQRCode(true)}
              >
                <QrCode className="h-4 w-4" /> 二维码
              </Button>
            </div>
          </div>

          {/* 分佣比例设置 */}
          <div className="mt-4 pt-4 border-t">
            <div className="flex items-center gap-4">
              <span className="text-sm font-medium">分佣比例：</span>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={commissionRate}
                  onChange={(e) => setCommissionRate(Number(e.target.value))}
                  className="w-20 text-center"
                  min={10}
                  max={50}
                />
                <span className="text-sm">%</span>
                <Button size="sm" onClick={saveCommissionRate} disabled={savingRate}>
                  {savingRate ? "保存中..." : "保存"}
                </Button>
              </div>
              <span className="text-xs text-muted-foreground">代理每成交一单，你获得的分成比例</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 二维码弹窗 */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>代理邀请二维码</DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            {/* 使用 qrcode.react 本地生成二维码 - 不依赖外部API */}
            <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-2 border-gray-200 p-2">
              {stats?.inviteCode ? (
                <QRCodeSVG
                  value={`https://literate-parakeet-mu.vercel.app/register?code=${stats.inviteCode}`}
                  size={180}
                  level="M"
                  includeMargin={false}
                />
              ) : (
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              )}
            </div>
            <div className="text-center">
              <p className="text-sm text-muted-foreground">扫码注册，自动成为你的下级代理</p>
              <p className="text-xs text-muted-foreground mt-1">邀请码：<strong className="text-primary">{stats?.inviteCode}</strong></p>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* 代理列表和结算 */}
      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">代理列表</TabsTrigger>
          <TabsTrigger value="settlements">结算记录</TabsTrigger>
          <TabsTrigger value="rules">结算规则</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">我的代理 ({agents.length})</CardTitle>
            </CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>暂无下级代理</p>
                  <p className="text-sm">分享邀请码开始推广吧！</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {agents.map((agent) => (
                    <div
                      key={agent.id}
                      className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                          {agent.nickname?.[0] || "代"}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-medium">{agent.nickname || "代理"}</span>
                            <Badge
                              variant={agent.status === "active" ? "success" : "secondary"}
                              className="text-[10px]"
                            >
                              {agent.status === "active" ? "活跃" : "待审核"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground">
                            {agent.phone} · 加入于 {agent.joinDate}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-center">
                          <p className="font-bold">{agent.totalCustomers || 0}</p>
                          <p className="text-xs text-muted-foreground">获客数</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold text-green-600">¥{Number(agent.totalEarnings).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">累计收益</p>
                        </div>
                        <div className="text-center">
                          <p className="font-bold">¥{Number(agent.todayEarnings).toFixed(2)}</p>
                          <p className="text-xs text-muted-foreground">今日</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">结算记录</CardTitle>
                <Button
                  size="sm"
                  className="gap-1"
                  onClick={handleSettle}
                  disabled={settling || (stats?.pendingSettlement || 0) <= 0}
                >
                  {settling ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> 结算中...
                    </>
                  ) : (
                    <>
                      <DollarSign className="h-4 w-4" /> 一键结算
                    </>
                  )}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {settlements.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-20" />
                  <p>暂无结算记录</p>
                  <p className="text-sm">下级代理产生收益后会自动生成结算记录</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {settlements.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-10 h-10 rounded-full flex items-center justify-center ${
                            s.status === "settled" ? "bg-green-50" : "bg-amber-50"
                          }`}
                        >
                          {s.status === "settled" ? (
                            <CheckCircle className="h-5 w-5 text-green-600" />
                          ) : (
                            <Clock className="h-5 w-5 text-amber-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium">
                            {s.payment_method || "微信"} 提现
                          </p>
                          <p className="text-xs text-muted-foreground">{s.created_at?.split("T")[0]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="font-bold">¥{Number(s.amount).toFixed(2)}</span>
                        <Badge
                          variant={s.status === "settled" ? "success" : "warning"}
                          className="text-[10px]"
                        >
                          {s.status === "settled" ? "已结算" : "待结算"}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rules">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">结算规则说明</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3 p-4 bg-blue-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center shrink-0">
                    <span className="text-blue-600 font-bold text-sm">1</span>
                  </div>
                  <div>
                    <h4 className="font-medium">获客统计</h4>
                    <p className="text-sm text-muted-foreground">代理通过专属链接或二维码获客，系统自动追踪归属</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-green-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                    <span className="text-green-600 font-bold text-sm">2</span>
                  </div>
                  <div>
                    <h4 className="font-medium">收益计算</h4>
                    <p className="text-sm text-muted-foreground">
                      代理成交后，按设定比例自动计算你的分佣收益（当前比例：{commissionRate}%）
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-purple-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-purple-100 flex items-center justify-center shrink-0">
                    <span className="text-purple-600 font-bold text-sm">3</span>
                  </div>
                  <div>
                    <h4 className="font-medium">统一结算</h4>
                    <p className="text-sm text-muted-foreground">每晚22:00自动结算当日收益，也可手动一键结算</p>
                  </div>
                </div>
                <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-xl">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                    <span className="text-amber-600 font-bold text-sm">4</span>
                  </div>
                  <div>
                    <h4 className="font-medium">提现到账</h4>
                    <p className="text-sm text-muted-foreground">结算后收益进入余额，可随时提现到微信或支付宝</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
