export interface WeatherData {
  temp: number
  description: string
}

export interface WeatherApiResult {
  ok: boolean
  temp?: number
  description?: string
  error?: string
}

export async function fetchWeather(): Promise<WeatherApiResult> {
  const res = await fetch('/api/weather')
  const data = (await res.json()) as {
    temp?: number
    description?: string
    error?: string
  }
  return { ok: res.ok, ...data }
}
