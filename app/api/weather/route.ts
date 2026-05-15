import { readFileSync } from "fs"
import { join } from "path"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000"

const BACKEND_FETCH_MS = 4000

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
  return "날씨를 불러오지 못했습니다."
}

function readOpenWeatherKey(): string | null {
  if (process.env.OPENWEATHER_API_KEY?.trim()) {
    return process.env.OPENWEATHER_API_KEY.trim()
  }
  try {
    const envPath = join(process.cwd(), "..", "backend", ".env")
    const content = readFileSync(envPath, "utf8")
    const match = content.match(/^OPENWEATHER_API_KEY=(.+)$/m)
    return match?.[1]?.trim() || null
  } catch {
    return null
  }
}

async function fetchOpenWeatherDirect(apiKey: string) {
  const url = new URL("https://api.openweathermap.org/data/2.5/weather")
  url.searchParams.set("q", "Seoul")
  url.searchParams.set("appid", apiKey)
  url.searchParams.set("units", "metric")
  url.searchParams.set("lang", "kr")

  const res = await fetch(url.toString(), { cache: "no-store" })
  const data = (await res.json()) as {
    main?: { temp?: number }
    weather?: { description?: string }[]
    message?: string
  }

  if (!res.ok) {
    throw new Error(data.message ?? `OpenWeather API 오류 (${res.status})`)
  }

  const temp = data.main?.temp
  const description = data.weather?.[0]?.description
  if (temp === undefined || !description) {
    throw new Error("OpenWeather 응답 형식이 올바르지 않습니다.")
  }

  return { temp: Math.round(temp), description }
}

async function fetchFromBackend() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), BACKEND_FETCH_MS)

  try {
    const res = await fetch(`${API_BASE}/api/weather`, {
      cache: "no-store",
      signal: controller.signal,
    })
    const data = (await res.json()) as {
      temp?: number
      description?: string
      detail?: unknown
    }

    if (!res.ok) {
      throw new Error(parseFastApiError(data.detail))
    }

    if (data.temp === undefined || !data.description) {
      throw new Error("백엔드 응답 형식이 올바르지 않습니다.")
    }

    return { temp: data.temp, description: data.description }
  } finally {
    clearTimeout(timeout)
  }
}

export async function GET() {
  try {
    const weather = await fetchFromBackend()
    return NextResponse.json(weather)
  } catch (backendError) {
    const apiKey = readOpenWeatherKey()
    if (apiKey) {
      try {
        const weather = await fetchOpenWeatherDirect(apiKey)
        return NextResponse.json(weather)
      } catch (directError) {
        const message =
          directError instanceof Error ? directError.message : "알 수 없는 오류"
        return NextResponse.json({ error: message }, { status: 502 })
      }
    }

    const hint =
      backendError instanceof Error && backendError.name === "AbortError"
        ? `백엔드(${API_BASE}) 응답 시간이 초과되었습니다.`
        : `백엔드(${API_BASE})에 연결할 수 없습니다.`

    return NextResponse.json(
      {
        error: `${hint} backend/apps 에서 uvicorn main:app --reload 를 실행하거나, backend/.env 의 OPENWEATHER_API_KEY 를 확인해 주세요.`,
      },
      { status: 503 }
    )
  }
}
