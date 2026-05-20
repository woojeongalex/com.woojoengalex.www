import { NextResponse } from "next/server"
import { UI_ERRORS } from "@/lib/user-facing-error"
import {
  WEATHER_API_BASE,
  weatherCatchResponse,
  weatherDetailError,
} from "@/app/api/weather/_lib"

export const runtime = "nodejs"

const BACKEND_FETCH_MS = 8000

export async function GET(request: Request) {
  const city = new URL(request.url).searchParams.get("city") ?? "seoul"
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), BACKEND_FETCH_MS)

  try {
    const res = await fetch(
      `${WEATHER_API_BASE}/api/weather/forecast?city=${encodeURIComponent(city)}`,
      { cache: "no-store", signal: controller.signal }
    )
    const data = (await res.json()) as {
      city?: string
      days?: unknown[]
      detail?: unknown
      error?: string
    }

    if (!res.ok) {
      return NextResponse.json(
        { error: weatherDetailError(data.detail ?? data.error, UI_ERRORS.weatherForecastFailed) },
        { status: res.status }
      )
    }

    if (!Array.isArray(data.days) || data.days.length === 0) {
      return NextResponse.json({ error: UI_ERRORS.weatherForecastFailed }, { status: 502 })
    }

    return NextResponse.json({ city: data.city ?? "Seoul", days: data.days })
  } catch (e) {
    return weatherCatchResponse(e, UI_ERRORS.weatherForecastFailed)
  } finally {
    clearTimeout(timeout)
  }
}
