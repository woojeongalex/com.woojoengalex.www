export type WeatherVisual = {
  emoji: string
  bgClass: string
  ringClass: string
  labelClass: string
}

const BY_ICON: Record<string, WeatherVisual> = {
  "01": {
    emoji: "☀️",
    bgClass: "bg-amber-400",
    ringClass: "ring-amber-500/50",
    labelClass: "text-amber-700",
  },
  "02": {
    emoji: "🌤️",
    bgClass: "bg-sky-400",
    ringClass: "ring-sky-500/50",
    labelClass: "text-sky-700",
  },
  "03": {
    emoji: "⛅",
    bgClass: "bg-slate-400",
    ringClass: "ring-slate-500/50",
    labelClass: "text-slate-700",
  },
  "04": {
    emoji: "☁️",
    bgClass: "bg-zinc-500",
    ringClass: "ring-zinc-600/50",
    labelClass: "text-zinc-700",
  },
  "09": {
    emoji: "🌦️",
    bgClass: "bg-blue-500",
    ringClass: "ring-blue-600/50",
    labelClass: "text-blue-700",
  },
  "10": {
    emoji: "🌧️",
    bgClass: "bg-indigo-500",
    ringClass: "ring-indigo-600/50",
    labelClass: "text-indigo-700",
  },
  "11": {
    emoji: "⛈️",
    bgClass: "bg-violet-600",
    ringClass: "ring-violet-700/50",
    labelClass: "text-violet-700",
  },
  "13": {
    emoji: "❄️",
    bgClass: "bg-cyan-400",
    ringClass: "ring-cyan-500/50",
    labelClass: "text-cyan-700",
  },
  "50": {
    emoji: "🌫️",
    bgClass: "bg-stone-500",
    ringClass: "ring-stone-600/50",
    labelClass: "text-stone-700",
  },
}

const DEFAULT_VISUAL: WeatherVisual = {
  emoji: "🌡️",
  bgClass: "bg-zinc-400",
  ringClass: "ring-zinc-500/50",
  labelClass: "text-zinc-700",
}

function matchDescription(description: string): WeatherVisual | null {
  const d = description.toLowerCase()

  if (/천둥|번개|뇌우|thunder|storm/.test(d)) return BY_ICON["11"]
  if (/눈|snow|blizzard/.test(d)) return BY_ICON["13"]
  if (/소나기|이슬비|shower|drizzle/.test(d)) return BY_ICON["09"]
  if (/비|rain/.test(d)) return BY_ICON["10"]
  if (/안개|흐림|연무|mist|fog|haze|smoke|dust|sand/.test(d)) return BY_ICON["50"]
  if (/구름|cloud|overcast/.test(d)) return BY_ICON["04"]
  if (/맑|clear|sunny/.test(d)) return BY_ICON["01"]

  return null
}

export function getWeatherVisual(icon: string | null, description: string): WeatherVisual {
  const code = icon?.replace(/[dn]$/i, "").slice(0, 2)
  if (code && BY_ICON[code]) return BY_ICON[code]
  return matchDescription(description) ?? DEFAULT_VISUAL
}
