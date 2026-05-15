"use client"

import Link from "next/link"
import { useCallback, useEffect, useRef, useState } from "react"
import { ChevronDown, ChevronRight, Loader2, MapPin, RefreshCw } from "lucide-react"
import { WeatherDayIcon } from "@/components/weather-day-icon"
import { useWeatherCity } from "@/hooks/use-weather-city"
import { cn } from "@/lib/utils"
import {
  WEATHER_CITY_IDS,
  WEATHER_CITY_LABELS,
  type WeatherCityId,
} from "@/lib/weather-cities"

type CityWeather = {
  id: WeatherCityId
  name: string
  name_ko: string
  temp: number
  description: string
  icon: string | null
}

type WeatherWidgetProps = {
  variant?: "default" | "compact"
}

export function WeatherWidget({ variant = "default" }: WeatherWidgetProps) {
  const compact = variant === "compact"
  const { cityId, mode, locating, selectCity, useCurrentLocation } = useWeatherCity()
  const [weather, setWeather] = useState<CityWeather | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const pickerRef = useRef<HTMLDivElement>(null)

  const load = useCallback(async (targetCity: WeatherCityId) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/weather/current?city=${targetCity}`)
      const data = (await res.json()) as CityWeather & { error?: string }
      if (!res.ok) {
        throw new Error(data.error ?? "??? ???? ?????.")
      }
      setWeather(data)
    } catch (e) {
      setWeather(null)
      const raw = e instanceof Error ? e.message : "? ? ?? ??"
      const friendly =
        raw === "fetch failed" || raw.includes("Failed to fetch")
          ? "?? ??? ???? ?????. ???(uvicorn) ?? ??? ??? ???."
          : raw
      setError(friendly)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(cityId)
  }, [cityId, load])

  useEffect(() => {
    if (!pickerOpen) return

    const onPointerDown = (e: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target as Node)) {
        setPickerOpen(false)
      }
    }
    document.addEventListener("mousedown", onPointerDown)
    return () => document.removeEventListener("mousedown", onPointerDown)
  }, [pickerOpen])

  const cityLabel = weather?.name_ko ?? WEATHER_CITY_LABELS[cityId]
  const showLocating = locating && mode === "auto" && loading

  const picker = (
    <div
      ref={pickerRef}
      className={cn(
        "absolute z-50 min-w-[9.5rem] overflow-hidden rounded-lg border py-1 shadow-lg",
        compact
          ? "right-0 top-full mt-1 border-zinc-700 bg-zinc-900"
          : "left-0 top-full mt-1 w-full border-zinc-200 bg-white"
      )}
    >
      {WEATHER_CITY_IDS.map((id) => (
        <button
          key={id}
          type="button"
          onClick={() => {
            selectCity(id)
            setPickerOpen(false)
          }}
          className={cn(
            "flex w-full items-center justify-between px-3 py-2 text-left text-sm transition-colors",
            compact
              ? cn(
                  "hover:bg-zinc-800",
                  cityId === id ? "text-white" : "text-zinc-300"
                )
              : cn(
                  "hover:bg-zinc-50",
                  cityId === id ? "text-zinc-900" : "text-zinc-600"
                )
          )}
        >
          {WEATHER_CITY_LABELS[id]}
          {cityId === id && mode === "manual" && (
            <span className={cn("text-[10px]", compact ? "text-zinc-500" : "text-zinc-400")}>
              ??
            </span>
          )}
        </button>
      ))}
      <button
        type="button"
        onClick={() => {
          useCurrentLocation()
          setPickerOpen(false)
        }}
        className={cn(
          "flex w-full items-center gap-2 border-t px-3 py-2 text-left text-sm transition-colors",
          compact
            ? "border-zinc-700 text-sky-300 hover:bg-zinc-800"
            : "border-zinc-200 text-sky-600 hover:bg-zinc-50"
        )}
      >
        <MapPin className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
        ?? ??
      </button>
    </div>
  )

  if (compact) {
    return (
      <div className="relative flex items-center gap-1" aria-label="??">
        <div className="relative flex items-center rounded-lg border border-zinc-800 bg-zinc-950 text-white shadow-sm">
          {showLocating && (
            <span className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-zinc-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ?? ???
            </span>
          )}

          {!showLocating && loading && (
            <span className="flex items-center gap-1.5 px-2.5 py-2 text-xs text-zinc-300">
              <Loader2 className="h-3.5 w-3.5 animate-spin" aria-hidden="true" />
              ??
            </span>
          )}

          {!showLocating && !loading && error && (
            <span className="flex items-center gap-1 px-2 py-2 text-xs text-red-400">
              ??
              <button
                type="button"
                onClick={() => void load(cityId)}
                className="rounded p-0.5 hover:bg-zinc-800"
                aria-label="?? ??"
              >
                <RefreshCw className="h-3 w-3" aria-hidden="true" />
              </button>
            </span>
          )}

          {!showLocating && !loading && weather && (
            <>
              <Link
                href={`/weather?city=${cityId}`}
                className="flex min-w-0 items-center gap-1 px-2 py-1.5 transition-colors hover:bg-zinc-800 sm:gap-1.5 sm:pr-1"
                title={`${cityLabel} 1?? ??`}
              >
                <WeatherDayIcon
                  icon={weather.icon}
                  description={weather.description}
                  className="!h-7 !w-7 !text-base !ring-1"
                />
                <span className="max-w-[3.5rem] truncate text-[11px] font-medium text-zinc-300 sm:max-w-none sm:text-xs">
                  {mode === "auto" ? (
                    <>
                      <span className="text-zinc-500">? ?? ? </span>
                      {cityLabel}
                    </>
                  ) : (
                    cityLabel
                  )}
                </span>
                <span className="shrink-0 text-sm font-semibold tabular-nums">
                  {weather.temp}?
                </span>
                <span className="hidden max-w-[4rem] truncate capitalize text-[11px] text-zinc-400 sm:inline sm:max-w-[5rem] sm:text-xs">
                  {weather.description}
                </span>
              </Link>
              <button
                type="button"
                onClick={() => setPickerOpen((o) => !o)}
                className="shrink-0 rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-zinc-800 hover:text-white"
                aria-expanded={pickerOpen}
                aria-haspopup="listbox"
                aria-label="?? ??"
              >
                <ChevronDown
                  className={cn("h-3.5 w-3.5 transition-transform", pickerOpen && "rotate-180")}
                  aria-hidden="true"
                />
              </button>
              {pickerOpen && picker}
            </>
          )}
        </div>
        <button
          type="button"
          onClick={() => void load(cityId)}
          className="shrink-0 rounded-lg border border-zinc-800 bg-zinc-950 p-1.5 text-zinc-400 transition-colors hover:bg-black hover:text-white"
          aria-label="?? ????"
        >
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
        </button>
      </div>
    )
  }

  return (
    <div className="relative w-full max-w-md rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-zinc-900">??</h2>
        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => setPickerOpen((o) => !o)}
            className="rounded-lg px-2 py-1.5 text-xs font-medium text-zinc-600 hover:bg-zinc-100"
            aria-expanded={pickerOpen}
          >
            ?? ??
            <ChevronDown className="ml-0.5 inline h-3.5 w-3.5" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => void load(cityId)}
            className="rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-700"
            aria-label="?? ????"
          >
            <RefreshCw className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
      {pickerOpen && picker}

      {(showLocating || loading) && (
        <div className="flex items-center justify-center gap-2 py-6 text-sm text-zinc-500">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
          {showLocating ? "?? ?? ?? ??" : "?? ???? ??"}
        </div>
      )}

      {!showLocating && !loading && error && (
        <div className="py-4 text-center text-sm text-red-600">{error}</div>
      )}

      {!showLocating && !loading && weather && (
        <div className="space-y-3">
          <Link
            href={`/weather?city=${cityId}`}
            className="flex items-center gap-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3 transition-colors hover:bg-zinc-100"
          >
            <WeatherDayIcon icon={weather.icon} description={weather.description} />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-zinc-900">
                {mode === "auto" ? `? ?? ? ${cityLabel}` : cityLabel}
              </p>
              <p className="truncate text-xs capitalize text-zinc-600">{weather.description}</p>
            </div>
            <div className="flex items-center gap-1 text-zinc-900">
              <span className="text-2xl font-semibold tabular-nums">{weather.temp}?</span>
              <ChevronRight className="h-4 w-4 text-zinc-400" aria-hidden="true" />
            </div>
          </Link>
          <Link
            href={`/weather?city=${cityId}`}
            className="flex items-center justify-center gap-1 text-xs font-medium text-zinc-500 hover:text-zinc-800"
          >
            1?? ?? ??
            <ChevronRight className="h-3.5 w-3.5" aria-hidden="true" />
          </Link>
        </div>
      )}
    </div>
  )
}
