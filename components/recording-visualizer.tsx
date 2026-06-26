"use client"

import { useEffect, useRef, useState } from "react"

interface RecordingVisualizerProps {
  active: boolean
  accent?: string
  barCount?: number
}

export function RecordingVisualizer({
  active,
  accent = "#00FF88",
  barCount = 28,
}: RecordingVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 8)
  )
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!active) {
      setHeights(Array.from({ length: barCount }, () => 8))
      return
    }
    const tick = () => {
      setHeights(Array.from({ length: barCount }, () => 12 + Math.random() * 88))
      rafRef.current = setTimeout(tick, 80)
    }
    tick()
    return () => {
      if (rafRef.current) clearTimeout(rafRef.current)
    }
  }, [active, barCount])

  return (
    <div
      className="flex items-end gap-0.5 w-full rounded-xl px-2"
      style={{ height: 52, background: active ? "rgba(0,255,136,0.05)" : "transparent" }}
      aria-hidden="true"
    >
      {heights.map((h, i) => (
        <div
          key={i}
          className="flex-1 rounded-full"
          style={{
            height: `${h}%`,
            minHeight: 3,
            background: active ? accent : "#374151",
            opacity: active ? 0.75 + (h / 100) * 0.25 : 0.2,
            transition: active ? "height 70ms ease-out" : "none",
          }}
        />
      ))}
    </div>
  )
}
