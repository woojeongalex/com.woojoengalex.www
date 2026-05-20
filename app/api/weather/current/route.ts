import { NextResponse } from "next/server"
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
      `${WEATHER_API_BASE}/api/weather/current?city=${encodeURIComponent(city)}`,
      { cache: "no-store", signal: controller.signal }
    )
    const data = (await res.json()) as Record<string, unknown> & { detail?: unknown }

    if (!res.ok) {
      return NextResponse.json(
        { error: weatherDetailError(data.detail) },
        { status: res.status }
      )
    }

    return NextResponse.json(data)
  } catch (e) {
    return weatherCatchResponse(e)
  } finally {
    clearTimeout(timeout)
  }
}
