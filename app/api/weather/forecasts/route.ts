import { NextResponse } from "next/server"
import { UI_ERRORS } from "@/lib/user-facing-error"
import {
  WEATHER_API_BASE,
  weatherCatchResponse,
  weatherDetailError,
} from "@/app/api/weather/_lib"

export const runtime = "nodejs"

const BACKEND_FETCH_MS = 30000

export async function GET() {
  const controller = new AbortController()
  const timeout = setTimeout(() => controller.abort(), BACKEND_FETCH_MS)

  try {
    const res = await fetch(`${WEATHER_API_BASE}/api/weather/forecasts`, {
      cache: "no-store",
      signal: controller.signal,
    })
    const data = (await res.json()) as { cities?: unknown[]; detail?: unknown }

    if (!res.ok) {
      return NextResponse.json(
        { error: weatherDetailError(data.detail, UI_ERRORS.weatherForecastFailed) },
        { status: res.status }
      )
    }

    if (!Array.isArray(data.cities) || data.cities.length === 0) {
      return NextResponse.json({ error: UI_ERRORS.weatherForecastFailed }, { status: 502 })
    }

    return NextResponse.json({ cities: data.cities })
  } catch (e) {
    return weatherCatchResponse(e, UI_ERRORS.weatherForecastFailed)
  } finally {
    clearTimeout(timeout)
  }
}
