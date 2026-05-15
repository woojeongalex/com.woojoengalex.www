"use client"

import Link from "next/link"
import { useCallback, useEffect, useState } from "react"
import { useSearchParams } from "next/navigation"
import { ArrowLeft, Loader2, MapPin } from "lucide-react"
import { WeatherDayIcon, getWeatherLabelClass } from "@/components/weather-day-icon"
import { cn } from "@/lib/utils"
import { isWeatherCityId, type WeatherCityId } from "@/lib/weather-cities"

type DailyForecast = {
  date: string
  temp: number
  temp_min: number
  temp_max: number
  description: string
  icon: string | null
}

type CityForecast = {
  id: WeatherCityId
  name: string
  name_ko: string
  current: {
    temp: number
    description: string
    icon: string | null
  }
  days: DailyForecast[]
}

function formatDayLabel(dateStr: string, index: number) {
  if (index === 0) return "오늘"
  const date = new Date(`${dateStr}T12:00:00`)
  return new Intl.DateTimeFormat("ko-KR", {
    month: "long",
    day: "numeric",
    weekday: "short",
  }).format(date)
}

function CityForecastSection({ city }: { city: CityForecast }) {
  return (
    <section id={city.id} className="scroll-mt-24">
      <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-950 px-4 py-4 text-white sm:px-5">
        <WeatherDayIcon
          icon={city.current.icon}
          description={city.current.description}
        />
        <div className="min-w-0 flex-1">
          <h2 className="text-xl font-semibold">{city.name_ko}</h2>
          <p className="text-sm text-zinc-400">{city.name}</p>
          <p className="mt-1 capitalize text-zinc-300">{city.current.description}</p>
        </div>
        <p className="text-4xl font-semibold tabular-nums">{city.current.temp}°</p>
      </div>

      <ul className="mt-3 space-y-2">
        {city.days.map((day, index) => {
          const labelClass = getWeatherLabelClass(day.icon, day.description)
          return (
            <li
              key={day.date}
              className="flex items-center gap-4 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-4 sm:px-5"
            >
              <div className="w-28 shrink-0">
                <p className="text-sm font-semibold text-zinc-900">
                  {formatDayLabel(day.date, index)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">{day.date}</p>
              </div>
              <WeatherDayIcon icon={day.icon} description={day.description} />
              <div className="min-w-0 flex-1">
                <p className={cn("text-lg font-semibold capitalize", labelClass)}>
                  {day.description}
                </p>
                <p className="mt-1 text-sm text-zinc-600">
                  최저 {day.temp_min}° · 최고 {day.temp_max}°
                </p>
              </div>
              <p className="text-2xl font-semibold tabular-nums text-zinc-950">{day.temp}°</p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}

export function WeatherDetailContent() {
  const searchParams = useSearchParams()
  const cityParam = searchParams.get("city")
  const initialCity = cityParam && isWeatherCityId(cityParam) ? cityParam : "seoul"

  const [activeCity, setActiveCity] = useState<WeatherCityId>(initialCity)
  const [cities, setCities] = useState<CityForecast[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch("/api/weather/forecasts")
      const data = (await res.json()) as { cities?: CityForecast[]; error?: string }
      if (!res.ok) {
        throw new Error(data.error ?? "예보를 불러오지 못했습니다.")
      }
      if (!data.cities?.length) {
        throw new Error("예보 데이터가 비어 있습니다.")
      }
      setCities(data.cities)
    } catch (e) {
      setCities([])
      setError(e instanceof Error ? e.message : "알 수 없는 오류")
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load()
  }, [load])

  useEffect(() => {
    if (cityParam && isWeatherCityId(cityParam)) {
      setActiveCity(cityParam)
      document.getElementById(cityParam)?.scrollIntoView({ behavior: "smooth", block: "start" })
    }
  }, [cityParam, cities])

  const scrollToCity = (cityId: WeatherCityId) => {
    setActiveCity(cityId)
    document.getElementById(cityId)?.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white text-zinc-950">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:py-14">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-950"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          홈으로
        </Link>

        <header className="mt-8">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
            <MapPin className="h-4 w-4" aria-hidden="true" />
            <span>서울 · 도쿄 · 뉴욕 · 런던</span>
          </div>
          <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            1주일 날씨 예보
          </h1>
          <p className="mt-3 text-sm leading-7 text-zinc-600">
            세계 주요 도시의 현재 날씨와 1주일 예보를 확인할 수 있습니다. API 제공 범위에
            따라 5~7일이 표시될 수 있습니다.
          </p>
        </header>

        {!loading && cities.length > 0 && (
          <nav className="mt-8 flex flex-wrap gap-2" aria-label="도시 선택">
            {cities.map((city) => (
              <button
                key={city.id}
                type="button"
                onClick={() => scrollToCity(city.id)}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-medium transition-colors",
                  activeCity === city.id
                    ? "border-zinc-900 bg-zinc-900 text-white"
                    : "border-zinc-200 bg-white text-zinc-700 hover:bg-zinc-50"
                )}
              >
                {city.name_ko}
              </button>
            ))}
          </nav>
        )}

        {loading && (
          <div className="mt-12 flex items-center justify-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            예보 불러오는 중…
          </div>
        )}

        {error && (
          <div className="mt-12 rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
            <p className="text-sm text-red-700">{error}</p>
            <button
              type="button"
              onClick={() => void load()}
              className="mt-4 text-sm font-medium text-zinc-800 underline-offset-2 hover:underline"
            >
              다시 시도
            </button>
          </div>
        )}

        {!loading && cities.length > 0 && (
          <div className="mt-10 space-y-12">
            {cities.map((city) => (
              <CityForecastSection key={city.id} city={city} />
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
