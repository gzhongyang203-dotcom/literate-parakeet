"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { QrCode, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import Link from "next/link"

export default function WeChatBotDebugPage() {
  const [qrcodeResult, setQrcodeResult] = useState<any>(null)
  const [statusResult, setStatusResult] = useState<any>(null)
  const [loading, setLoading] = useState(false)

  const testQrcode = async () => {
    setLoading(true)
    setQrcodeResult(null)
    setStatusResult(null)
    
    try {
      // 1. 测试获取二维码
      const qrRes = await fetch("/api/wechat-bot/qrcode")
      const qrData = await qrRes.json()
      setQrcodeResult({
        status: qrRes.status,
        statusText: qrRes.statusText,
        data: qrData,
      })

      // 2. 等待1秒后查询状态
      await new Promise(r => setTimeout(r, 1000))
      
      const statusRes = await fetch("/api/wechat-bot/status")
      const statusData = await statusRes.json()
      setStatusResult({
        status: statusRes.status,
        data: statusData,
      })
    } catch (err: any) {
      setQrcodeResult({ error: err.message })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold">微信Bot调试页面</h1>
          <p className="text-sm text-muted-foreground mt-1">
            排查二维码无法显示的问题
          </p>
        </div>
        <Link href="/admin/wechat-bot">
          <Button variant="outline" size="sm">返回管理页</Button>
        </Link>
      </div>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>步骤1：获取二维码</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={testQrcode} disabled={loading}>
            {loading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <QrCode className="h-4 w-4 mr-2" />}
            测试获取二维码
          </Button>

          {qrcodeResult && (
            <div className="mt-4 p-4 bg-muted rounded-lg">
              <h3 className="font-bold mb-2">API 响应：</h3>
              
              {qrcodeResult.error ? (
                <p className="text-red-500">错误：{qrcodeResult.error}</p>
              ) : (
                <>
                  <p><strong>HTTP 状态码：</strong>{qrcodeResult.status}</p>
                  
                  <div className="mt-3">
                    <strong>返回数据：</strong>
                    <pre className="mt-1 p-3 bg-background rounded text-xs overflow-auto max-h-64">
                      {JSON.stringify(qrcodeResult.data, null, 2)}
                    </pre>
                  </div>

                  {qrcodeResult.data?.qrcode_url && (
                    <div className="mt-4">
                      <strong>二维码图片：</strong>
                      <div className="mt-2 p-4 bg-white inline-block rounded border">
                        <img 
                          src={qrcodeResult.data.qrcode_url} 
                          alt="二维码" 
                          className="w-48 h-48"
                          onError={(e) => {
                            console.error("图片加载失败", e)
                            alert("图片加载失败！URL: " + qrcodeResult.data.qrcode_url)
                          }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground mt-2">
                        URL: {qrcodeResult.data.qrcode_url}
                      </p>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {statusResult && (
        <Card>
          <CardHeader>
            <CardTitle>步骤2：当前状态</CardTitle>
          </CardHeader>
          <CardContent>
            <p><strong>HTTP 状态码：</strong>{statusResult.status}</p>
            <div className="mt-3">
              <strong>状态数据：</strong>
              <pre className="mt-1 p-3 bg-muted rounded text-xs overflow-auto max-h-64">
                {JSON.stringify(statusResult.data, null, 2)}
              </pre>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
