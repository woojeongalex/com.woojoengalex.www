"use client"

import { useEffect, useState } from "react"
import { Guitar, Mic, Piano, StopCircle, Wrench } from "lucide-react"
import { PageBackButton } from "@/components/page-back-button"
import { useAsyncAction } from "@/hooks/use-async-action"
import { useMicRecording } from "@/hooks/use-mic-recording"
import { demoInstrumentTuning } from "@/lib/instrument-analyze"
import {
  fetchInstrumentCatalog,
  postInstrumentEvaluation,
  type InstrumentCatalogHit,
} from "@/lib/instrument-api"

const ACCENT = "#00FF88"

export default function InstrumentPage() {
  const { loading, error, success, run } = useAsyncAction()
  const mic = useMicRecording()
  const [catalog, setCatalog] = useState<InstrumentCatalogHit[]>([])
  const [selectedId, setSelectedId] = useState<"guitar" | "piano" | null>(null)
  const [result, setResult] = useState<ReturnType<typeof demoInstrumentTuning> | null>(null)
  const [status, setStatus] = useState("악기를 선택한 뒤 마이크로 연주를 녹음해 주세요.")

  useEffect(() => {
    fetchInstrumentCatalog()
      .then((data) => setCatalog(data.hits))
      .catch(() => setStatus("악기 목록을 불러오지 못했습니다."))
  }, [])

  const handleStart = async () => {
    if (!selectedId) { setStatus("기타 또는 피아노를 먼저 선택해 주세요."); return }
    const ok = await mic.start()
    setStatus(ok ? "연주 중입니다. 멈추기를 눌러 분석하세요." : "마이크 권한이 필요합니다.")
  }

  const handleStop = () => {
    if (!selectedId) return
    void mic.stop(async (sec) => {
      const analysis = demoInstrumentTuning(selectedId, sec)
      setResult(analysis)
      setStatus("튜닝 결과를 Neon에 저장 중입니다.")
      await run(
        () =>
          postInstrumentEvaluation({
            instrumentId: selectedId,
            tuningAccuracy: analysis.tuningAccuracy,
            pitchDeviationCents: analysis.pitchDeviationCents,
            summary: analysis.summary,
            stringReadings: analysis.stringReadings,
            fileName: `${selectedId}-mic.webm`,
            durationSec: sec,
          }),
        { successMessage: "튜닝 결과가 저장되었습니다." }
      )
    })
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl">
        <PageBackButton />

        {/* HERO */}
        <section className="mt-6 rounded-2xl border border-border bg-muted/40 px-6 py-8 dark:bg-[#0d0d0d]">
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: ACCENT }}>
            // Instrument Tuning
          </p>
          <h1 className="mt-3 text-3xl font-semibold">악기 튜닝</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            기타·피아노 연주를 녹음하고 튜닝·음정 피드백을 받습니다.
          </p>
        </section>

        {/* 악기 선택 */}
        <section className="mt-6 grid gap-3 sm:grid-cols-2">
          {catalog.map((item) => {
            const active = selectedId === item.instrument_id
            const Icon = item.instrument_id === "guitar" ? Guitar : Piano
            return (
              <button
                key={item.instrument_id}
                type="button"
                onClick={() => {
                  setSelectedId(item.instrument_id as "guitar" | "piano")
                  mic.reset()
                  setResult(null)
                  setStatus(`${item.label} 선택됨. 마이크 녹음을 시작하세요.`)
                }}
                className="rounded-2xl border p-5 text-left transition-colors"
                style={
                  active
                    ? { borderColor: ACCENT + "88", background: "#0d1a12" }
                    : undefined
                }
                data-active={active}
              >
                <Icon
                  className="mb-3 h-6 w-6"
                  style={{ color: active ? ACCENT : undefined }}
                  aria-hidden
                />
                <p className="font-semibold" style={{ color: active ? "#ffffff" : undefined }}>
                  {item.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">{item.standard_tuning}</p>
              </button>
            )
          })}
        </section>

        {/* 녹음 컨트롤 */}
        <section className="mt-6 rounded-2xl border border-border bg-card p-5">
          <p className="mb-4 text-sm font-medium">마이크 녹음</p>
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading || mic.recording === "recording"}
              onClick={handleStart}
              className="inline-flex items-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: ACCENT, color: "#0A0A0A" }}
            >
              <Mic className="h-4 w-4" aria-hidden />
              녹음 시작
            </button>
            <button
              type="button"
              disabled={mic.recording !== "recording" || loading}
              onClick={handleStop}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-colors disabled:opacity-40"
            >
              <StopCircle className="h-4 w-4" aria-hidden />
              멈추고 분석
            </button>
          </div>
          <p className="mt-4 text-sm font-mono text-muted-foreground" role="status">
            {error ?? success ?? status}
          </p>
        </section>

        {/* 결과 — 항상 다크(그린 악센트 정체성) */}
        {result && (
          <section
            className="mt-6 rounded-2xl border p-6"
            style={{ borderColor: ACCENT + "33", background: "#0d1a12" }}
          >
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: ACCENT }}>
              <Wrench className="h-4 w-4" aria-hidden />
              튜닝 결과
            </div>
            <p className="mt-4 text-4xl font-semibold text-white">{result.tuningAccuracy}%</p>
            <p className="mt-1 text-sm text-white/60">
              평균 편차 약 {result.pitchDeviationCents} cents · {mic.durationSec}초 녹음
            </p>
            <p className="mt-4 text-sm leading-7 text-white/80">{result.summary}</p>
            <ul className="mt-4 space-y-2">
              {result.stringReadings.map((row) => (
                <li key={row.label} className="flex justify-between text-sm font-mono">
                  <span className="text-white/50">{row.label}</span>
                  <span style={{ color: ACCENT }}>{row.cents} cents</span>
                </li>
              ))}
            </ul>
          </section>
        )}
      </div>
    </main>
  )
}
