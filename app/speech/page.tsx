'use client'

import { useEffect, useRef, useState } from 'react'
import { ListChecks, Mic, Sparkles, StopCircle } from 'lucide-react'
import { RecordingVisualizer } from '@/components/recording-visualizer'
import { PageBackButton } from '@/components/page-back-button'
import { useAsyncAction } from '@/hooks/use-async-action'
import { useMicRecording } from '@/hooks/use-mic-recording'
import { demoSpeechFeedback } from '@/lib/speech-analyze'
import {
  fetchSpeechTopics,
  postSpeechEvaluation,
  type SpeechTopicHit,
} from '@/lib/speech-api'
import { sendGeminiChatMessage } from '@/lib/gemini-chat-api'

type ChatMsg = { role: 'user' | 'assistant'; content: string }

function GeminiCoachPanel({ context }: { context: string }) {
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)

  const send = async (text?: string) => {
    const q = (text ?? input).trim()
    if (!q || loading) return
    setInput('')
    setLoading(true)
    setMessages((prev) => [...prev, { role: 'user', content: q }])
    try {
      const data = await sendGeminiChatMessage(`${context}\n\n${q}`)
      const reply = data.reply?.trim()
      if (reply) {
        setMessages((prev) => [...prev, { role: 'assistant', content: reply }])
      }
    } catch {
      /* silent */
    } finally {
      setLoading(false)
      const el = scrollRef.current
      if (el) el.scrollTop = el.scrollHeight
    }
  }

  return (
    <section className="rounded-3xl border border-border bg-card overflow-hidden">
      <div className="flex items-center gap-2 border-b border-border px-5 py-3">
        <span className="text-xs font-mono tracking-widest text-foreground">
          GEMINI
        </span>
        <span className="text-sm font-semibold">AI 스피치 코치</span>
      </div>
      <div
        ref={scrollRef}
        className="min-h-[5rem] max-h-48 overflow-y-auto px-4 py-3 space-y-2 text-sm"
      >
        {messages.length === 0 && !loading && (
          <p className="text-xs text-muted-foreground">
            스피치 결과를 바탕으로 Gemini에게 개선 방법을 물어보세요.
          </p>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <p
              className={`max-w-[90%] rounded-xl px-3 py-2 text-sm leading-relaxed ${m.role === 'user' ? 'bg-muted text-foreground' : 'text-muted-foreground'}`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {loading && (
          <p className="text-xs text-muted-foreground animate-pulse">
            응답 작성 중…
          </p>
        )}
      </div>
      {messages.length === 0 && (
        <div className="flex flex-wrap gap-2 px-4 pb-3">
          {['말하기 개선 방법', '다음 연습 추천', '점수 해석해줘'].map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => void send(q)}
              className="rounded-full border border-border px-3 py-1 text-xs text-muted-foreground transition-colors hover:bg-muted"
            >
              {q}
            </button>
          ))}
        </div>
      )}
      <div className="flex items-center gap-2 border-t border-border px-3 py-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') void send()
          }}
          placeholder="Gemini에게 물어보세요…"
          className="flex-1 bg-transparent text-sm text-foreground placeholder:text-muted-foreground outline-none"
          disabled={loading}
        />
        <button
          type="button"
          onClick={() => void send()}
          disabled={loading || !input.trim()}
          className="shrink-0 rounded-lg bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
        >
          전송
        </button>
      </div>
    </section>
  )
}

export default function SpeechPage() {
  const { loading, error, success, run } = useAsyncAction()
  const mic = useMicRecording()
  const [topics, setTopics] = useState<SpeechTopicHit[]>([])
  const [topicId, setTopicId] = useState<string | null>(null)
  const [result, setResult] = useState<ReturnType<
    typeof demoSpeechFeedback
  > | null>(null)
  const [status, setStatus] = useState(
    '고민 주제를 선택한 뒤 마이크로 말해 보세요.'
  )

  useEffect(() => {
    fetchSpeechTopics()
      .then((data) => setTopics(data.hits))
      .catch(() => setStatus('스피치 주제를 불러오지 못했습니다.'))
  }, [])

  const handleStart = async () => {
    if (!topicId) {
      setStatus('먼저 고민 주제를 선택해 주세요.')
      return
    }
    const ok = await mic.start()
    setStatus(
      ok
        ? '녹음 중입니다. 멈추기를 눌러 AI 피드백을 받으세요.'
        : '마이크 권한이 필요합니다.'
    )
  }

  const handleStop = () => {
    if (!topicId) return
    void mic.stop(async (sec) => {
      const analysis = demoSpeechFeedback(topicId, sec)
      setResult(analysis)
      setStatus('스피치 피드백을 저장 중입니다.')
      await run(
        () =>
          postSpeechEvaluation({
            topicId,
            clarityScore: analysis.clarityScore,
            paceScore: analysis.paceScore,
            toneScore: analysis.toneScore,
            summary: analysis.summary,
            feedbackPoints: analysis.feedbackPoints,
            fileName: 'speech-mic.webm',
            durationSec: sec,
          }),
        { successMessage: '스피치 피드백이 저장되었습니다.' }
      )
    })
  }

  const geminiContext = result
    ? `[스피치 코칭 결과] 명확도: ${result.clarityScore}, 속도: ${result.paceScore}, 톤: ${result.toneScore}. 요약: ${result.summary}. 피드백: ${result.feedbackPoints.join(', ')}`
    : ''

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-8 text-foreground sm:px-6">
      <div className="mx-auto max-w-3xl space-y-6">
        <PageBackButton />

        {/* HERO */}
        <section className="rounded-2xl border border-border bg-muted/40 px-6 py-8 dark:bg-[#0d0d0d]">
          <p className="text-xs font-mono tracking-widest uppercase text-foreground">
            {'// Speech Coaching'}
          </p>
          <h1 className="mt-3 text-3xl font-semibold">스피치 코칭</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            발표·면접·일상 대화 연습 후 AI 말하기 피드백을 받습니다.
          </p>
        </section>

        {/* 주제 선택 */}
        <section className="grid gap-3 sm:grid-cols-2">
          {topics.map((topic) => {
            const active = topicId === topic.topic_id
            return (
              <button
                key={topic.topic_id}
                type="button"
                onClick={() => {
                  setTopicId(topic.topic_id)
                  mic.reset()
                  setResult(null)
                  setStatus(`「${topic.label}」 주제 선택됨.`)
                }}
                className={`rounded-xl border p-4 text-left text-sm transition-all hover:bg-muted/40 ${
                  active
                    ? 'border-primary bg-primary/10'
                    : 'border-border bg-card'
                }`}
              >
                <p
                  className={`font-semibold ${active ? 'text-foreground' : ''}`}
                >
                  {topic.label}
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  {topic.description}
                </p>
              </button>
            )
          })}
        </section>

        {/* 녹음 컨트롤 */}
        <section className="rounded-2xl border border-border bg-card p-6">
          <p className="mb-4 text-sm font-medium">마이크 녹음</p>

          {/* 비주얼라이저 */}
          <div className="mb-4">
            <RecordingVisualizer active={mic.recording === 'recording'} />
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              disabled={loading || mic.recording === 'recording'}
              onClick={() => {
                void handleStart()
              }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              <Mic className="h-4 w-4" aria-hidden />
              녹음 시작
            </button>
            <button
              type="button"
              disabled={mic.recording !== 'recording' || loading}
              onClick={handleStop}
              className="inline-flex items-center gap-2 rounded-xl border border-border px-5 py-3 text-sm font-medium text-muted-foreground transition-colors disabled:opacity-40"
            >
              <StopCircle className="h-4 w-4" aria-hidden />
              멈추고 분석
            </button>
          </div>
          <p
            className="mt-4 text-sm font-mono text-muted-foreground"
            role="status"
          >
            {error ?? success ?? status}
          </p>
        </section>

        {/* 결과 */}
        {result && (
          <section className="rounded-2xl border border-primary/20 bg-primary/5 p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <ListChecks className="h-4 w-4" aria-hidden />
              AI 피드백
            </div>
            <div className="mt-5 grid grid-cols-3 gap-3 text-center">
              {[
                { label: '명확도', value: result.clarityScore },
                { label: '속도', value: result.paceScore },
                { label: '톤', value: result.toneScore },
              ].map(({ label, value }) => (
                <div
                  key={label}
                  className="rounded-xl border border-border bg-card p-4"
                >
                  <p className="text-2xl font-semibold text-foreground">
                    {value}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{label}</p>
                </div>
              ))}
            </div>
            <p className="mt-5 text-sm leading-7 text-foreground/80">
              {result.summary}
            </p>
            <ul className="mt-4 space-y-2">
              {result.feedbackPoints.map((point) => (
                <li
                  key={point}
                  className="flex items-start gap-2 text-sm text-muted-foreground"
                >
                  <span className="text-foreground">›</span>
                  {point}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs font-mono text-muted-foreground">
              {mic.durationSec}초 녹음 기준
            </p>
          </section>
        )}

        {/* Gemini 코치 */}
        {result ? (
          <GeminiCoachPanel context={geminiContext} />
        ) : (
          <section className="rounded-3xl border border-border bg-card p-6">
            <div className="flex items-center gap-2 text-sm font-medium text-foreground">
              <Sparkles className="h-4 w-4" aria-hidden />
              GEMINI AI 스피치 코치
            </div>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              스피치 분석이 완료되면 Gemini에게 발음, 속도, 톤 개선 방법을 바로
              물어볼 수 있습니다.
            </p>
          </section>
        )}
      </div>
    </main>
  )
}
