import { NextResponse } from "next/server"

export const runtime = "nodejs"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000"

const BACKEND_FETCH_MS = 5000

function parseFastApiError(detail: unknown): string {
  if (typeof detail === "string") return detail
  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String((item as { msg: string }).msg)
          : String(item)
      )
      .join(", ")
  }
  return "회원가입 요청에 실패했습니다."
}

export async function POST(request: Request) {
  const body = await request.json()
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), BACKEND_FETCH_MS)

  try {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    })
    const data = (await res.json()) as { detail?: unknown; message?: string; ok?: boolean }

    if (!res.ok) {
      return NextResponse.json(
        { error: parseFastApiError(data.detail) },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (e) {
    const message =
      e instanceof Error && e.name === "AbortError"
        ? `백엔드(${API_BASE}) 응답 시간이 초과되었습니다.`
        : e instanceof Error
          ? e.message
          : "알 수 없는 오류"
    return NextResponse.json({ error: message }, { status: 503 })
  } finally {
    clearTimeout(timeout)
  }
}
