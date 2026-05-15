"use client"

import { useCallback, useEffect, useState } from "react"
import {
  nearestWeatherCityId,
  readStoredWeatherCity,
  storeWeatherCity,
  WEATHER_CITY_MODE_KEY,
  type WeatherCityId,
  type WeatherCityMode,
} from "@/lib/weather-cities"

type UseWeatherCityResult = {
  cityId: WeatherCityId
  mode: WeatherCityMode
  locating: boolean
  selectCity: (id: WeatherCityId) => void
  useCurrentLocation: () => void
}

export function useWeatherCity(): UseWeatherCityResult {
  const [cityId, setCityId] = useState<WeatherCityId>("seoul")
  const [mode, setMode] = useState<WeatherCityMode>("auto")
  const [locating, setLocating] = useState(true)

  const detectLocation = useCallback(() => {
    if (typeof window === "undefined" || !navigator.geolocation) {
      setLocating(false)
      return
    }

    setLocating(true)
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const nearest = nearestWeatherCityId(pos.coords.latitude, pos.coords.longitude)
        setCityId(nearest)
        storeWeatherCity("auto", nearest)
        setLocating(false)
      },
      () => {
        setLocating(false)
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600_000 }
    )
  }, [])

  useEffect(() => {
    const stored = readStoredWeatherCity()
    setMode(stored.mode)
    setCityId(stored.cityId)

    if (stored.mode === "auto") {
      detectLocation()
    } else {
      setLocating(false)
    }
  }, [detectLocation])

  const selectCity = useCallback((id: WeatherCityId) => {
    setMode("manual")
    setCityId(id)
    storeWeatherCity("manual", id)
    setLocating(false)
  }, [])

  const useCurrentLocation = useCallback(() => {
    setMode("auto")
    if (typeof window !== "undefined") {
      localStorage.setItem(WEATHER_CITY_MODE_KEY, "auto")
    }
    detectLocation()
  }, [detectLocation])

  return { cityId, mode, locating, selectCity, useCurrentLocation }
}
