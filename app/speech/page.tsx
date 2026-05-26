"use client"

import { useEffect, useState } from "react"
import { ListChecks, Mic, StopCircle } from "lucide-react"
import { PageBackButton } from "@/components/page-back-button"
import { useAsyncAction } from "@/hooks/use-async-action"
import { useMicRecording } from "@/hooks/use-mic-recording"
import { demoSpeechFeedback } from "@/lib/speech-analyze"
import {
  fetchSpeechTopics,
  postSpeechEvaluation,
  type SpeechTopicHit,
} from "@/lib/speech-api"

export default function SpeechPage() {
  const { loading, error, success, run } = useAsyncAction()
  const mic = useMicRecording()
  const [topics, setTopics] = useState<SpeechTopicHit[]>([])
  const [topicId, setTopicId] = useState<string | null>(null)
  const [result, setResult] = useState<ReturnType<typeof demoSpeechFeedback> | null>(
    null
  )
  const [status, setStatus] = useState("고민 주제를 선택한 뒤 마이크로 말해 보세요.")

  useEffect(() => {
    fetchSpeechTopics()
      .then((data) => setTopics(data.hits))
      .catch(() => setStatus("스피치 주제를 불러오지 못했습니다."))
  }, [])

  const handleStart = async () => {
    if (!topicId) {
      setStatus("먼저 고민 주제를 선택해 주세요.")
      return
    }
    const ok = await mic.start()
    setStatus(
      ok ? "녹음 중입니다. 멈추기를 눌러 AI 피드백을 받으세요." : "마이크 권한이 필요합니다."
    )
  }

  const handleStop = () => {
    if (!topicId) return
    void mic.stop(async (sec) => {
      const analysis = demoSpeechFeedback(topicId, sec)
      setResult(analysis)
      setStatus("스피치 피드백을 Neon에 저장 중입니다.")
      await run(
        () =>
          postSpeechEvaluation({
            topicId,
            clarityScore: analysis.clarityScore,
            paceScore: analysis.paceScore,
            toneScore: analysis.toneScore,
            summary: analysis.summary,
            feedbackPoints: analysis.feedbackPoints,
            fileName: "speech-mic.webm",
            durationSec: sec,
          }),
        { successMessage: "스피치 피드백이 저장되었습니다." }
      )
    })
  }

  return (
    <main className="mx-auto min-h-screen max-w-3xl px-4 py-8 sm:px-6">
      <PageBackButton />
      <h1 className="mt-6 text-3xl font-bold text-zinc-950">스피치 코칭</h1>
      <p className="mt-2 text-sm text-zinc-600">
        발표·면접·일상 대화 연습 후 AI 말하기 피드백을 받습니다.
      </p>

      <section className="mt-8 grid gap-2 sm:grid-cols-2">
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
              className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                active
                  ? "border-zinc-900 bg-zinc-900 text-white"
                  : "border-zinc-200 bg-white hover:bg-zinc-50"
              }`}
            >
              <p className="font-semibold">{topic.label}</p>
              <p className={`mt-1 text-xs ${active ? "text-zinc-300" : "text-zinc-600"}`}>
                {topic.description}
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
            <ListChecks className="h-4 w-4" aria-hidden />
            AI 피드백
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-sm">
            <div>
              <p className="text-lg font-bold">{result.clarityScore}</p>
              <p className="text-zinc-600">명확도</p>
            </div>
            <div>
              <p className="text-lg font-bold">{result.paceScore}</p>
              <p className="text-zinc-600">속도</p>
            </div>
            <div>
              <p className="text-lg font-bold">{result.toneScore}</p>
              <p className="text-zinc-600">톤</p>
            </div>
          </div>
          <p className="mt-4 text-sm leading-7 text-zinc-700">{result.summary}</p>
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-zinc-700">
            {result.feedbackPoints.map((point) => (
              <li key={point}>{point}</li>
            ))}
          </ul>
          <p className="mt-3 text-xs text-zinc-500">{mic.durationSec}초 녹음 기준</p>
        </section>
      )}
    </main>
  )
}
