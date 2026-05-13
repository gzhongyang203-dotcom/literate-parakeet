"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Copy, Users, DollarSign, TrendingUp, Share2, QrCode, CheckCircle, Clock } from "lucide-react"

// 模拟代理数据
const MOCK_AGENTS = [
  { id: 1, name: "代理A", phone: "138****1234", status: "active", joinDate: "2026-05-01", totalEarnings: 2580, todayEarnings: 320, customers: 45 },
  { id: 2, name: "代理B", phone: "139****5678", status: "active", joinDate: "2026-05-05", totalEarnings: 1200, todayEarnings: 150, customers: 22 },
  { id: 3, name: "代理C", phone: "137****9012", status: "pending", joinDate: "2026-05-10", totalEarnings: 0, todayEarnings: 0, customers: 0 },
]

const MOCK_SETTLEMENTS = [
  { id: 1, date: "2026-05-12", amount: 580, status: "settled", agentName: "代理A" },
  { id: 2, date: "2026-05-11", amount: 320, status: "settled", agentName: "代理B" },
  { id: 3, date: "2026-05-12", amount: 450, status: "pending", agentName: "代理A" },
]

export default function AgentDashboardPage() {
  const [inviteCode] = useState("AGENT2026VIP")
  const [copied, setCopied] = useState(false)
  const [commissionRate, setCommissionRate] = useState(30)

  const copyInviteCode = () => {
    navigator.clipboard.writeText(inviteCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const totalAgents = MOCK_AGENTS.length
  const activeAgents = MOCK_AGENTS.filter(a => a.status === "active").length
  const totalEarnings = MOCK_AGENTS.reduce((sum, a) => sum + a.totalEarnings, 0)
  const pendingSettlement = MOCK_SETTLEMENTS.filter(s => s.status === "pending").reduce((sum, s) => sum + s.amount, 0)

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
                <p className="text-2xl font-bold">{totalAgents}人</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-blue-50 flex items-center justify-center">
                <Users className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">{activeAgents}人活跃</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">累计分佣</p>
                <p className="text-2xl font-bold">¥{totalEarnings}</p>
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
                <p className="text-2xl font-bold">¥{MOCK_AGENTS.reduce((sum, a) => sum + a.todayEarnings, 0)}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-purple-50 flex items-center justify-center">
                <TrendingUp className="h-5 w-5 text-purple-600" />
              </div>
            </div>
            <p className="text-xs text-green-600 mt-2">+12% 较昨日</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">待结算</p>
                <p className="text-2xl font-bold">¥{pendingSettlement}</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-amber-50 flex items-center justify-center">
                <Clock className="h-5 w-5 text-amber-600" />
              </div>
            </div>
            <p className="text-xs text-amber-600 mt-2">今晚统一结算</p>
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
                <span className="font-mono font-bold text-primary">{inviteCode}</span>
                <Button variant="ghost" size="sm" onClick={copyInviteCode} className="h-8 w-8 p-0">
                  {copied ? <CheckCircle className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <Dialog>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="gap-1">
                    <QrCode className="h-4 w-4" /> 二维码
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>代理邀请二维码</DialogTitle>
                  </DialogHeader>
                  <div className="flex flex-col items-center gap-4 py-4">
                    <div className="w-48 h-48 bg-gray-100 rounded-xl flex items-center justify-center border-2 border-dashed">
                      <span className="text-muted-foreground text-sm">二维码生成中...</span>
                    </div>
                    <p className="text-sm text-muted-foreground">扫码即可注册成为代理</p>
                  </div>
                </DialogContent>
              </Dialog>
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
              </div>
              <span className="text-xs text-muted-foreground">代理每成交一单，你获得的分成比例</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 代理列表和结算 */}
      <Tabs defaultValue="agents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="agents">代理列表</TabsTrigger>
          <TabsTrigger value="settlements">结算记录</TabsTrigger>
          <TabsTrigger value="rules">结算规则</TabsTrigger>
        </TabsList>

        <TabsContent value="agents">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">我的代理 ({totalAgents})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_AGENTS.map((agent) => (
                  <div key={agent.id} className="flex items-center justify-between p-4 border rounded-xl hover:bg-muted/50 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-bold">
                        {agent.name[0]}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{agent.name}</span>
                          <Badge variant={agent.status === "active" ? "success" : "secondary"} className="text-[10px]">
                            {agent.status === "active" ? "活跃" : "待审核"}
                          </Badge>
                        </div>
                        <p className="text-xs text-muted-foreground">{agent.phone} · 加入于 {agent.joinDate}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 text-sm">
                      <div className="text-center">
                        <p className="font-bold">{agent.customers}</p>
                        <p className="text-xs text-muted-foreground">获客数</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold text-green-600">¥{agent.totalEarnings}</p>
                        <p className="text-xs text-muted-foreground">累计收益</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">¥{agent.todayEarnings}</p>
                        <p className="text-xs text-muted-foreground">今日</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settlements">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">结算记录</CardTitle>
                <Button size="sm" className="gap-1">
                  <DollarSign className="h-4 w-4" /> 一键结算
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {MOCK_SETTLEMENTS.map((s) => (
                  <div key={s.id} className="flex items-center justify-between p-4 border rounded-xl">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${s.status === "settled" ? "bg-green-50" : "bg-amber-50"}`}>
                        {s.status === "settled" ? <CheckCircle className="h-5 w-5 text-green-600" /> : <Clock className="h-5 w-5 text-amber-600" />}
                      </div>
                      <div>
                        <p className="font-medium">{s.agentName}</p>
                        <p className="text-xs text-muted-foreground">{s.date}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold">¥{s.amount}</span>
                      <Badge variant={s.status === "settled" ? "success" : "warning"} className="text-[10px]">
                        {s.status === "settled" ? "已结算" : "待结算"}
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
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
                    <p className="text-sm text-muted-foreground">代理成交后，按设定比例自动计算你的分佣收益</p>
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
