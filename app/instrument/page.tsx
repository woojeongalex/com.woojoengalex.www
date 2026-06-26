"use client"

import { useEffect, useRef, useState } from "react"
import { Guitar, Mic, Piano, Sparkles, StopCircle, Wrench } from "lucide-react"
import { RecordingVisualizer } from "@/components/recording-visualizer"
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

type ChatMsg = { role: "user" | "assistant"; content: string }

function GeminiCoachPanel({ context }: { context: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState("")
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const send = async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput("")
    setLoading(true)
    setMessages((prev) => [...prev, { role: "user", content: q }])
    try {
      const res = await fetch("/api/gemini/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: `${context}\n\n${q}` }),
      })
      const data = (await res.json()) as { reply?: string }
      if (data.reply?.trim()) {
        setMessages((prev) => [...prev, { role: "assistant", content: data.reply!.trim() }])
      }
    } catch { /* silent */ } finally {
      setLoading(false)
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="text-xs font-mono tracking-widest" style={{ color: ACCENT }}>GEMINI</span>
        <span className="text-sm font-semibold">AI 튜닝 코치</span>
      </div>
      <div ref={scrollRef} className="min-h-[5rem] max-h-48 overflow-y-auto px-4 py-3 space-y-2 text-sm">
        {messages.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground">튜닝 결과를 바탕으로 Gemini에게 개선 방법을 물어보세요.</p>
        )}
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
            <p className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed ${m.role === "user" ? "bg-muted text-foreground" : "text-muted-foreground"}`}>
              {m.content}
            </p>
          </div>
        ))}
        {loading && <p className="text-xs text-muted-foreground animate-pulse">응답 작성 중…</p>}
      </div>
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {["튜닝 개선 방법", "다음 연습 추천", "결과 해석해줘"].map((q) => (
            <button key={q} type="button" onClick={() => void send(q)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted">
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <input type="text" value={input} onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") void send() }}
          placeholder="Gemini에게 물어보세요…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          disabled={loading} />
        <button type="button" onClick={() => void send()} disabled={loading || !input.trim()}
          className="shrink-0 rounded-lg px-3 py-1.5 text-xs font-medium transition-opacity hover:opacity-80 disabled:opacity-40"
          style={{ background: ACCENT, color: "#0A0A0A" }}>
          전송
        </button>
      </div>
    </section>
  )
}

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
      setStatus("튜닝 결과를 저장 중입니다.")
      await run(
        () => postInstrumentEvaluation({
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

  const geminiContext = result
    ? `[악기 튜닝 결과] 악기: ${selectedId}, 튜닝 정확도: ${result.tuningAccuracy}%, 평균 편차: ${result.pitchDeviationCents}cents. 요약: ${result.summary}`
    : ""

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageBackButton />

        {/* HERO */}
        <section className="rounded-2xl border border-border bg-muted/40 px-6 py-8 dark:bg-[#0d0d0d]">
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: ACCENT }}>
            // Instrument Tuning
          </p>
          <h1 className="mt-3 text-3xl font-semibold">악기 튜닝</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            기타·피아노 연주를 녹음하고 튜닝·음정 피드백을 받습니다.
          </p>
        </section>

        {/* 악기 선택 */}
        <section className="grid gap-3 sm:grid-cols-2">
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
                className="rounded-2xl border border-border bg-card p-5 text-left transition-all hover:bg-muted/40"
                style={active ? { borderColor: ACCENT + "88", background: "#0d1a12" } : undefined}
              >
                <Icon className="mb-3 h-6 w-6" style={{ color: active ? ACCENT : undefined }} aria-hidden />
                <p className="font-semibold" style={{ color: active ? "#fff" : undefined }}>{item.label}</p>
                <p className="mt-1 text-xs text-muted-foreground">{item.standard_tuning}</p>
              </button>
            )
          })}
        </section>

        {/* 녹음 컨트롤 */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 text-sm font-medium">마이크 녹음</p>

          {/* 비주얼라이저 */}
          <div className="mb-4">
            <RecordingVisualizer active={mic.recording === "recording"} />
          </div>

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

        {/* 결과 */}
        {result && (
          <section className="rounded-2xl border p-6" style={{ borderColor: ACCENT + "33", background: "#0d1a12" }}>
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

        {/* Gemini 코치 */}
        {result ? (
          <GeminiCoachPanel context={geminiContext} />
        ) : (
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-medium" style={{ color: ACCENT }}>
              <Sparkles className="h-4 w-4" aria-hidden />
              GEMINI AI 튜닝 코치
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              튜닝 분석이 완료되면 Gemini에게 개선 방법과 연습 피드백을 바로 받을 수 있습니다.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
