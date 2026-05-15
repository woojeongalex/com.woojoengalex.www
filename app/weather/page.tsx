import { Suspense } from "react"
import { Loader2 } from "lucide-react"
import { WeatherDetailContent } from "./weather-detail-content"

export default function WeatherDetailPage() {
  return (
    <Suspense
      fallback={
        <main className="flex min-h-[calc(100vh-4rem)] items-center justify-center bg-white">
          <span className="flex items-center gap-2 text-sm text-zinc-500">
            <Loader2 className="h-5 w-5 animate-spin" aria-hidden="true" />
            예보 불러오는 중…
          </span>
        </main>
      }
    >
      <WeatherDetailContent />
    </Suspense>
  )
}
