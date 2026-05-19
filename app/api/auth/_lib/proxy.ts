import { NextResponse } from "next/server"

/** Next API → FastAPI 프록시 공통 설정 (runtime은 각 route.ts에 직접 선언) */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000"

const DEFAULT_TIMEOUT_MS = 10_000

export function parseFastApiError(detail: unknown, fallback: string): string {
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
  return fallback
}

async function readBody(res: Response): Promise<Record<string, unknown>> {
  const raw = await res.text()
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return { detail: raw.slice(0, 200) }
  }
}

function proxyError(message: string, status = 503) {
  return NextResponse.json({ error: message }, { status })
}

/** GET 프록시 — check-id, check-nickname 등 */
export async function proxyGet(
  path: string,
  fallbackError: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      cache: "no-store",
      signal: controller.signal,
    })
    const data = await readBody(res)
    if (!res.ok) {
      return NextResponse.json(
        {
          error: parseFastApiError(
            data.detail ?? data.error,
            fallbackError
          ),
        },
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
    return proxyError(message)
  } finally {
    clearTimeout(timeout)
  }
}

/** POST 프록시 — login, signup */
export async function proxyPost(
  path: string,
  body: unknown,
  fallbackError: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      cache: "no-store",
      signal: controller.signal,
    })
    const data = await readBody(res)
    if (!res.ok) {
      return NextResponse.json(
        {
          error: parseFastApiError(
            data.detail ?? data.error,
            fallbackError
          ),
        },
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
    return proxyError(message)
  } finally {
    clearTimeout(timeout)
  }
}
