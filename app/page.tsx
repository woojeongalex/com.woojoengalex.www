"use client"

import dynamic from "next/dynamic"
import { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { ArrowRight, AudioLines, Circle, Music4, Send } from "lucide-react"
import { Skeleton } from "@/components/ui/skeleton"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { sendEmail } from "@/lib/the-wire-api"

const DynamicGeminiChat = dynamic(
  () => import("@/components/gemini-chat").then((m) => ({ default: m.GeminiChat })),
  {
    ssr: false,
    loading: () => (
      <div className="w-full space-y-3 rounded-2xl border border-border bg-card p-4">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-24 w-full" />
        <Skeleton className="h-9 w-full" />
      </div>
    ),
  }
)

const DynamicWeeklyKingBanner = dynamic(
  () => import("@/components/weekly-king-banner").then((m) => ({ default: m.WeeklyKingBanner })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-2xl" />,
  }
)

const DynamicIuemGuideCarousel = dynamic(
  () => import("@/components/iuem-guide-carousel").then((m) => ({ default: m.IuemGuideCarousel })),
  {
    ssr: false,
    loading: () => <Skeleton className="h-48 w-full rounded-2xl" />,
  }
)

const LOG_LINES = [
  { time: "00:00:01", level: "INFO", msg: "IUEM AI Engine initializing..." },
  { time: "00:00:02", level: "INFO", msg: "FastAPI backend connection established" },
  { time: "00:00:03", level: "OK",   msg: "Vocal analysis model loaded — pitch detector v2.1" },
  { time: "00:00:04", level: "OK",   msg: "Rhythm model ready — BPM comparator active" },
  { time: "00:00:05", level: "INFO", msg: "Instrument tuning module standby" },
  { time: "00:00:06", level: "OK",   msg: "Speech coaching pipeline connected" },
  { time: "00:00:07", level: "INFO", msg: "Awaiting user audio input..." },
  { time: "00:00:08", level: "INFO", msg: "Gemini AI coach on standby" },
  { time: "00:00:09", level: "OK",   msg: "All systems nominal — ready to analyze" },
  { time: "00:00:10", level: "INFO", msg: "Session active. Select a song to begin." },
]

const ACCENT = "#ffffff"

function TerminalWidget() {
  const [visibleCount, setVisibleCount] = useState(0)
  // ref on the scrollable container itself — never use scrollIntoView (오염 방지)
  const logRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (visibleCount >= LOG_LINES.length) return
    const t = setTimeout(() => setVisibleCount((c) => c + 1), 420)
    return () => clearTimeout(t)
  }, [visibleCount])

  useEffect(() => {
    const el = logRef.current
    if (!el) return
    // container 내부 스크롤만 이동, window 스크롤 건드리지 않음
    el.scrollTop = el.scrollHeight
  }, [visibleCount])

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden"
      style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}
    >
      {/* 타이틀 바 — 로그 영역과 DOM 분리 */}
      <div
        className="flex shrink-0 items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "#1f1f1f", background: "#111111" }}
      >
        <span className="h-3 w-3 rounded-full bg-red-500/70" />
        <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
        <span className="h-3 w-3 rounded-full bg-green-500/70" />
        <span className="ml-3 text-xs font-mono" style={{ color: "#555" }}>
          iuem-agent — AI status monitor
        </span>
        <Circle
          className="ml-auto h-2 w-2 animate-pulse"
          fill={ACCENT}
          style={{ color: ACCENT }}
        />
      </div>
      {/* 로그 본문 — 이 div 안에서만 스크롤, 외부 누출 없음 */}
      <div
        ref={logRef}
        className="h-56 overflow-y-auto overflow-x-hidden px-4 py-3 font-mono text-xs leading-6"
      >
        {LOG_LINES.slice(0, visibleCount).map((line) => (
          <div key={line.time} className="flex gap-3">
            <span className="shrink-0" style={{ color: "#444" }}>{line.time}</span>
            <span
              className="shrink-0"
              style={{
                color:
                  line.level === "OK"
                    ? ACCENT
                    : line.level === "INFO"
                      ? "#6b7280"
                      : "#f87171",
                minWidth: "2.5rem",
              }}
            >
              [{line.level}]
            </span>
            <span className="min-w-0 break-all" style={{ color: "#d1d5db" }}>{line.msg}</span>
          </div>
        ))}
        {visibleCount < LOG_LINES.length && (
          <span className="animate-pulse" style={{ color: ACCENT }}>▋</span>
        )}
      </div>
    </div>
  )
}

function TheWireWidget() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const data = Object.fromEntries(new FormData(e.currentTarget)) as {
      to: string
      subject: string
      topic: string
    }
    setLoading(true)
    setResult(null)
    try {
      await sendEmail(data)
      setResult({ success: true, message: "이메일이 전송됐습니다." })
      e.currentTarget.reset()
    } catch {
      setResult({ success: false, message: "전송에 실패했습니다." })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      className="w-full rounded-2xl border overflow-hidden"
      style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}
    >
      {/* 타이틀 바 */}
      <div
        className="flex shrink-0 items-center gap-2 px-4 py-3 border-b"
        style={{ borderColor: "#1f1f1f", background: "#111111" }}
      >
        <Send className="h-3 w-3" style={{ color: ACCENT }} />
        <span className="ml-1 text-xs font-mono" style={{ color: "#555" }}>
          the-wire — email agent
        </span>
      </div>
      {/* 폼 */}
      <form onSubmit={handleSubmit} className="px-4 py-3 space-y-2">
        <Input
          name="to"
          type="email"
          placeholder="받는 사람 (email)"
          required
          className="h-8 text-xs font-mono bg-transparent border-[#2a2a2a] text-[#d1d5db] placeholder:text-[#444] focus-visible:ring-0 focus-visible:border-[#444]"
        />
        <Input
          name="subject"
          placeholder="제목"
          required
          className="h-8 text-xs font-mono bg-transparent border-[#2a2a2a] text-[#d1d5db] placeholder:text-[#444] focus-visible:ring-0 focus-visible:border-[#444]"
        />
        <Textarea
          name="topic"
          placeholder="EXAONE에게 전달할 주제 (예: 오늘의 날씨를 한 줄로 재밌게 요약해줘)"
          required
          rows={2}
          className="text-xs font-mono bg-transparent border-[#2a2a2a] text-[#d1d5db] placeholder:text-[#444] focus-visible:ring-0 focus-visible:border-[#444] resize-none"
        />
        {result && (
          <p className={`text-xs font-mono ${result.success ? "" : "text-red-400"}`}
            style={result.success ? { color: ACCENT } : {}}>
            {result.success ? "▶ " : "✕ "}{result.message}
          </p>
        )}
        <Button
          type="submit"
          disabled={loading}
          size="sm"
          className="w-full text-xs font-mono h-8"
          style={{ background: ACCENT, color: "#000000" }}
        >
          {loading ? "EXAONE 작성 중..." : "전송"}
        </Button>
      </form>
    </div>
  )
}

const feedbackSamples = [
  {
    title: "음정 정확도 분석",
    description:
      "구간별 피치 안정성을 추적해 흔들리는 음, 밀리는 음, 지나치게 높은 음을 잡아냅니다.",
  },
  {
    title: "박자 정밀도 분석",
    description:
      "원곡 BPM과 사용자의 발성을 비교해 박자가 빨라지는 구간과 늦어지는 구간을 알려줍니다.",
  },
  {
    title: "AI 코칭 피드백",
    description:
      "호흡, 발성, 강세, 프레이징을 함께 분석해 다음 연습 포인트를 자연어로 제안합니다.",
  },
]

/* 배너 카드 — 라이트/다크 무관하게 항상 다크(악기 정체성 유지) */
const BANNER_CARD = {
  base: {
    borderColor: "#1f1f1f",
    background: "#111111",
  },
  hoverVocal: "#ffffff33",
  hoverInstrument: "#ffffff22",
}

export default function HomePage() {
  return (
    <main className="min-h-[calc(100vh-4rem)] min-w-0 overflow-x-hidden bg-background text-foreground">

      {/* ── HERO ── */}
      <section className="border-b border-border">
        <div className="mx-auto flex max-w-6xl flex-col gap-10 px-4 py-12 md:flex-row md:items-start md:justify-between md:py-16">

          {/* left */}
          <div className="max-w-[34rem]">
            <p
              className="mb-4 text-xs font-mono tracking-widest uppercase"
              style={{ color: ACCENT }}
            >
              // IUEM AI Agent
            </p>
            <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl md:text-6xl">
              노래를 고르고,
              <br />
              부르면서 AI로
              <br />
              음정과 박자를 분석하세요.
            </h1>
            <p className="mt-6 max-w-lg text-base leading-8 text-muted-foreground">
              사용자가 선택한 가요나 뮤지컬 넘버를 AI가 분석하고,
              내장 마이크로 부른 결과를 바탕으로 음정·박자 정확도,
              그리고 다음 연습을 위한 코칭 피드백까지 제공합니다.
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {/* 보컬 배너 — 항상 다크 */}
              <Link
                href="/analyze"
                className="group rounded-2xl border p-5 transition-all dark:hover:shadow-[0_0_24px_rgba(0,255,136,0.06)]"
                style={BANNER_CARD.base}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = BANNER_CARD.hoverVocal
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = BANNER_CARD.base.borderColor
                }}
              >
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#6b7280" }}>
                  <AudioLines className="h-4 w-4" aria-hidden="true" />
                  보컬 배너
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-white">가요 + 뮤지컬</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: "#9ca3af" }}>
                  선택한 곡 기반으로 음정, 박자,
                  발성 안정성을 분석하고 AI 피드백을 받으세요.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs" style={{ color: "#6b7280" }}>
                  {["K-Pop Analysis", "Musical Number", "Vocal Feedback"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border px-3 py-1"
                      style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div
                  className="mt-5 inline-flex items-center gap-2 text-sm font-medium"
                  style={{ color: ACCENT }}
                >
                  보컬 상세 보기
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              {/* 악기 배너 — 항상 다크 */}
              <Link
                href="/instrument"
                className="group rounded-2xl border p-5 transition-all dark:hover:shadow-[0_0_24px_rgba(255,255,255,0.04)]"
                style={BANNER_CARD.base}
                onMouseEnter={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = BANNER_CARD.hoverInstrument
                }}
                onMouseLeave={(e) => {
                  ;(e.currentTarget as HTMLElement).style.borderColor = BANNER_CARD.base.borderColor
                }}
              >
                <div className="flex items-center gap-2 text-sm font-medium" style={{ color: "#6b7280" }}>
                  <Music4 className="h-4 w-4" aria-hidden="true" />
                  악기 배너
                </div>
                <h3 className="mt-3 text-2xl font-semibold text-white">기타 + 피아노</h3>
                <p className="mt-3 text-sm leading-7" style={{ color: "#9ca3af" }}>
                  기타와 피아노의 음정 상태와 튜닝 정확도를 확인하고
                  점수를 받아보세요.
                </p>
                <div className="mt-4 flex flex-wrap gap-2 text-xs" style={{ color: "#6b7280" }}>
                  {["Guitar Tuning", "Piano Pitch Check", "Instrument Support"].map((t) => (
                    <span
                      key={t}
                      className="rounded-full border px-3 py-1"
                      style={{ borderColor: "#2a2a2a", background: "#0d0d0d" }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
                <div className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-white">
                  악기 상세 보기
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>

          {/* right — terminal (always dark) + chat (dynamic) */}
          <div className="mt-8 w-full max-w-xl space-y-4 md:mt-4 md:sticky md:top-32">
            <TerminalWidget />
            <TheWireWidget />
            <DynamicGeminiChat layout="sidebar" />
          </div>
        </div>
      </section>

      {/* ── WEEKLY + GUIDE ── */}
      <section className="border-b border-border">
        <div className="mx-auto max-w-6xl px-4 py-8 md:py-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 md:gap-5 md:items-start">
            <DynamicWeeklyKingBanner />
            <DynamicIuemGuideCarousel />
          </div>
        </div>
      </section>

      {/* ── AI FEEDBACK CARDS ── */}
      <section className="border-b border-border bg-muted/40 dark:bg-[#0d0d0d]">
        <div className="mx-auto max-w-6xl px-4 py-14">
          <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
            <div className="max-w-2xl">
              <p className="text-sm font-medium text-muted-foreground">AI가 제공할 분석</p>
              <h2 className="mt-2 text-3xl font-semibold tracking-tight">
                단순 점수만이 아니라, 왜 흔들렸는지까지 설명하는 보컬 피드백
              </h2>
            </div>
            <div
              className="rounded-full border px-4 py-2 text-sm font-mono"
              style={{ borderColor: "#1f1f1f", color: ACCENT }}
            >
              백엔드 연동 예정 기능
            </div>
          </div>

          <div className="mt-8 grid gap-5 md:grid-cols-3">
            {feedbackSamples.map((item) => (
              <article
                key={item.title}
                className="rounded-3xl border border-border bg-card p-6"
              >
                <AudioLines className="h-5 w-5" style={{ color: ACCENT }} aria-hidden="true" />
                <h3 className="mt-5 text-xl font-semibold">{item.title}</h3>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">
                  {item.description}
                </p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="mx-auto max-w-6xl px-4 py-14">
        <div
          className="rounded-[2rem] border px-6 py-10 sm:px-10"
          style={{ borderColor: "#333333", background: "#111111" }}
        >
          <p className="text-xs font-mono tracking-widest uppercase" style={{ color: ACCENT }}>
            // 다음 단계
          </p>
          <div className="mt-3 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-3xl">
              <h2 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
                선택한 노래, 사용자 음성, 분석 결과가 하나의 경험으로 이어지는 홈 화면
              </h2>
              <p className="mt-4 text-sm leading-7 text-white/60 sm:text-base">
                추후 백엔드가 연결되면 가요와 뮤지컬 넘버를 아우르는 곡 선택 API, 마이크 입력
                업로드, 음정/박자 정확도 분석, 그리고 자연어 피드백 결과를 이 홈 화면에서 바로
                보여줄 수 있도록 설계했습니다.
              </p>
            </div>
            <Link
              href="/analyze"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-5 py-3 text-sm font-medium transition-opacity hover:opacity-80"
              style={{ background: ACCENT, color: "#000000" }}
            >
              기능 시나리오 확인
              <ArrowRight className="h-4 w-4" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}
