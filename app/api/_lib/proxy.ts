import { NextResponse } from "next/server"
import { parseFastApiDetail, UI_ERRORS } from "@/lib/user-facing-error"

/** Next API → FastAPI 공통 프록시 (auth·chat 등에서 재사용) */

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000"

const DEFAULT_TIMEOUT_MS = 10_000

async function readBody(res: Response): Promise<Record<string, unknown>> {
  const raw = await res.text()
  if (!raw) return {}
  try {
    return JSON.parse(raw) as Record<string, unknown>
  } catch {
    return {}
  }
}

function proxyError(message: string, status = 503) {
  return NextResponse.json({ error: message }, { status })
}

function networkError(e: unknown): string {
  if (e instanceof Error && e.name === "AbortError") {
    return "서버 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요."
  }
  return UI_ERRORS.backendUnavailable
}

async function proxyFetch(
  method: "GET" | "POST",
  path: string,
  fallbackError: string,
  options?: { body?: unknown; timeoutMs?: number }
) {
  const timeoutMs = options?.timeoutMs ?? DEFAULT_TIMEOUT_MS
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: options?.body ? { "Content-Type": "application/json" } : undefined,
      body: options?.body ? JSON.stringify(options.body) : undefined,
      cache: "no-store",
      signal: controller.signal,
    })
    const data = await readBody(res)
    if (!res.ok) {
      return NextResponse.json(
        {
          error: parseFastApiDetail(data.detail ?? data.error, fallbackError),
        },
        { status: res.status }
      )
    }
    return NextResponse.json(data)
  } catch (e) {
    return proxyError(networkError(e))
  } finally {
    clearTimeout(timeout)
  }
}

export async function proxyGet(
  path: string,
  fallbackError: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  return proxyFetch("GET", path, fallbackError, { timeoutMs })
}

export async function proxyPost(
  path: string,
  body: unknown,
  fallbackError: string,
  timeoutMs = DEFAULT_TIMEOUT_MS
) {
  return proxyFetch("POST", path, fallbackError, { body, timeoutMs })
}
