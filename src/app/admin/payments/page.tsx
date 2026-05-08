"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Loader2, Check, X, ExternalLink, User, Clock, Eye } from "lucide-react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

const STATUS_MAP: Record<string, { label: string; color: string }> = {
  pending: { label: "待审核", color: "bg-yellow-100 text-yellow-800" },
  approved: { label: "已通过", color: "bg-green-100 text-green-800" },
  rejected: { label: "已拒绝", color: "bg-red-100 text-red-800" },
}

const PLAN_INFO: Record<string, { price: number; color: string }> = {
  "创业者": { price: 29, color: "border-purple-300" },
  "合伙人": { price: 89, color: "border-amber-300" },
}

interface PaymentRecord {
  id: string
  user_id: string
  plan: string
  amount: number
  order_no: string
  screenshot_url: string
  status: string
  created_at: string
  approved_at: string
  notes: string
  // joined user info
  user_email?: string
  profile_full_name?: string
}

export default function AdminPaymentsPage() {
  const [records, setRecords] = useState<PaymentRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [selectedRecord, setSelectedRecord] = useState<PaymentRecord | null>(null)
  const [rejectNotes, setRejectNotes] = useState("")
  const [showRejectDialog, setShowRejectDialog] = useState(false)
  const [filter, setFilter] = useState<"all" | "pending" | "approved" | "rejected">("pending")
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchRecords = async () => {
      const supabase = createClient()

      let query = supabase
        .from("payment_submissions")
        .select("*, profiles(full_name)")
        .order("created_at", { ascending: false })

      if (filter !== "all") {
        query = query.eq("status", filter)
      }

      const { data, error } = await query

      if (!error && data) {
        // 获取用户邮箱
        const userIds = [...new Set(data.map((r: any) => r.user_id))]
        const { data: users } = await supabase
          .from("profiles")
          .select("id, email")
          .in("id", userIds)

        const userMap: Record<string, string> = {}
        users?.forEach((u: any) => { userMap[u.id] = u.email })

        setRecords(data.map((r: any) => ({
          ...r,
          user_email: userMap[r.user_id],
        })))
      }

      setLoading(false)
    }

    fetchRecords()
  }, [filter, refreshKey])

  const handleApprove = async (record: PaymentRecord) => {
    if (!confirm(`确认开通「${record.user_email}」的 ${record.plan} 订阅？`)) return

    setActionLoading(record.id)
    try {
      const res = await fetch("/api/payment-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: record.id, action: "approve" }),
      })

      if (res.ok) {
        setRefreshKey(k => k + 1)
      } else {
        alert("操作失败")
      }
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async () => {
    if (!selectedRecord) return

    setActionLoading(selectedRecord.id)
    try {
      const res = await fetch("/api/payment-approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: selectedRecord.id,
          action: "reject",
          notes: rejectNotes,
        }),
      })

      if (res.ok) {
        setShowRejectDialog(false)
        setSelectedRecord(null)
        setRejectNotes("")
        setRefreshKey(k => k + 1)
      } else {
        alert("操作失败")
      }
    } finally {
      setActionLoading(null)
    }
  }

  const pendingCount = records.filter(r => r.status === "pending").length

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">支付审核</h1>
          <p className="text-sm text-muted-foreground mt-1">
            审核用户手动付款凭证，开通订阅
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => setRefreshKey(k => k + 1)}>
          刷新
        </Button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6">
        {[
          { key: "pending", label: "待审核", count: pendingCount },
          { key: "approved", label: "已通过" },
          { key: "rejected", label: "已拒绝" },
          { key: "all", label: "全部" },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setFilter(tab.key as any)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              filter === tab.key
                ? "bg-purple-600 text-white"
                : "bg-white border hover:bg-muted"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && tab.count > 0 && (
              <span className="ml-2 bg-red-500 text-white text-xs px-1.5 py-0.5 rounded-full">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : records.length === 0 ? (
        <Card>
          <CardContent className="py-16 text-center">
            <p className="text-muted-foreground">暂无{filter === "all" ? "" : STATUS_MAP[filter]?.label}记录</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {records.map((record) => {
            const statusInfo = STATUS_MAP[record.status] || STATUS_MAP.pending
            const planInfo = PLAN_INFO[record.plan] || PLAN_INFO["创业者"]

            return (
              <Card key={record.id} className={`border-l-4 ${planInfo.color}`}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge className={statusInfo.color}>{statusInfo.label}</Badge>
                        <Badge variant="outline">{record.plan} · ¥{planInfo.price}</Badge>
                      </div>

                      <div className="grid grid-cols-2 gap-x-6 gap-y-1 text-sm">
                        <div className="flex items-center gap-1.5">
                          <User className="h-3.5 w-3.5 text-muted-foreground" />
                          <span className="truncate">{record.user_email || "未知用户"}</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                          <span>{new Date(record.created_at).toLocaleString("zh-CN")}</span>
                        </div>
                        <div className="col-span-2 font-mono text-xs text-muted-foreground">
                          订单号：{record.order_no || "无"}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {record.screenshot_url && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedRecord(record)}
                        >
                          <Eye className="h-4 w-4 mr-1" />
                          截图
                        </Button>
                      )}

                      {record.status === "pending" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 hover:text-red-700"
                            onClick={() => {
                              setSelectedRecord(record)
                              setShowRejectDialog(true)
                            }}
                            disabled={actionLoading === record.id}
                          >
                            <X className="h-4 w-4 mr-1" />
                            拒绝
                          </Button>
                          <Button
                            size="sm"
                            onClick={() => handleApprove(record)}
                            disabled={actionLoading === record.id}
                          >
                            {actionLoading === record.id ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <>
                                <Check className="h-4 w-4 mr-1" />
                                通过
                              </>
                            )}
                          </Button>
                        </>
                      )}

                      {record.status === "approved" && (
                        <span className="text-sm text-green-600">
                          ✓ 已开通 {new Date(record.approved_at).toLocaleDateString("zh-CN")}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Screenshot preview dialog */}
      <Dialog open={!!selectedRecord && !showRejectDialog} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>付款截图</DialogTitle>
          </DialogHeader>
          {selectedRecord?.screenshot_url && (
            <img
              src={selectedRecord.screenshot_url}
              alt="付款截图"
              className="rounded-lg max-h-[60vh] mx-auto"
            />
          )}
          <div className="text-sm text-muted-foreground">
            <p>订单号：{selectedRecord?.order_no}</p>
            <p>用户：{selectedRecord?.user_email}</p>
            <p>套餐：{selectedRecord?.plan}</p>
          </div>
        </DialogContent>
      </Dialog>

      {/* Reject confirmation dialog */}
      <AlertDialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>确认拒绝</AlertDialogTitle>
            <AlertDialogDescription>
              确定要拒绝该支付申请吗？可以填写拒绝原因。
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="py-2">
            <textarea
              value={rejectNotes}
              onChange={(e) => setRejectNotes(e.target.value)}
              placeholder="拒绝原因（可选）"
              className="w-full border rounded-lg p-2 text-sm resize-none h-20"
            />
          </div>
          <AlertDialogFooter>
            <AlertDialogCancel>取消</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 hover:bg-red-700"
              onClick={handleReject}
              disabled={actionLoading === selectedRecord?.id}
            >
              {actionLoading === selectedRecord?.id ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                "确认拒绝"
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
