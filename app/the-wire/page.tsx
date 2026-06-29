"use client"

import { useState } from "react"
import { Send, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { sendEmail } from "@/lib/the-wire-api"

export default function TheWirePage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as {
      to: string
      subject: string
      topic: string
    }
    setLoading(true)
    setResult(null)
    try {
      await sendEmail(data)
      setResult({ success: true, message: "이메일이 성공적으로 전송됐습니다." })
      e.currentTarget.reset()
    } catch {
      setResult({ success: false, message: "전송에 실패했습니다. 다시 시도해주세요." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            <CardTitle>The Wire</CardTitle>
          </div>
          <CardDescription>
            EXAONE이 주제를 읽고 이메일 본문을 작성해서 전송합니다.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="to">받는 사람</Label>
              <Input
                id="to"
                name="to"
                type="email"
                placeholder="example@gmail.com"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="subject">제목</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="이메일 제목"
                required
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="topic">주제</Label>
              <Textarea
                id="topic"
                name="topic"
                placeholder="EXAONE에게 전달할 주제를 입력하세요. 예) 오늘의 날씨를 한 줄로 재밌게 요약해줘"
                rows={4}
                required
              />
            </div>

            {result && (
              <p className={`text-sm ${result.success ? "text-green-600" : "text-destructive"}`}>
                {result.message}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                "EXAONE 작성 중..."
              ) : (
                <>
                  <Send className="mr-2 h-4 w-4" />
                  전송
                </>
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
