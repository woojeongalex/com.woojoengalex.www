'use client'

import { useEffect, useRef, useState } from 'react'

interface RecordingVisualizerProps {
  active: boolean
  accent?: string
  barCount?: number
}

export function RecordingVisualizer({
  active,
  accent = 'var(--primary)',
  barCount = 28,
}: RecordingVisualizerProps) {
  const [heights, setHeights] = useState<number[]>(() =>
    Array.from({ length: barCount }, () => 8)
  )
  const rafRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (!active) return
    const tick = () => {
      setHeights(
        Array.from({ length: barCount }, () => 12 + Math.random() * 88)
      )
      rafRef.current = setTimeout(tick, 80)
    }
    tick()
    return () => {
      if (rafRef.current) clearTimeout(rafRef.current)
    }
  }, [active, barCount])

  const displayHeights = active
    ? heights
    : Array.from({ length: barCount }, () => 8)

  return (
    <div
      className={`flex items-end gap-0.5 w-full rounded-xl px-2 ${active ? 'bg-primary/5' : 'bg-transparent'}`}
      style={{ height: 52 }}
      aria-hidden="true"
    >
      {displayHeights.map((h, i) => (
        <div
          key={i}
          className={`flex-1 rounded-full ${active ? '' : 'bg-muted-foreground'}`}
          style={{
            height: `${h}%`,
            minHeight: 3,
            background: active ? accent : undefined,
            opacity: active ? 0.75 + (h / 100) * 0.25 : 0.2,
            transition: active ? 'height 70ms ease-out' : 'none',
          }}
        />
      ))}
    </div>
  )
}
