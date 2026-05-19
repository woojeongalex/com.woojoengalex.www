"use client"

import { useMemo, useRef, useState } from "react"
import { CheckCircle2, Mic, Music4, Radio, Sparkles, StopCircle, Waves } from "lucide-react"
import { PageBackButton } from "@/components/page-back-button"

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

const songOptions = [
  {
    id: "spring-day",
    title: "봄날",
    artist: "BTS",
    bpm: 106,
    key: "E Major",
    range: "중저음 중심",
  },
  {
    id: "through-the-night",
    title: "밤편지",
    artist: "IU",
    bpm: 79,
    key: "C Major",
    range: "감성 발라드",
  },
  {
    id: "defying-gravity",
    title: "Defying Gravity",
    artist: "Wicked",
    bpm: 84,
    key: "F Major",
    range: "벨팅과 호흡 컨트롤 중심",
  },
]

export default function AnalyzePage() {
  const [selectedSongId, setSelectedSongId] = useState(songOptions[0].id)
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "done">(
    "idle"
  )
  const [statusMessage, setStatusMessage] = useState(
    "곡을 선택하고 마이크 권한을 허용하면 녹음을 시작할 수 있습니다."
  )
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const selectedSong = useMemo(
    () => songOptions.find((song) => song.id === selectedSongId) ?? songOptions[0],
    [selectedSongId]
  )

  const startRecording = async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setStatusMessage("이 브라우저는 마이크 녹음을 지원하지 않습니다.")
      return
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      streamRef.current = stream
      mediaRecorderRef.current = new MediaRecorder(stream)
      mediaRecorderRef.current.start()
      setRecordingState("recording")
      setStatusMessage("녹음 중입니다. 노래를 부른 뒤 정지 버튼을 눌러 주세요.")
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "마이크 권한을 확인해 주세요."
      setStatusMessage(`녹음을 시작할 수 없습니다. ${message}`)
    }
  }

  const stopRecording = () => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    mediaRecorderRef.current = null
    streamRef.current = null
    setRecordingState("done")
    setStatusMessage(
      "녹음이 종료되었습니다. 이제 백엔드 분석 API와 연결할 수 있습니다."
    )
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10 text-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageBackButton />
        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:px-10">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-400 uppercase">
            Analyze Session
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            곡 선택, 마이크 녹음, 분석 결과를
            <br />
            하나의 화면에서 연결합니다.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            이 페이지는 추후 백엔드 API와 직접 연결될 분석 워크플로우 화면입니다. 사용자는
            가요나 뮤지컬 넘버를 고르고, 마이크로 노래하고, AI가 음정과 박자를 분석한 뒤
            코칭 피드백을 받게 됩니다.
          </p>
        </section>

        <section className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-6">
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-zinc-100 p-3">
                  <Music4 className="h-5 w-5 text-zinc-900" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">1단계</p>
                  <h2 className="text-2xl font-semibold">곡 선택</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {songOptions.map((song) => (
                  <button
                    key={song.id}
                    type="button"
                    onClick={() => setSelectedSongId(song.id)}
                    className={`rounded-2xl border p-4 text-left transition-colors ${
                      selectedSongId === song.id
                        ? "border-zinc-950 bg-zinc-950 text-white"
                        : "border-zinc-200 bg-zinc-50 text-zinc-950 hover:bg-zinc-100"
                    }`}
                  >
                    <p className="text-base font-semibold">{song.title}</p>
                    <p
                      className={`mt-1 text-sm ${
                        selectedSongId === song.id ? "text-zinc-300" : "text-zinc-500"
                      }`}
                    >
                      {song.artist}
                    </p>
                    <div
                      className={`mt-4 space-y-1 text-xs ${
                        selectedSongId === song.id ? "text-zinc-400" : "text-zinc-500"
                      }`}
                    >
                      <p>BPM {song.bpm}</p>
                      <p>{song.key}</p>
                      <p>{song.range}</p>
                    </div>
                  </button>
                ))}
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-zinc-100 p-3">
                  <Mic className="h-5 w-5 text-zinc-900" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">2단계</p>
                  <h2 className="text-2xl font-semibold">마이크 녹음</h2>
                </div>
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm leading-6 text-zinc-600">{statusMessage}</p>
                <div className="mt-5 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={recordingState === "recording"}
                    className="inline-flex items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-300"
                  >
                    <Radio className="h-4 w-4" aria-hidden="true" />
                    녹음 시작
                  </button>
                  <button
                    type="button"
                    onClick={stopRecording}
                    disabled={recordingState !== "recording"}
                    className="inline-flex items-center justify-center gap-2 rounded-xl border border-zinc-300 px-5 py-3 text-sm font-medium text-zinc-950 transition-colors hover:bg-zinc-50 disabled:cursor-not-allowed disabled:text-zinc-400"
                  >
                    <StopCircle className="h-4 w-4" aria-hidden="true" />
                    녹음 정지
                  </button>
                </div>
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-zinc-100 p-3">
                  <Sparkles className="h-5 w-5 text-zinc-900" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">3단계</p>
                  <h2 className="text-2xl font-semibold">분석 결과</h2>
                </div>
              </div>

              <div className="mt-6 grid gap-4 md:grid-cols-3">
                <ResultCard
                  title="음정 정확도"
                  value="92%"
                  description="불안정 구간 자동 감지"
                />
                <ResultCard
                  title="박자 정확도"
                  value="88%"
                  description="빠른/느린 구간 시각화"
                />
                <ResultCard
                  title="AI 피드백"
                  value="A-"
                  description="호흡과 발성 개선 제안"
                />
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Waves className="h-4 w-4" aria-hidden="true" />
                  선택된 곡 기준 분석 준비
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  <span className="font-semibold text-zinc-950">{selectedSong.title}</span>의
                  원곡 BPM, 키, 예상 보컬 난이도를 기준으로 피치 라인과 리듬 정합도를 계산할 수
                  있도록 UI가 준비되어 있습니다.
                </p>
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">현재 선택</p>
              <h2 className="mt-2 text-2xl font-semibold">{selectedSong.title}</h2>
              <p className="mt-1 text-sm text-zinc-500">{selectedSong.artist}</p>

              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">BPM</dt>
                  <dd className="font-medium text-zinc-950">{selectedSong.bpm}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">Key</dt>
                  <dd className="font-medium text-zinc-950">{selectedSong.key}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-zinc-500">상태</dt>
                  <dd className="font-medium text-zinc-950">
                    {recordingState === "recording"
                      ? "녹음 중"
                      : recordingState === "done"
                        ? "분석 대기"
                        : "준비 완료"}
                  </dd>
                </div>
              </dl>
            </article>

            <article className="rounded-3xl border border-zinc-950 bg-zinc-950 p-6 text-white shadow-[0_20px_50px_rgba(0,0,0,0.12)]">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-300">
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                백엔드 API 연결 배너
              </div>
              <h2 className="mt-3 text-2xl font-semibold">
                이 화면은 바로 API와 연결할 수 있게 설계했습니다.
              </h2>
              <div className="mt-6 space-y-4 text-sm text-zinc-300">
                <ApiRow label="곡 목록 조회" value={`${apiBaseUrl}/songs`} />
                <ApiRow label="음원 분석 요청" value={`${apiBaseUrl}/analysis/songs/:songId`} />
                <ApiRow label="녹음 업로드" value={`${apiBaseUrl}/analysis/recordings`} />
                <ApiRow label="결과 조회" value={`${apiBaseUrl}/analysis/results/:resultId`} />
              </div>
              <p className="mt-6 text-sm leading-6 text-zinc-400">
                지금은 프론트 중심의 데모 화면이지만, 추후 FastAPI 백엔드에서 가요와
                뮤지컬 넘버 곡 메타데이터, 마이크 입력 업로드, 음정/박자 분석 결과, 자연어
                코칭 피드백까지 이 구조에 바로 주입할 수 있습니다.
              </p>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Sparkles className="h-4 w-4" aria-hidden="true" />
                추천 배너
              </div>
              <h2 className="mt-3 text-2xl font-semibold text-zinc-950">
                분석 결과를 바탕으로 추천 장르와 노래를 제안합니다.
              </h2>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                사용자의 음정 안정성, 박자 정확도, 발성 패턴을 기반으로 잘 맞는 장르와 다음에
                도전하면 좋은 추천 곡을 안내할 수 있습니다.
              </p>
              <div className="mt-5 grid gap-3 sm:grid-cols-2">
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
                    Recommendation
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-950">추천 장르</p>
                  <p className="mt-1 text-sm text-zinc-600">발라드, 뮤지컬 넘버</p>
                </div>
                <div className="rounded-2xl border border-zinc-200 bg-white p-4">
                  <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">
                    Recommendation
                  </p>
                  <p className="mt-2 text-sm font-semibold text-zinc-950">추천 곡</p>
                  <p className="mt-1 text-sm text-zinc-600">밤편지, Defying Gravity</p>
                </div>
              </div>
            </article>
          </aside>
        </section>
      </div>
    </main>
  )
}

function ResultCard({
  title,
  value,
  description,
}: {
  title: string
  value: string
  description: string
}) {
  return (
    <div className="rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
      <p className="text-sm text-zinc-500">{title}</p>
      <p className="mt-3 text-3xl font-semibold text-zinc-950">{value}</p>
      <p className="mt-2 text-sm leading-6 text-zinc-600">{description}</p>
    </div>
  )
}

function ApiRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-zinc-800 bg-black/20 p-4">
      <p className="text-xs font-medium tracking-[0.16em] text-zinc-500 uppercase">{label}</p>
      <p className="mt-2 break-all font-mono text-sm text-zinc-100">{value}</p>
    </div>
  )
}
