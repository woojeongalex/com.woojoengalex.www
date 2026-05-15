export const WEATHER_CITY_IDS = ["seoul", "tokyo", "new_york", "london"] as const

export type WeatherCityId = (typeof WEATHER_CITY_IDS)[number]

export const WEATHER_CITY_LABELS: Record<WeatherCityId, string> = {
  seoul: "서울",
  tokyo: "도쿄",
  new_york: "뉴욕",
  london: "런던",
}

export const WEATHER_CITY_COORDS: Record<WeatherCityId, { lat: number; lon: number }> = {
  seoul: { lat: 37.5665, lon: 126.978 },
  tokyo: { lat: 35.6762, lon: 139.6503 },
  new_york: { lat: 40.7128, lon: -74.006 },
  london: { lat: 51.5074, lon: -0.1278 },
}

export const WEATHER_CITY_STORAGE_KEY = "weather-selected-city"
export const WEATHER_CITY_MODE_KEY = "weather-city-mode"

export type WeatherCityMode = "auto" | "manual"

export function isWeatherCityId(value: string): value is WeatherCityId {
  return (WEATHER_CITY_IDS as readonly string[]).includes(value)
}

function toRad(deg: number) {
  return (deg * Math.PI) / 180
}

/** 지원 도시 중 좌표와 가장 가까운 도시 */
export function nearestWeatherCityId(lat: number, lon: number): WeatherCityId {
  let best: WeatherCityId = "seoul"
  let bestDist = Number.POSITIVE_INFINITY

  for (const id of WEATHER_CITY_IDS) {
    const c = WEATHER_CITY_COORDS[id]
    const dLat = toRad(c.lat - lat)
    const dLon = toRad(c.lon - lon)
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat)) * Math.cos(toRad(c.lat)) * Math.sin(dLon / 2) ** 2
    const dist = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    if (dist < bestDist) {
      bestDist = dist
      best = id
    }
  }

  return best
}

export function readStoredWeatherCity(): {
  mode: WeatherCityMode
  cityId: WeatherCityId
} {
  if (typeof window === "undefined") {
    return { mode: "auto", cityId: "seoul" }
  }

  const modeRaw = localStorage.getItem(WEATHER_CITY_MODE_KEY)
  const mode: WeatherCityMode = modeRaw === "manual" ? "manual" : "auto"
  const cityRaw = localStorage.getItem(WEATHER_CITY_STORAGE_KEY)
  const cityId = cityRaw && isWeatherCityId(cityRaw) ? cityRaw : "seoul"

  return { mode, cityId }
}

export function storeWeatherCity(mode: WeatherCityMode, cityId: WeatherCityId) {
  localStorage.setItem(WEATHER_CITY_MODE_KEY, mode)
  localStorage.setItem(WEATHER_CITY_STORAGE_KEY, cityId)
}
