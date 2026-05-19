"use client"

import { useCallback, useRef, useState } from "react"
import {
  Brain,
  CheckCircle2,
  Loader2,
  MessageSquare,
  Mic,
  Mic2,
  Presentation,
  Radio,
  Sparkles,
  StopCircle,
  Users,
  Waves,
} from "lucide-react"
import { PageBackButton } from "@/components/page-back-button"

type ConcernId =
  | "presentation"
  | "pronunciation"
  | "structure"
  | "conversation"
  | "voice"
  | "anxiety"

type ListenState = "idle" | "listening" | "done"

const speechConcerns: {
  id: ConcernId
  title: string
  concern: string
  solution: string
  icon: typeof Mic2
  tags: string[]
}[] = [
  {
    id: "presentation",
    title: "발표·면접 긴장",
    concern: "말이 빨라지고 목소리가 떨려요.",
    solution:
      "AI가 호흡 리듬과 말 속도를 분석해, 긴장 구간에서 쓸 수 있는 짧은 멘트와 호흡 패턴을 제안합니다.",
    icon: Presentation,
    tags: ["면접", "발표", "긴장 완화"],
  },
  {
    id: "pronunciation",
    title: "발음·억양 고민",
    concern: "또박또박 말하고 싶은데 받침이나 억양이 어색해요.",
    solution:
      "녹음된 문장을 음소 단위로 비교해 어려운 음절을 짚고, 따라 읽을 연습 문장을 단계별로 만들어 줍니다.",
    icon: Mic2,
    tags: ["발음 교정", "억양", "따라 읽기"],
  },
  {
    id: "structure",
    title: "말의 구조·논리",
    concern: "하고 싶은 말은 많은데 순서가 엉켜요.",
    solution:
      "주제와 청중을 입력하면 도입–본론–결론 골격을 잡아 주고, 핵심 메시지 한 줄 요약까지 정리해 줍니다.",
    icon: MessageSquare,
    tags: ["스크립트", "논리", "요약"],
  },
  {
    id: "conversation",
    title: "대화·소통 스킬",
    concern: "상대 말에 바로 답하기 어렵고 침묵이 길어져요.",
    solution:
      "상황별(회의, 네트워킹, 일상) 응답 템플릿과 질문 유도 문장을 AI가 연습 시나리오로 제공합니다.",
    icon: Users,
    tags: ["대화", "리액션", "질문 만들기"],
  },
  {
    id: "voice",
    title: "목소리 톤·에너지",
    concern: "목소리가 작거나 단조로워 들린다는 말을 들어요.",
    solution:
      "피치·볼륨·말하기 속도를 시각화하고, 더 또렷하게 들리는 톤과 강세 포인트를 코칭합니다.",
    icon: Waves,
    tags: ["톤", "볼륨", "에너지"],
  },
  {
    id: "anxiety",
    title: "말하기 불안",
    concern: "말하기 전부터 불안하고 회피하게 돼요.",
    solution:
      "짧은 연습 루틴(1분 스피치, 거울 멘트)과 긍정 피드백 루프를 AI가 맞춤 일정으로 설계합니다.",
    icon: Brain,
    tags: ["불안", "루틴", "자신감"],
  },
]

const aiFlowSteps = [
  {
    step: "01",
    title: "고민 선택",
    description: "발표, 발음, 대화 등 지금 가장 큰 고민 영역을 고릅니다.",
  },
  {
    step: "02",
    title: "마이크로 말하기",
    description: "고민이나 상황을 말하면 음성이 글로 변환됩니다.",
  },
  {
    step: "03",
    title: "AI 코칭",
    description: "분석 결과와 오늘 연습할 한 걸음을 자연어로 받습니다.",
  },
]

function buildCoachingPrompt(concernTitle: string, concernExample: string, transcript: string) {
  return `당신은 한국어 스피치 코칭 전문 AI입니다.
사용자 고민 영역: ${concernTitle}
대표 고민 예시: ${concernExample}

사용자가 마이크로 말한 내용:
"""
${transcript.trim()}
"""

위 내용을 바탕으로 다음 형식으로 답해 주세요.
1. 공감 한 문장
2. 핵심 문제 짚기 (2~3문장)
3. 구체적인 해결 방법 3가지 (번호 목록)
4. 오늘 바로 할 수 있는 1분 연습 과제 1가지

친절하고 실용적으로, 존댓말로 작성해 주세요.`
}

export default function SpeechPage() {
  const [selectedConcern, setSelectedConcern] = useState<ConcernId>("presentation")
  const [listenState, setListenState] = useState<ListenState>("idle")
  const [transcript, setTranscript] = useState("")
  const [statusMessage, setStatusMessage] = useState(
    "고민 영역을 고른 뒤 마이크로 말해 보세요. 음성이 아래 칸에 표시됩니다."
  )
  const [aiReply, setAiReply] = useState<string | null>(null)
  const [aiError, setAiError] = useState<string | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const recognitionRef = useRef<SpeechRecognition | null>(null)
  const transcriptBaseRef = useRef("")

  const activeConcern =
    speechConcerns.find((c) => c.id === selectedConcern) ?? speechConcerns[0]

  const stopListening = useCallback(() => {
    recognitionRef.current?.stop()
    recognitionRef.current = null
    setListenState((prev) => (prev === "listening" ? "done" : prev))
  }, [])

  const startListening = () => {
    setAiReply(null)
    setAiError(null)

    const SpeechRecognitionCtor =
      typeof window !== "undefined"
        ? window.SpeechRecognition ?? window.webkitSpeechRecognition
        : undefined

    if (!SpeechRecognitionCtor) {
      setListenState("done")
      setStatusMessage(
        "이 브라우저는 음성 인식을 지원하지 않습니다. 아래 입력란에 말하고 싶은 내용을 직접 적어 주세요."
      )
      return
    }

    transcriptBaseRef.current = transcript.trim()
    const recognition = new SpeechRecognitionCtor()
    recognition.lang = "ko-KR"
    recognition.continuous = true
    recognition.interimResults = true

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let chunk = ""
      for (let i = event.resultIndex; i < event.results.length; i++) {
        chunk += event.results[i][0].transcript
      }
      const prefix = transcriptBaseRef.current
      setTranscript(prefix ? `${prefix} ${chunk}`.trim() : chunk.trim())
    }

    recognition.onerror = () => {
      setStatusMessage("음성 인식 중 오류가 났습니다. 잠시 후 다시 시도하거나 직접 입력해 주세요.")
      stopListening()
    }

    recognition.onend = () => {
      if (recognitionRef.current) {
        setListenState("done")
        setStatusMessage("말하기가 끝났습니다. AI 코칭 받기를 눌러 피드백을 확인하세요.")
        recognitionRef.current = null
      }
    }

    recognitionRef.current = recognition
    recognition.start()
    setListenState("listening")
    setStatusMessage("듣고 있습니다… 스피치 고민이나 상황을 편하게 말해 보세요.")
  }

  const requestAiCoaching = async () => {
    const text = transcript.trim()
    if (!text) {
      setAiError("말한 내용이 없습니다. 마이크로 말하거나 입력란에 고민을 적어 주세요.")
      return
    }

    setIsAnalyzing(true)
    setAiError(null)
    setAiReply(null)
    setStatusMessage("AI가 스피치 코칭 답변을 준비하고 있습니다…")

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: buildCoachingPrompt(
            activeConcern.title,
            activeConcern.concern,
            text
          ),
        }),
      })
      const data = (await res.json()) as { reply?: string; error?: string }
      if (!res.ok) {
        throw new Error(data.error ?? "AI 응답을 받지 못했습니다.")
      }
      setAiReply(data.reply ?? "")
      setStatusMessage("AI 코칭이 완료되었습니다. 아래 답변을 확인하세요.")
    } catch (e) {
      const message =
        e instanceof Error ? e.message : "AI 코칭 요청 중 오류가 발생했습니다."
      setAiError(message)
      setStatusMessage("다시 시도하거나 백엔드(GEMINI_API_KEY) 설정을 확인해 주세요.")
    } finally {
      setIsAnalyzing(false)
    }
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10 text-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageBackButton />
        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:px-10">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-400 uppercase">
            Speech Coaching
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            말하기 고민을
            <br />
            AI와 함께 풀어 가세요.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            발표 긴장, 발음, 논리 정리, 대화 스킬까지—스피치와 관련된 고민을 마이크로
            말하면 AI가 맞춤 코칭을 제안합니다.
          </p>
        </section>

        <section className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {speechConcerns.map((item) => {
            const Icon = item.icon
            const isSelected = selectedConcern === item.id
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => {
                  setSelectedConcern(item.id)
                  setAiReply(null)
                  setAiError(null)
                }}
                className={`flex flex-col rounded-3xl border p-6 text-left shadow-sm transition-colors ${
                  isSelected
                    ? "border-zinc-950 bg-zinc-950 text-white ring-2 ring-zinc-950 ring-offset-2"
                    : "border-zinc-200 bg-white hover:border-zinc-400 hover:bg-zinc-50"
                }`}
              >
                <div
                  className={`rounded-full p-3 w-fit ${
                    isSelected ? "bg-white/15" : "bg-zinc-100"
                  }`}
                >
                  <Icon
                    className={`h-5 w-5 ${isSelected ? "text-white" : "text-zinc-900"}`}
                    aria-hidden="true"
                  />
                </div>
                <h2 className="mt-5 text-xl font-semibold">{item.title}</h2>
                <p
                  className={`mt-3 text-sm font-medium ${
                    isSelected ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  이런 고민
                </p>
                <p
                  className={`mt-1 text-sm leading-6 ${
                    isSelected ? "text-zinc-300" : "text-zinc-700"
                  }`}
                >
                  「{item.concern}」
                </p>
                <p
                  className={`mt-4 text-sm font-medium ${
                    isSelected ? "text-zinc-400" : "text-zinc-500"
                  }`}
                >
                  AI가 돕는 방법
                </p>
                <p
                  className={`mt-1 flex-1 text-sm leading-6 ${
                    isSelected ? "text-zinc-300" : "text-zinc-600"
                  }`}
                >
                  {item.solution}
                </p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {item.tags.map((tag) => (
                    <span
                      key={tag}
                      className={`rounded-full border px-3 py-1 text-xs ${
                        isSelected
                          ? "border-zinc-600 bg-zinc-800 text-zinc-200"
                          : "border-zinc-200 bg-zinc-50 text-zinc-700"
                      }`}
                    >
                      {tag}
                    </span>
                  ))}
                </div>
              </button>
            )
          })}
        </section>

        <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
          <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm sm:p-8">
            <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
              <Sparkles className="h-4 w-4" aria-hidden="true" />
              AI 스피치 코칭 흐름
            </div>
            <div className="mt-6 space-y-5">
              {aiFlowSteps.map((flow) => (
                <div
                  key={flow.step}
                  className="rounded-2xl border border-zinc-200 bg-white p-5"
                >
                  <p className="text-xs font-semibold tracking-widest text-zinc-400">
                    {flow.step}
                  </p>
                  <h3 className="mt-2 text-lg font-semibold text-zinc-950">{flow.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-zinc-600">{flow.description}</p>
                </div>
              ))}
            </div>
          </article>

          <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
            <p className="text-sm font-medium text-zinc-500">지금 연습하기</p>
            <h2 className="mt-2 text-2xl font-semibold text-zinc-950">
              마이크 기반 실시간 스피치 분석
            </h2>
            <p className="mt-4 text-sm leading-7 text-zinc-600">
              선택한 고민:{" "}
              <span className="font-semibold text-zinc-950">{activeConcern.title}</span>
              . 마이크로 말하면 AI가 말 속도·표현·연습 과제까지 코칭해 드립니다.
            </p>

            <div className="mt-6 rounded-2xl border border-zinc-800 bg-zinc-950 p-5 text-white shadow-inner sm:p-6">
              <div className="flex items-center gap-3">
                <div
                  className={`rounded-full p-3 ${
                    listenState === "listening" ? "bg-white text-zinc-950" : "bg-zinc-800"
                  }`}
                >
                  <Mic className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-zinc-400">마이크 배너</p>
                  <h3 className="text-lg font-semibold">말하고 AI 코칭 받기</h3>
                </div>
                {listenState === "listening" && (
                  <span className="ml-auto flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1 text-xs font-medium text-zinc-300">
                    <span className="h-2 w-2 animate-pulse rounded-full bg-red-400" />
                    수신 중
                  </span>
                )}
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-300">{statusMessage}</p>

              <label className="mt-4 block text-xs font-medium text-zinc-400">
                인식된 말 / 직접 입력
                <textarea
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  rows={4}
                  placeholder="예: 내일 면접인데 말이 너무 빨라지고 목소리가 떨려요…"
                  className="mt-2 w-full resize-y rounded-xl border border-zinc-700 bg-zinc-900 px-4 py-3 text-sm leading-6 text-white placeholder:text-zinc-500 focus:border-zinc-500 focus:outline-none"
                />
              </label>

              <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                <button
                  type="button"
                  onClick={startListening}
                  disabled={listenState === "listening" || isAnalyzing}
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-100 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <Radio className="h-4 w-4" aria-hidden="true" />
                  말하기 시작
                </button>
                <button
                  type="button"
                  onClick={stopListening}
                  disabled={listenState !== "listening"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-600 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-40"
                >
                  <StopCircle className="h-4 w-4" aria-hidden="true" />
                  말하기 종료
                </button>
                <button
                  type="button"
                  onClick={requestAiCoaching}
                  disabled={isAnalyzing || listenState === "listening"}
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-900 bg-zinc-900 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 sm:ml-auto"
                >
                  {isAnalyzing ? (
                    <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Sparkles className="h-4 w-4" aria-hidden="true" />
                  )}
                  AI 코칭 받기
                </button>
              </div>
            </div>

            {aiError && (
              <p className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
                {aiError}
              </p>
            )}

            {aiReply && (
              <div className="mt-4 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-800">
                  <CheckCircle2 className="h-4 w-4 text-emerald-600" aria-hidden="true" />
                  AI 스피치 코칭
                </div>
                <p className="mt-3 whitespace-pre-wrap text-sm leading-7 text-zinc-700">
                  {aiReply}
                </p>
              </div>
            )}
          </article>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-10 text-white sm:px-10">
          <p className="text-sm font-medium text-zinc-400">IUEM 스피치</p>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
            말하기는 연습이 쌓이는 음악과 같습니다.
          </h2>
          <p className="mt-4 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            완벽한 한 번의 연설보다, 매일 조금씩 나아지는 연습이 중요합니다. AI는
            당신의 고민을 듣고, 다음 연습 한 걸음만 명확하게 제안합니다.
          </p>
        </section>
      </div>
    </main>
  )
}
