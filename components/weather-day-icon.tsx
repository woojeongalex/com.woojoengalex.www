import { cn } from "@/lib/utils"
import { getWeatherVisual } from "@/lib/weather-visual"

type WeatherDayIconProps = {
  icon: string | null
  description: string
  className?: string
}

export function WeatherDayIcon({ icon, description, className }: WeatherDayIconProps) {
  const visual = getWeatherVisual(icon, description)

  return (
    <div
      className={cn(
        "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl text-[1.75rem] leading-none shadow-sm ring-2",
        visual.bgClass,
        visual.ringClass,
        className
      )}
      aria-hidden="true"
    >
      {visual.emoji}
    </div>
  )
}

export function getWeatherLabelClass(icon: string | null, description: string) {
  return getWeatherVisual(icon, description).labelClass
}
