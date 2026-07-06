'use client'

import type { ChangeEvent, DragEvent } from 'react'
import { useRef, useState } from 'react'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

import { useAsyncAction } from '@/hooks/use-async-action'
import type { VisionAnalyzeResult } from '@/lib/vision-api'
import { analyzeVisionImage, recognizeFace } from '@/lib/vision-api'

function isImageFile(file: File): boolean {
  return file.type.startsWith('image/')
}

export default function VisionHomePage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const faceInputRef = useRef<HTMLInputElement>(null)

  const [isDragging, setIsDragging] = useState(false)
  const [isFaceDragging, setIsFaceDragging] = useState(false)
  const [showObjectDetection, setShowObjectDetection] = useState(false)

  const [result, setResult] = useState<VisionAnalyzeResult | null>(null)
  const [facePreview, setFacePreview] = useState<string | null>(null)
  const [faceResult, setFaceResult] = useState<VisionAnalyzeResult | null>(null)

  const { loading, error, run } = useAsyncAction()
  const {
    loading: faceLoading,
    error: faceError,
    run: runFace,
  } = useAsyncAction()

  const handleAnalyze = async (file: File) => {
    if (!isImageFile(file))
      throw new Error('이미지 파일만 업로드할 수 있습니다.')
    const analyzed = await analyzeVisionImage(file)
    setResult(analyzed)
  }

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await run(() => handleAnalyze(file), {
      fallbackError: '이미지 분석에 실패했습니다.',
    })
    event.target.value = ''
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    await run(() => handleAnalyze(file), {
      fallbackError: '이미지 분석에 실패했습니다.',
    })
  }

  const handleFaceAnalyze = async (file: File) => {
    if (!isImageFile(file))
      throw new Error('얼굴 이미지 파일만 업로드할 수 있습니다.')
    setFacePreview(URL.createObjectURL(file))
    const analyzed = await recognizeFace(file)
    setFaceResult(analyzed)
  }

  const handleFaceInputChange = async (
    event: ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0]
    if (!file) return
    await runFace(() => handleFaceAnalyze(file), {
      fallbackError: '얼굴 인식에 실패했습니다.',
    })
    event.target.value = ''
  }

  const handleFaceDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsFaceDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    await runFace(() => handleFaceAnalyze(file), {
      fallbackError: '얼굴 인식에 실패했습니다.',
    })
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-background px-4 py-10 text-foreground">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <Link
          href="/"
          className="inline-flex w-fit items-center gap-2 rounded-lg border border-border bg-card px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-accent"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" aria-hidden="true" />
          뒤로가기
        </Link>

        {/* HERO */}
        <section className="text-center">
          <p className="text-xs font-mono tracking-widest uppercase text-foreground">
            {'// Vision AI'}
          </p>
          <h1 className="mt-3 text-4xl font-semibold text-foreground sm:text-5xl">
            비전 모델
          </h1>
          <p className="mt-3 text-sm text-muted-foreground sm:text-base">
            이미지를 업로드하면 비전 모델이 무엇이 담겨 있는지 인식합니다.
          </p>
        </section>

        {/* 업로드 섹션 */}
        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">파일 선택</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              로컬 이미지 파일을 선택해 업로드합니다.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => {
                void handleInputChange(e)
              }}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="mt-5 rounded-xl bg-primary px-5 py-3 text-sm font-medium text-primary-foreground transition-opacity hover:opacity-80 disabled:opacity-40"
            >
              {loading ? '분석 중…' : '이미지 선택하기'}
            </button>
          </article>

          <article className="rounded-2xl border border-border bg-card p-6">
            <h2 className="text-xl font-semibold text-foreground">
              드래그 앤 드롭
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              이미지 파일을 아래 영역에 놓아 업로드합니다.
            </p>
            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={(e) => {
                void handleDrop(e)
              }}
              className={`mt-5 flex min-h-40 items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition-colors ${
                isDragging
                  ? 'border-primary bg-primary/10 text-primary'
                  : 'border-border bg-background text-muted-foreground'
              }`}
            >
              여기에 이미지 파일을 드래그해서 놓으세요.
            </div>
          </article>
        </section>

        {error && (
          <section className="rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive">
            {error}
          </section>
        )}

        {result && (
          <section className="rounded-2xl border border-border bg-card p-6 text-center">
            <p className="text-sm font-mono text-foreground">
              인식 결과: {result.label}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {result.file_name}
            </p>
            <div className="mx-auto mt-4 max-w-xs">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>매치율</span>
                <span className="font-mono text-foreground">
                  {(result.confidence * 100).toFixed(1)}%
                </span>
              </div>
              <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${Math.min(result.confidence * 100, 100)}%` }}
                />
              </div>
            </div>
          </section>
        )}

        {/* 객체 탐지 링크 */}
        <section className="text-center">
          <button
            type="button"
            onClick={() => setShowObjectDetection((prev) => !prev)}
            className="rounded-xl border border-primary bg-transparent px-5 py-3 text-sm font-medium text-primary transition-opacity hover:opacity-80"
          >
            {showObjectDetection ? '객체 탐지 닫기' : '객체 탐지 →'}
          </button>
        </section>

        {showObjectDetection && (
          <section className="grid gap-6 md:grid-cols-2">
            <article className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">
                객체 탐지
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                YOLO 기반 비전 모델이 이미지 속 객체의 위치와 종류를 탐지합니다.
              </p>
              <p className="mt-4 text-sm text-muted-foreground">
                우측에 사람 얼굴 사진을 업로드하면 인식된 이름을 보여줍니다.
              </p>
            </article>

            <article className="rounded-2xl border border-border bg-card p-6">
              <h2 className="text-xl font-semibold text-foreground">
                얼굴 인식
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                얼굴 사진을 업로드하면 이름을 맞춰봅니다.
              </p>

              <input
                ref={faceInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  void handleFaceInputChange(e)
                }}
              />
              <div
                onDragOver={(e) => {
                  e.preventDefault()
                  setIsFaceDragging(true)
                }}
                onDragLeave={() => setIsFaceDragging(false)}
                onDrop={(e) => {
                  void handleFaceDrop(e)
                }}
                onClick={() => faceInputRef.current?.click()}
                className={`mt-4 flex min-h-40 cursor-pointer items-center justify-center overflow-hidden rounded-xl border-2 border-dashed px-4 text-center text-sm transition-colors ${
                  isFaceDragging
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border bg-background text-muted-foreground'
                }`}
              >
                {facePreview ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={facePreview}
                    alt="업로드한 얼굴 사진 미리보기"
                    className="max-h-40 w-auto object-contain"
                  />
                ) : (
                  '여기에 얼굴 사진을 놓거나 클릭해서 선택하세요.'
                )}
              </div>

              {faceError && (
                <p className="mt-3 text-sm text-destructive">{faceError}</p>
              )}

              {faceResult && (
                <div className="mt-3">
                  <p className="text-sm font-mono text-foreground">
                    추정 이름: {faceResult.label}
                  </p>
                  <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground">
                    <span>매치율</span>
                    <span className="font-mono text-foreground">
                      {(faceResult.confidence * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-1 h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary transition-all"
                      style={{
                        width: `${Math.min(faceResult.confidence * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>
              )}

              {faceLoading && (
                <p className="mt-3 text-sm text-muted-foreground">인식 중…</p>
              )}
            </article>
          </section>
        )}
      </div>
    </main>
  )
}
