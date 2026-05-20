import { NextResponse } from "next/server"
import { parseFastApiDetail, UI_ERRORS } from "@/lib/user-facing-error"

export const runtime = "nodejs"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000"

function geminiErrorFromDetail(detail: unknown): string {
  const msg = parseFastApiDetail(detail, UI_ERRORS.geminiFailed)
  const lower = msg.toLowerCase()
  if (
    msg.includes("429") ||
    lower.includes("quota") ||
    lower.includes("할당량")
  ) {
    return UI_ERRORS.geminiQuota
  }
  return msg
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as { message?: string }
    const message = String(body.message ?? "").trim()

    if (!message) {
      return NextResponse.json({ error: "message가 필요합니다." }, { status: 400 })
    }

    const res = await fetch(`${API_BASE}/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    })

    const data = (await res.json()) as { reply?: string; detail?: unknown; error?: string }

    if (!res.ok) {
      return NextResponse.json(
        { error: geminiErrorFromDetail(data.detail ?? data.error) },
        { status: res.status }
      )
    }

    if (!data.reply?.trim()) {
      return NextResponse.json({ error: UI_ERRORS.geminiFailed }, { status: 502 })
    }

    return NextResponse.json({ reply: data.reply })
  } catch {
    return NextResponse.json({ error: UI_ERRORS.geminiFailed }, { status: 500 })
  }
}
