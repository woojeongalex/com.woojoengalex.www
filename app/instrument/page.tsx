"use client"

import { useRef, useState } from "react"
import {
  CheckCircle2,
  Guitar,
  Mic,
  Music4,
  Piano,
  Radio,
  StopCircle,
  Waves,
} from "lucide-react"
import { PageBackButton } from "@/components/page-back-button"

type InstrumentId = "guitar" | "piano"
type RecordingState = "idle" | "recording" | "done"

const instrumentCards: {
  id: InstrumentId
  title: string
  description: string
  detail: string
  icon: typeof Guitar
}[] = [
  {
    id: "guitar",
    title: "기타 튜닝",
    description:
      "현별 표준 음정과 현재 입력된 음을 비교해 튜닝 오차를 확인합니다.",
    detail: "E A D G B E 기준 튜닝 지원",
    icon: Guitar,
  },
  {
    id: "piano",
    title: "피아노 음정 체크",
    description:
      "건반 입력 음을 기준 피치와 비교해 안정성과 오차를 분석합니다.",
    detail: "A4 = 440Hz 기준 비교 지원",
    icon: Piano,
  },
]

const guitarStrings = [
  { name: "6번 줄 (E)", target: "E2", status: "대기" },
  { name: "5번 줄 (A)", target: "A2", status: "대기" },
  { name: "4번 줄 (D)", target: "D3", status: "대기" },
  { name: "3번 줄 (G)", target: "G3", status: "대기" },
  { name: "2번 줄 (B)", target: "B3", status: "대기" },
  { name: "1번 줄 (e)", target: "E4", status: "대기" },
]

const pianoNotes = [
  { name: "A4 기준", target: "440 Hz", status: "대기" },
  { name: "중앙 C", target: "C4", status: "대기" },
  { name: "입력 안정성", target: "—", status: "대기" },
]

export default function InstrumentPage() {
  const [selectedInstrument, setSelectedInstrument] = useState<InstrumentId | null>(
    null
  )
  const [recordingState, setRecordingState] = useState<RecordingState>("idle")
  const [statusMessage, setStatusMessage] = useState(
    "악기를 선택하면 마이크 입력과 튜닝 분석을 시작할 수 있습니다."
  )
  const panelRef = useRef<HTMLElement | null>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const selectInstrument = (id: InstrumentId) => {
    setSelectedInstrument(id)
    setRecordingState("idle")
    setStatusMessage(
      id === "guitar"
        ? "기타 줄을 하나씩 튕긴 뒤 마이크 녹음을 시작해 주세요."
        : "건반을 누른 뒤 마이크 녹음을 시작해 주세요."
    )
    requestAnimationFrame(() => {
      panelRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" })
    })
  }

  const startRecording = async () => {
    if (!selectedInstrument) return

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
      setStatusMessage(
        selectedInstrument === "guitar"
          ? "녹음 중입니다. 기타 줄을 순서대로 튕긴 뒤 정지 버튼을 눌러 주세요."
          : "녹음 중입니다. 건반을 누른 뒤 정지 버튼을 눌러 주세요."
      )
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
      selectedInstrument === "guitar"
        ? "입력이 저장되었습니다. 현별 표준 음정(E A D G B E)과 비교해 튜닝 오차를 계산할 준비가 되었습니다."
        : "입력이 저장되었습니다. A4 = 440Hz 기준으로 음정 안정성과 오차를 분석할 준비가 되었습니다."
    )
  }

  const activeCard = instrumentCards.find((item) => item.id === selectedInstrument)

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10 text-zinc-950">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PageBackButton />
        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:px-10">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-400 uppercase">
            Instrument Tuning
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            기타와 피아노를 포함한 악기 튜닝도
            <br />
            하나의 흐름으로 분석합니다.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            보컬 분석과 별개로, 악기 입력 신호를 기준 피치와 비교해 튜닝 정확도를 확인하고
            악기별 피드백을 제공하는 상세 페이지입니다.
          </p>
        </section>

        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="grid gap-5 md:grid-cols-2">
            {instrumentCards.map((item) => {
              const Icon = item.icon
              const isSelected = selectedInstrument === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => selectInstrument(item.id)}
                  aria-pressed={isSelected}
                  className={`rounded-3xl border p-6 text-left shadow-sm transition-colors ${
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
                  <h2 className="mt-6 text-2xl font-semibold">{item.title}</h2>
                  <p
                    className={`mt-3 text-sm leading-6 ${
                      isSelected ? "text-zinc-300" : "text-zinc-600"
                    }`}
                  >
                    {item.description}
                  </p>
                  <p
                    className={`mt-4 text-sm font-medium ${
                      isSelected ? "text-white" : "text-zinc-950"
                    }`}
                  >
                    {item.detail}
                  </p>
                  <p
                    className={`mt-4 text-xs font-medium ${
                      isSelected ? "text-zinc-400" : "text-zinc-500"
                    }`}
                  >
                    {isSelected ? "선택됨 · 아래에서 튜닝 시작" : "클릭하여 튜닝 시작"}
                  </p>
                </button>
              )
            })}
          </div>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Music4 className="h-4 w-4" aria-hidden="true" />
                지원 예정 악기
              </div>
              <div className="mt-5 flex flex-wrap gap-2 text-sm text-zinc-700">
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">
                  기타
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">
                  피아노
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">
                  베이스
                </span>
                <span className="rounded-full border border-zinc-200 bg-white px-4 py-2">
                  바이올린
                </span>
              </div>
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                <Waves className="h-4 w-4" aria-hidden="true" />
                튜닝 분석 방식
              </div>
              <p className="mt-4 text-sm leading-6 text-zinc-600">
                마이크 또는 라인 입력을 통해 받은 사운드에서 기준 피치를 추출하고, 악기별
                표준 음정과 비교해 튜닝 오차를 계산하는 흐름으로 확장될 수 있습니다.
              </p>
            </article>
          </aside>
        </section>

        {selectedInstrument && activeCard && (
          <section
            ref={panelRef}
            className="rounded-[2rem] border border-zinc-200 bg-zinc-50 p-6 shadow-sm sm:p-8"
            aria-label={`${activeCard.title} 튜닝 패널`}
          >
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm font-medium tracking-[0.14em] text-zinc-500 uppercase">
                  Tuning Session
                </p>
                <h2 className="mt-1 text-3xl font-semibold text-zinc-950">
                  {activeCard.title}
                </h2>
                <p className="mt-2 text-sm text-zinc-600">{activeCard.detail}</p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setSelectedInstrument(null)
                  setRecordingState("idle")
                  setStatusMessage(
                    "악기를 선택하면 마이크 입력과 튜닝 분석을 시작할 수 있습니다."
                  )
                }}
                className="self-start rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100"
              >
                선택 해제
              </button>
            </div>

            <div className="mt-8 grid gap-6 lg:grid-cols-2">
              <article className="rounded-3xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-zinc-100 p-3">
                    <Mic className="h-5 w-5 text-zinc-900" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">1단계</p>
                    <h3 className="text-xl font-semibold">마이크 입력</h3>
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

              <article className="rounded-3xl border border-zinc-200 bg-white p-6">
                <div className="flex items-center gap-3">
                  <div className="rounded-full bg-zinc-100 p-3">
                    <Waves className="h-5 w-5 text-zinc-900" aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm text-zinc-500">2단계</p>
                    <h3 className="text-xl font-semibold">튜닝 분석</h3>
                  </div>
                </div>

                <div className="mt-6 space-y-3">
                  {(selectedInstrument === "guitar" ? guitarStrings : pianoNotes).map(
                    (row) => (
                      <div
                        key={row.name}
                        className="flex items-center justify-between rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm"
                      >
                        <div>
                          <p className="font-medium text-zinc-950">{row.name}</p>
                          <p className="text-xs text-zinc-500">기준 {row.target}</p>
                        </div>
                        <span
                          className={`rounded-full px-3 py-1 text-xs font-medium ${
                            recordingState === "done"
                              ? "bg-emerald-100 text-emerald-800"
                              : recordingState === "recording"
                                ? "bg-amber-100 text-amber-800"
                                : "bg-zinc-200 text-zinc-600"
                          }`}
                        >
                          {recordingState === "done"
                            ? "분석 준비"
                            : recordingState === "recording"
                              ? "수신 중"
                              : row.status}
                        </span>
                      </div>
                    )
                  )}
                </div>

                {recordingState === "done" && (
                  <div className="mt-5 rounded-2xl border border-emerald-200 bg-emerald-50 p-4">
                    <div className="flex items-center gap-2 text-sm font-medium text-emerald-900">
                      <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                      튜닝 분석 준비 완료
                    </div>
                    <p className="mt-2 text-sm leading-6 text-emerald-800">
                      {selectedInstrument === "guitar"
                        ? "백엔드 피치 분석 API와 연결되면 현별 센트 오차와 튜닝 방향(높음/낮음)을 표시합니다."
                        : "백엔드 피치 분석 API와 연결되면 건반별 Hz 오차와 안정성 점수를 표시합니다."}
                    </p>
                  </div>
                )}
              </article>
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
