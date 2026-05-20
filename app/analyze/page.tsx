"use client"

import { useCallback, useMemo, useRef, useState } from "react"
import {
  CheckCircle2,
  FileVideo,
  Mic,
  Music4,
  Radio,
  Search,
  Sparkles,
  StopCircle,
  Waves,
} from "lucide-react"
import { VOCAL_DROPZONE_COPY } from "@/components/media-analysis-dropzone"
import { PageBackButton } from "@/components/page-back-button"
import { VocalVideoDropzone } from "@/components/vocal-video-dropzone"
import type { VocalAnalysisResult } from "@/lib/analyze-media"
import { fetchSongMrSearch, type SongMrHit } from "@/lib/song-mr-api"
import { postSingResult } from "@/lib/sing-result-api"
import { UserFacingError, UI_ERRORS } from "@/lib/user-facing-error"

const apiBaseUrl =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000"

const ANALYZE_VOCAL_DROPZONE_COPY = {
  ...VOCAL_DROPZONE_COPY,
  idleResetStatus:
    "노래를 검색해 MR을 선택한 뒤 마이크 녹음 또는 영상·음원을 끌어다 놓으세요.",
} as const

type SongFindState = {
  submittedQuery: string
  selectedCatalogSongId: string | null
  hits: SongMrHit[]
}

const EMPTY_SONG_FIND: SongFindState = {
  submittedQuery: "",
  selectedCatalogSongId: null,
  hits: [],
}

export default function AnalyzePage() {
  const [songFind, setSongFind] = useState<SongFindState>(EMPTY_SONG_FIND)
  const [searchLoading, setSearchLoading] = useState(false)
  const [recordingState, setRecordingState] = useState<"idle" | "recording" | "done">(
    "idle"
  )
  const [inputSource, setInputSource] = useState<"none" | "mic" | "video">("none")
  const [analysisResult, setAnalysisResult] = useState<VocalAnalysisResult | null>(null)
  const [statusMessage, setStatusMessage] = useState(
    "노래 제목으로 검색해 MR을 선택한 뒤 마이크 녹음 또는 영상·음원을 올려 주세요."
  )
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const streamRef = useRef<MediaStream | null>(null)

  const selectedSong = useMemo((): SongMrHit | null => {
    if (!songFind.selectedCatalogSongId) return null
    return (
      songFind.hits.find((h) => h.catalog_song_id === songFind.selectedCatalogSongId) ??
      null
    )
  }, [songFind.selectedCatalogSongId, songFind.hits])

  const selectedSongRef = useRef<SongMrHit | null>(null)
  selectedSongRef.current = selectedSong

  const persistVocalSingToNeon = useCallback(
    async (analysis: VocalAnalysisResult, source: "mic" | "video") => {
      const song = selectedSongRef.current
      if (!song) return
      try {
        await postSingResult({
          catalogSongId: song.catalog_song_id,
          mrSearchListId: song.id,
          inputSource: source,
          pitchScore: analysis.pitchScore,
          rhythmScore: analysis.rhythmScore,
          vocalGrade: analysis.vocalGrade,
          summary: analysis.summary,
          fileName: analysis.fileName,
          durationSec: analysis.durationSec,
        })
      } catch (e) {
        setStatusMessage(
          e instanceof UserFacingError ? e.message : UI_ERRORS.requestFailed
        )
      }
    },
    []
  )

  const handleSongSearch = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const formData = new FormData(e.currentTarget)
    const q = String(formData.get("songQuery") ?? "").trim()
    setSongFind({ submittedQuery: q, selectedCatalogSongId: null, hits: [] })
    if (!q) {
      setStatusMessage("노래 제목을 입력하고 검색해 주세요.")
      return
    }
    setSearchLoading(true)
    try {
      const payload = await fetchSongMrSearch(q)
      setSongFind((prev) => ({
        ...prev,
        hits: payload.hits,
      }))
      setStatusMessage(
        payload.count === 0
          ? "일치하는 노래·MR이 없습니다. 다른 제목으로 검색해 주세요."
          : `검색 결과 ${payload.count}건이 Neon DB에 저장되었습니다. MR을 사용할 곡을 눌러 선택해 주세요.`
      )
    } catch (err) {
      setStatusMessage(
        err instanceof UserFacingError ? err.message : UI_ERRORS.requestFailed
      )
    } finally {
      setSearchLoading(false)
    }
  }

  const pickSong = (hit: SongMrHit) => {
    setSongFind((prev) => ({ ...prev, selectedCatalogSongId: hit.catalog_song_id }))
    setStatusMessage(`「${hit.title}」 MR: ${hit.mr_track_name}`)
  }

  const result = analysisResult ?? {
    pitchScore: 92,
    rhythmScore: 88,
    vocalGrade: "A-",
    summary: selectedSong
      ? "MR을 선택한 뒤 마이크 녹음 또는 영상·음원을 업로드하면 분석 결과가 표시됩니다."
      : "노래 제목으로 검색해 MR을 고른 다음 입력을 진행하면 분석 결과가 표시됩니다.",
    fileName: "",
    durationSec: 0,
  }

  const inputLabel =
    recordingState === "recording"
      ? "녹음 중"
      : inputSource === "video"
        ? "영상·음원 분석 완료"
        : inputSource === "mic" && recordingState === "done"
          ? "마이크 분석 완료"
          : "준비 완료"

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
      setInputSource("mic")
      setAnalysisResult(null)
      setStatusMessage("녹음 중입니다. 노래를 부른 뒤 정지 버튼을 눌러 주세요.")
    } catch {
      setStatusMessage(UI_ERRORS.micStartFailed)
    }
  }

  const stopRecording = async () => {
    mediaRecorderRef.current?.stop()
    streamRef.current?.getTracks().forEach((track) => track.stop())
    mediaRecorderRef.current = null
    streamRef.current = null
    setRecordingState("done")
    setInputSource("mic")
    const analysis: VocalAnalysisResult = {
      pitchScore: 90,
      rhythmScore: 86,
      vocalGrade: "A-",
      summary:
        "마이크 녹음이 저장되었습니다. 백엔드 연동 시 선택한 곡과 비교해 음정·박자를 계산합니다.",
      fileName: "마이크 녹음",
      durationSec: 0,
    }
    setAnalysisResult(analysis)
    setStatusMessage(
      "녹음이 종료되었습니다. 분석 결과가 갱신되었습니다. (백엔드 API 연동 시 정밀 분석)"
    )
    await persistVocalSingToNeon(analysis, "mic")
  }

  const handleVideoAnalysis = async (result: VocalAnalysisResult) => {
    setInputSource("video")
    setRecordingState("done")
    setAnalysisResult(result)
    await persistVocalSingToNeon(result, "video")
  }

  const clearVideoInput = () => {
    if (inputSource === "video") {
      setInputSource("none")
      setRecordingState("idle")
      setAnalysisResult(null)
    }
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
            노래 찾기(MR), 마이크·영상 입력, 분석 결과를
            <br />
            하나의 화면에서 연결합니다.
          </h1>
          <p className="mt-4 max-w-3xl text-sm leading-7 text-zinc-300 sm:text-base">
            이 페이지는 추후 백엔드 API와 직접 연결될 분석 워크플로우 화면입니다. 노래 제목으로
            MR(반주)를 찾아 고르고, 마이크로 부르거나 연습 영상·음원을 끌어다 놓아 AI가 음정과
            박자를 분석한 뒤 코칭 피드백을 받게 됩니다.
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
                  <h2 className="text-2xl font-semibold">노래 찾기</h2>
                </div>
              </div>

              <form
                className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-end"
                onSubmit={handleSongSearch}
              >
                <div className="min-w-0 flex-1">
                  <label
                    htmlFor="song-query"
                    className="sr-only mb-2 block text-sm font-medium text-zinc-700"
                  >
                    노래 제목
                  </label>
                  <input
                    id="song-query"
                    name="songQuery"
                    type="search"
                    placeholder="예: 봄날, 밤편지, Defying Gravity"
                    autoComplete="off"
                    className="w-full rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-sm text-zinc-950 outline-none ring-zinc-950/10 placeholder:text-zinc-400 focus:border-zinc-400 focus:ring-2"
                  />
                </div>
                <button
                  type="submit"
                  disabled={searchLoading}
                  className="inline-flex shrink-0 items-center justify-center gap-2 rounded-2xl bg-zinc-950 px-6 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Search className="h-4 w-4" aria-hidden="true" />
                  {searchLoading ? "검색 중…" : "MR 검색"}
                </button>
              </form>

              {!songFind.submittedQuery.trim() ? (
                <p className="mt-6 text-sm leading-6 text-zinc-500" role="status">
                  노래 제목을 입력한 뒤 검색하면 등록된 MR 정보가 있는 곡 목록이 표시되고, Neon
                  DB에 검색 결과가 저장됩니다.
                </p>
              ) : searchLoading ? (
                <p className="mt-6 text-sm leading-6 text-zinc-600" role="status">
                  검색 중입니다…
                </p>
              ) : songFind.hits.length === 0 ? (
                <p className="mt-6 text-sm leading-6 text-zinc-600" role="status">
                  검색어 &quot;{songFind.submittedQuery}&quot;에 맞는 곡을 찾지 못했습니다.
                </p>
              ) : (
                <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {songFind.hits.map((song) => (
                    <button
                      key={`${song.catalog_song_id}-${song.id}`}
                      type="button"
                      onClick={() => pickSong(song)}
                      className={`rounded-2xl border p-4 text-left transition-colors ${
                        songFind.selectedCatalogSongId === song.catalog_song_id
                          ? "border-zinc-950 bg-zinc-950 text-white"
                          : "border-zinc-200 bg-zinc-50 text-zinc-950 hover:bg-zinc-100"
                      }`}
                    >
                      <p className="text-base font-semibold">{song.title}</p>
                      <p
                        className={`mt-1 text-sm ${
                          songFind.selectedCatalogSongId === song.catalog_song_id
                            ? "text-zinc-300"
                            : "text-zinc-500"
                        }`}
                      >
                        {song.artist}
                      </p>
                      <div
                        className={`mt-4 space-y-1 text-xs ${
                          songFind.selectedCatalogSongId === song.catalog_song_id
                            ? "text-zinc-400"
                            : "text-zinc-500"
                        }`}
                      >
                        <p>BPM {song.bpm}</p>
                        <p>{song.song_key}</p>
                        <p>{song.range_label}</p>
                        <p
                          className={`pt-2 text-xs font-medium ${
                            songFind.selectedCatalogSongId === song.catalog_song_id
                              ? "text-zinc-200"
                              : "text-zinc-700"
                          }`}
                        >
                          MR · {song.mr_track_name}
                        </p>
                        <p
                          className={
                            songFind.selectedCatalogSongId === song.catalog_song_id
                              ? "text-zinc-400"
                              : "text-zinc-500"
                          }
                        >
                          {song.mr_description}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </article>

            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-zinc-100 p-3">
                  <Mic className="h-5 w-5 text-zinc-900" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-sm text-zinc-500">2단계</p>
                  <h2 className="text-2xl font-semibold">마이크 또는 영상·음원</h2>
                </div>
              </div>

              <p className="mt-4 text-sm leading-6 text-zinc-600">{statusMessage}</p>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <p className="text-sm font-medium text-zinc-800">마이크로 직접 부르기</p>
                <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                  <button
                    type="button"
                    onClick={startRecording}
                    disabled={
                      recordingState === "recording" ||
                      (inputSource === "video" && recordingState === "done")
                    }
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

              <div className="mt-6 rounded-2xl border border-zinc-200 p-5">
                <div className="flex items-center gap-2">
                  <FileVideo className="h-4 w-4 text-zinc-700" aria-hidden="true" />
                  <p className="text-sm font-medium text-zinc-800">
                    영상·음원 드래그 앤 드롭
                  </p>
                </div>
                <p className="mt-2 text-sm text-zinc-500">
                  커버 영상, 연습 녹화, MR 없는 클립 등에서 보컬 트랙을 분석합니다.
                </p>
                <VocalVideoDropzone
                  copy={ANALYZE_VOCAL_DROPZONE_COPY}
                  disabled={recordingState === "recording"}
                  onStatusMessage={setStatusMessage}
                  onAnalysisComplete={handleVideoAnalysis}
                  onClear={clearVideoInput}
                />
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
                  value={`${result.pitchScore}%`}
                  description="불안정 구간 자동 감지"
                />
                <ResultCard
                  title="박자 정확도"
                  value={`${result.rhythmScore}%`}
                  description="빠른/느린 구간 시각화"
                />
                <ResultCard
                  title="AI 피드백"
                  value={result.vocalGrade}
                  description={
                    analysisResult
                      ? result.summary
                      : "호흡과 발성 개선 제안"
                  }
                />
              </div>

              <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 p-5">
                <div className="flex items-center gap-2 text-sm font-medium text-zinc-700">
                  <Waves className="h-4 w-4" aria-hidden="true" />
                  선택된 곡 기준 분석 준비
                </div>
                <p className="mt-3 text-sm leading-6 text-zinc-600">
                  <span className="font-semibold text-zinc-950">
                    {selectedSong?.title ?? "MR 미선택"}
                  </span>
                  {analysisResult?.fileName ? ` · 입력: ${analysisResult.fileName}` : ""}
                  {selectedSong
                    ? `의 원곡 BPM·키를 기준으로 `
                    : " — MR을 선택하면 "}
                  {inputSource === "video" ? "영상·음원" : "마이크"} 보컬과 비교합니다.
                  {analysisResult ? ` ${result.summary}` : ""}
                </p>
              </div>
            </article>
          </div>

          <aside className="space-y-6">
            <article className="rounded-3xl border border-zinc-200 bg-white p-6 shadow-sm">
              <p className="text-sm font-medium text-zinc-500">현재 선택</p>
              {selectedSong ? (
                <>
                  <h2 className="mt-2 text-2xl font-semibold">{selectedSong.title}</h2>
                  <p className="mt-1 text-sm text-zinc-500">{selectedSong.artist}</p>

                  <div className="mt-6 rounded-2xl border border-zinc-200 bg-zinc-50 px-4 py-3">
                    <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                      MR
                    </p>
                    <p className="mt-2 text-sm font-semibold text-zinc-950">
                      {selectedSong.mr_track_name}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-zinc-600">
                      {selectedSong.mr_description}
                    </p>
                  </div>

                  <dl className="mt-6 space-y-4 text-sm">
                    <div className="flex items-center justify-between">
                      <dt className="text-zinc-500">DB 기록 id</dt>
                      <dd className="font-mono text-sm font-medium text-zinc-950">
                        {selectedSong.id}
                      </dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-zinc-500">BPM</dt>
                      <dd className="font-medium text-zinc-950">{selectedSong.bpm}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-zinc-500">Key</dt>
                      <dd className="font-medium text-zinc-950">{selectedSong.song_key}</dd>
                    </div>
                    <div className="flex items-center justify-between">
                      <dt className="text-zinc-500">상태</dt>
                      <dd className="font-medium text-zinc-950">{inputLabel}</dd>
                    </div>
                  </dl>
                </>
              ) : (
                <p className="mt-3 text-sm leading-6 text-zinc-600" role="status">
                  검색 결과에서 MR을 사용할 노래 카드를 눌러 선택해 주세요.
                </p>
              )}
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
                <ApiRow label="MR 검색·DB 저장" value={`${apiBaseUrl}/api/songs/search?q=`} />
                <ApiRow
                  label="보컬 분석 결과 저장"
                  value={`${apiBaseUrl}/api/music/sing-result`}
                />
                <ApiRow label="곡 목록 조회" value={`${apiBaseUrl}/songs`} />
                <ApiRow label="음원 분석 요청" value={`${apiBaseUrl}/analysis/songs/:songId`} />
                <ApiRow label="녹음 업로드" value={`${apiBaseUrl}/analysis/recordings`} />
                <ApiRow
                  label="영상·음원 업로드"
                  value={`${apiBaseUrl}/analysis/media-upload`}
                />
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
