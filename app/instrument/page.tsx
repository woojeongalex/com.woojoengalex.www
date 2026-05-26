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

export default function InstrumentPage() {
  const { loading, error, success, run } = useAsyncAction()
  const mic = useMicRecording()
  const [catalog, setCatalog] = useState<InstrumentCatalogHit[]>([])
  const [selectedId, setSelectedId] = useState<"guitar" | "piano" | null>(null)
  const [result, setResult] = useState<ReturnType<typeof demoInstrumentTuning> | null>(
    null
  )
  const [status, setStatus] = useState("악기를 선택한 뒤 마이크로 연주를 녹음해 주세요.")

  useEffect(() => {
    fetchInstrumentCatalog()
      .then((data) => setCatalog(data.hits))
      .catch(() => setStatus("악기 목록을 불러오지 못했습니다."))
  }, [])

  const handleStart = async () => {
    if (!selectedId) {
      setStatus("기타 또는 피아노를 먼저 선택해 주세요.")
      return
    }
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
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <PageBackButton />
      <h1 className="mt-6 text-3xl font-bold text-zinc-950">악기 튜닝</h1>
      <p className="mt-2 text-sm text-zinc-600">
        기타·피아노 연주를 녹음하고 튜닝·음정 피드백을 받습니다.
      </p>

      <section className="mt-8 grid gap-3 sm:grid-cols-2">
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
              className={`rounded-2xl border p-4 text-left transition-colors ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white hover:bg-zinc-50"
              }`}
            >
              <Icon className="mb-2 h-5 w-5" aria-hidden />
              <p className="font-semibold">{item.label}</p>
              <p className={`mt-1 text-xs ${active ? "text-zinc-300" : "text-zinc-600"}`}>
                {item.standard_tuning}
              </p>
            </button>
          )
        })}
      </section>

      <div className="mt-8 flex flex-wrap gap-2">
        <button
          type="button"
          disabled={loading || mic.recording === "recording"}
          onClick={handleStart}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
        >
          <Mic className="h-4 w-4" aria-hidden />
          녹음 시작
        </button>
        <button
          type="button"
          disabled={mic.recording !== "recording" || loading}
          onClick={handleStop}
          className="inline-flex items-center gap-2 rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium disabled:opacity-50"
        >
          <StopCircle className="h-4 w-4" aria-hidden />
          멈추고 분석
        </button>
      </div>

      <p className="mt-4 text-sm text-zinc-600" role="status">
        {error ?? success ?? status}
      </p>

      {result && (
        <section className="mt-8 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
          <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
            <Wrench className="h-4 w-4" aria-hidden />
            튜닝 결과
          </div>
          <p className="mt-3 text-2xl font-bold">{result.tuningAccuracy}%</p>
          <p className="mt-1 text-sm text-zinc-600">
            평균 편차 약 {result.pitchDeviationCents} cents · {mic.durationSec}초 녹음
          </p>
          <p className="mt-3 text-sm leading-7 text-zinc-700">{result.summary}</p>
          <ul className="mt-4 space-y-1 text-xs text-zinc-600">
            {result.stringReadings.map((row) => (
              <li key={row.label}>
                {row.label}: {row.cents}cents
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
