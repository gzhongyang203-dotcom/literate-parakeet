"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Copy, Users, DollarSign, TrendingUp, QrCode, CheckCircle, Clock, Loader2, ChevronRight, Trophy, UserPlus, Zap } from "lucide-react"
import { QRCodeSVG } from "qrcode.react"

// ===== 类型定义 =====
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

// ===== Toast 组件 =====
function Toast({ message, type, onClose }: { message: string; type: "success" | "error"; onClose: () => void }) {
  useEffect(() => {
    const t = setTimeout(onClose, 2500)
    return () => clearTimeout(t)
  }, [onClose])

  return (
    <div className={`fixed top-4 right-4 z-50 px-5 py-3 rounded-xl shadow-lg text-sm font-medium animate-slideInRight
      ${type === "success" ? "bg-green-600 text-white" : "bg-red-600 text-white"}`}
    >
      <div className="flex items-center gap-2">
        {type === "success" ? <CheckCircle className="h-4 w-4" /> : <span>⚠</span>}
        {message}
      </div>
    </div>
  )
}

// ===== 下级代理详情弹窗 =====
function AgentDetailDialog({ agent, open, onClose }: { agent: Agent | null; open: boolean; onClose: () => void }) {
  if (!agent) return null

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>代理详情</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-xl">
              {agent.nickname?.[0] || "代"}
            </div>
            <div>
              <h3 className="text-lg font-bold">{agent.nickname || "代理"}</h3>
              <p className="text-sm text-muted-foreground">{agent.phone} · {agent.joinDate}</p>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-blue-600">{agent.totalCustomers || 0}</p>
              <p className="text-xs text-muted-foreground">获客数</p>
            </div>
            <div className="bg-green-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-green-600">¥{Number(agent.totalEarnings).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">累计收益</p>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 text-center">
              <p className="text-xl font-bold text-purple-600">¥{Number(agent.todayEarnings).toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">今日收益</p>
            </div>
          </div>

          <div className="bg-muted/50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">状态</span>
              <Badge variant={agent.status === "active" ? "success" : "secondary"}>
                {agent.status === "active" ? "活跃" : "待审核"}
              </Badge>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">分佣比例</span>
              <span className="font-medium">{agent.commission_rate || 30}%</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">加入时间</span>
              <span>{agent.joinDate}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
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
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" } | null>(null)
  const [selectedAgent, setSelectedAgent] = useState<Agent | null>(null)

  useEffect(() => { loadData() }, [])

  const showToast = (message: string, type: "success" | "error") => {
    setToast({ message, type })
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [statsRes, agentsRes, settlementsRes] = await Promise.all([
        fetch("/api/agents?type=stats"),
        fetch("/api/agents?type=list"),
        fetch("/api/agents?type=settlements"),
      ])
      if (statsRes.ok) {
        const d = await statsRes.json()
        setStats(d)
        setCommissionRate(d.commissionRate)
      }
      if (agentsRes.ok) setAgents(await agentsRes.json())
      if (settlementsRes.ok) setSettlements(await settlementsRes.json())
    } catch {
      showToast("加载数据失败", "error")
    } finally {
      setLoading(false)
    }
  }

  const copyInviteCode = () => {
    if (!stats?.inviteCode) return
    navigator.clipboard.writeText(stats.inviteCode)
    setCopied(true)
    showToast("邀请码已复制！", "success")
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
      if (res.ok) showToast("分佣比例已更新！", "success")
      else { const d = await res.json(); showToast(d.error || "更新失败", "error") }
    } catch { showToast("更新失败", "error") }
    finally { setSavingRate(false) }
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
        const d = await res.json()
        showToast(`结算成功！¥${d.amount}`, "success")
        loadData()
      } else { const d = await res.json(); showToast(d.error || "结算失败", "error") }
    } catch { showToast("结算失败", "error") }
    finally { setSettling(false) }
  }

  const topAgents = [...agents].sort((a, b) => Number(b.totalEarnings) - Number(a.totalEarnings)).slice(0, 3)

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
      {toast && <Toast {...toast} onClose={() => setToast(null)} />}

      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">🏢 代理管理中心</h1>
        <p className="text-muted-foreground">管理下级代理 · 查看业绩 · 统一结算</p>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        {([
          { label: "下级代理", value: `${stats?.totalAgents || 0}人`, sub: `${stats?.activeAgents || 0}人活跃`, icon: Users, bg: "bg-blue-50", text: "text-blue-600" },
          { label: "累计分佣", value: `¥${stats?.totalEarnings?.toFixed(2) || "0.00"}`, sub: "代理总收益", icon: DollarSign, bg: "bg-green-50", text: "text-green-600" },
          { label: "今日新增", value: `¥${stats?.todayEarnings?.toFixed(2) || "0.00"}`, sub: "今日分佣收益", icon: TrendingUp, bg: "bg-purple-50", text: "text-purple-600" },
          { label: "待结算", value: `¥${stats?.pendingSettlement?.toFixed(2) || "0.00"}`, sub: (stats?.pendingSettlement ?? 0) > 0 ? "可立即结算" : "暂无待结算", icon: Clock, bg: "bg-amber-50", text: "text-amber-600" },
        ] as const).map((card, i) => (
          <Card key={i} className="hover:shadow-md transition-shadow">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{card.label}</p>
                <div className={`w-8 h-8 rounded-full ${card.bg} flex items-center justify-center`}>
                  <card.icon className={`h-4 w-4 ${card.text}`} />
                </div>
              </div>
              <p className="text-xl font-bold">{card.value}</p>
              <p className="text-[10px] text-muted-foreground mt-0.5">{card.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* 邀请码区域 */}
      <Card className="mb-6 border-primary/20 bg-gradient-to-r from-primary/5 to-purple-50">
        <CardContent className="p-5">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <UserPlus className="h-5 w-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold">邀请新代理</h3>
                <p className="text-xs text-muted-foreground">分享邀请码，注册后自动成为你的下级</p>
              </div>
            </div>
            <div className="flex items-center gap-2 w-full md:w-auto">
              <div className="flex items-center gap-2 bg-white border rounded-lg px-3 py-2 flex-1 md:flex-none">
                <span className="font-mono font-bold text-primary text-sm">{stats?.inviteCode || "加载中..."}</span>
                <Button variant="ghost" size="sm" onClick={copyInviteCode} className="h-8 w-8 p-0" disabled={!stats?.inviteCode}>
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Button variant="outline" size="sm" className="gap-1" onClick={() => setShowQRCode(true)}>
                <QrCode className="h-4 w-4" /> <span className="hidden sm:inline">二维码</span>
              </Button>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t flex flex-wrap items-center gap-3">
            <span className="text-sm font-medium">分佣比例：</span>
            <Input type="number" value={commissionRate} onChange={(e) => setCommissionRate(Number(e.target.value))} className="w-16 text-center h-8" min={10} max={50} />
            <span className="text-sm">%</span>
            <Button size="sm" onClick={saveCommissionRate} disabled={savingRate} className="h-8">{savingRate ? "保存中..." : "保存"}</Button>
            <span className="text-xs text-muted-foreground hidden sm:inline">代理每成交一单，你获得的分成比例</span>
          </div>
        </CardContent>
      </Card>

      {/* Top3 排行榜 */}
      {topAgents.length > 0 && (
        <Card className="mb-6 border-amber-200 bg-gradient-to-r from-amber-50 to-yellow-50">
          <CardHeader className="pb-2">
            <div className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-amber-500" />
              <CardTitle className="text-base">业绩排行 TOP3</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {topAgents.map((agent, i) => (
                <button
                  key={agent.id}
                  onClick={() => setSelectedAgent(agent)}
                  className="flex items-center gap-3 p-3 bg-white rounded-xl border hover:border-primary/30 hover:shadow-sm transition-all text-left group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                      {agent.nickname?.[0] || "代"}
                    </div>
                    <span className={`absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white
                      ${i === 0 ? "bg-amber-500" : i === 1 ? "bg-gray-400" : "bg-orange-400"}`}>
                      {i + 1}
                    </span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{agent.nickname || "代理"}</p>
                    <p className="text-xs text-green-600 font-bold">¥{Number(agent.totalEarnings).toFixed(0)}</p>
                  </div>
                  <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors" />
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* 二维码弹窗 */}
      <Dialog open={showQRCode} onOpenChange={setShowQRCode}>
        <DialogContent>
          <DialogHeader><DialogTitle>代理邀请二维码</DialogTitle></DialogHeader>
          <div className="flex flex-col items-center gap-4 py-4">
            <div className="w-48 h-48 bg-white rounded-xl flex items-center justify-center border-2 border-gray-200 p-2">
              {stats?.inviteCode ? (
                <QRCodeSVG value={`https://literate-parakeet-mu.vercel.app/register?code=${stats.inviteCode}`} size={180} level="M" includeMargin={false} />
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

      {/* 代理详情弹窗 */}
      <AgentDetailDialog agent={selectedAgent} open={!!selectedAgent} onClose={() => setSelectedAgent(null)} />

      {/* 列表区 */}
      <Tabs defaultValue="agents">
        <TabsList>
          <TabsTrigger value="agents">代理列表 ({agents.length})</TabsTrigger>
          <TabsTrigger value="settlements">结算记录</TabsTrigger>
          <TabsTrigger value="rules">结算规则</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <Card>
            <CardHeader><CardTitle className="text-lg">我的代理</CardTitle></CardHeader>
            <CardContent>
              {agents.length === 0 ? (
                <div className="text-center py-10">
                  <Users className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-medium">暂无下级代理</p>
                  <p className="text-sm text-muted-foreground/60">分享邀请码开始推广吧！</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {agents.map((agent) => (
                    <button
                      key={agent.id}
                      onClick={() => setSelectedAgent(agent)}
                      className="w-full flex flex-col sm:flex-row sm:items-center justify-between p-3 border rounded-xl hover:bg-muted/50 hover:border-primary/20 transition-all gap-2 text-left group"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold text-sm shrink-0">
                          {agent.nickname?.[0] || "代"}
                        </div>
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-sm truncate">{agent.nickname || "代理"}</span>
                            <Badge variant={agent.status === "active" ? "success" : "secondary"} className="text-[10px] shrink-0">
                              {agent.status === "active" ? "活跃" : "待审核"}
                            </Badge>
                          </div>
                          <p className="text-xs text-muted-foreground truncate">{agent.phone} · {agent.joinDate}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-xs sm:gap-5 ml-12 sm:ml-0">
                        <div className="text-center"><p className="font-bold text-sm">{agent.totalCustomers || 0}</p><p className="text-[10px] text-muted-foreground">获客</p></div>
                        <div className="text-center"><p className="font-bold text-sm text-green-600">¥{Number(agent.totalEarnings).toFixed(0)}</p><p className="text-[10px] text-muted-foreground">累计</p></div>
                        <div className="text-center"><p className="font-bold text-sm">¥{Number(agent.todayEarnings).toFixed(0)}</p><p className="text-[10px] text-muted-foreground">今日</p></div>
                        <ChevronRight className="h-4 w-4 text-muted-foreground/30 group-hover:text-primary transition-colors hidden sm:block" />
                      </div>
                    </button>
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
                <Button size="sm" className="gap-1" onClick={handleSettle} disabled={settling || (stats?.pendingSettlement || 0) <= 0}>
                  {settling ? <><Loader2 className="h-4 w-4 animate-spin" /> 结算中...</> : <><DollarSign className="h-4 w-4" /> 一键结算</>}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {settlements.length === 0 ? (
                <div className="text-center py-10">
                  <DollarSign className="h-16 w-16 mx-auto mb-4 text-muted-foreground/20" />
                  <p className="text-muted-foreground font-medium">暂无结算记录</p>
                  <p className="text-sm text-muted-foreground/60">下级代理产生收益后自动生成</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {settlements.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-3 border rounded-xl hover:bg-muted/30 transition-colors">
                      <div className="flex items-center gap-3">
                        <div className={`w-9 h-9 rounded-full flex items-center justify-center ${s.status === "settled" ? "bg-green-50" : "bg-amber-50"}`}>
                          {s.status === "settled" ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-amber-600" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{s.payment_method || "微信"} 提现</p>
                          <p className="text-xs text-muted-foreground">{s.created_at?.split("T")[0]}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold">¥{Number(s.amount).toFixed(2)}</span>
                        <Badge variant={s.status === "settled" ? "success" : "warning"} className="text-[10px]">
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
            <CardHeader><CardTitle className="text-lg">结算规则说明</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-3">
                {([
                  { step: 1, title: "获客统计", desc: "代理通过专属链接或二维码获客，系统自动追踪归属", bg: "bg-blue-50", badgeBg: "bg-blue-100", badgeText: "text-blue-600" },
                  { step: 2, title: "收益计算", desc: `代理成交后，按设定比例自动计算你的分佣（当前比例：${commissionRate}%）`, bg: "bg-green-50", badgeBg: "bg-green-100", badgeText: "text-green-600" },
                  { step: 3, title: "自动结算", desc: "每晚22:00系统自动结算当日收益，也可手动一键结算", bg: "bg-purple-50", badgeBg: "bg-purple-100", badgeText: "text-purple-600" },
                  { step: 4, title: "提现到账", desc: "结算后收益进入余额，可随时提现到微信或支付宝", bg: "bg-amber-50", badgeBg: "bg-amber-100", badgeText: "text-amber-600" },
                ] as const).map((rule) => (
                  <div key={rule.step} className={`flex items-start gap-3 p-4 ${rule.bg} rounded-xl`}>
                    <div className={`w-8 h-8 rounded-full ${rule.badgeBg} flex items-center justify-center shrink-0`}>
                      <span className={`${rule.badgeText} font-bold text-sm`}>{rule.step}</span>
                    </div>
                    <div>
                      <h4 className="font-medium">{rule.title}</h4>
                      <p className="text-sm text-muted-foreground">{rule.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <style jsx global>{`
        @keyframes slideInRight {
          from { opacity: 0; transform: translateX(100px); }
          to { opacity: 1; transform: translateX(0); }
        }
        .animate-slideInRight { animation: slideInRight 0.3s ease-out; }
      `}</style>
    </div>
  )
}
