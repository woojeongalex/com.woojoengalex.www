import { NextResponse } from "next/server"

export const runtime = "nodejs"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000"

function parseFastApiError(detail: unknown): string {
  let message = "요청에 실패했습니다."
  if (typeof detail === "string") message = detail
  else if (Array.isArray(detail)) {
    message = detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String((item as { msg: string }).msg)
          : String(item)
      )
      .join(", ")
  }

  const lower = message.toLowerCase()
  if (
    message.includes("429") ||
    lower.includes("quota") ||
    lower.includes("할당량")
  ) {
    return (
      "Gemini API 할당량을 초과했거나, 선택한 모델을 사용할 수 없습니다. " +
      "Google AI Studio에서 사용량을 확인하거나, 잠시 후 다시 시도해 주세요."
    )
  }
  if (message.length > 320) return message.slice(0, 320) + "…"
  return message
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

    const data = (await res.json()) as { reply?: string; detail?: unknown }

    if (!res.ok) {
      return NextResponse.json(
        { error: parseFastApiError(data.detail) },
        { status: res.status }
      )
    }

    if (!data.reply?.trim()) {
      return NextResponse.json({ error: "응답 본문이 비어 있습니다." }, { status: 502 })
    }

    return NextResponse.json({ reply: data.reply })
  } catch (e) {
    const message = e instanceof Error ? e.message : "알 수 없는 오류"
    return NextResponse.json({ error: message }, { status: 500 })
  }
}
