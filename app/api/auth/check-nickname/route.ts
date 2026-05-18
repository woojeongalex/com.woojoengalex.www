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
  return "닉네임 중복 확인에 실패했습니다."
}

export async function GET(request: Request) {
  const nickname = new URL(request.url).searchParams.get("nickname")?.trim()
  if (!nickname) {
    return NextResponse.json({ error: "닉네임을 입력하세요." }, { status: 400 })
  }

  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), BACKEND_FETCH_MS)

  try {
    const res = await fetch(
      `${API_BASE}/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`,
      { cache: "no-store", signal: controller.signal }
    )
    const data = (await res.json()) as { available?: boolean; detail?: unknown }

    if (!res.ok) {
      return NextResponse.json(
        { error: parseFastApiError(data.detail) },
        { status: res.status }
      )
    }

    return NextResponse.json({ available: Boolean(data.available) })
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
