"use client"

import Image from "next/image"
import { ChangeEvent, DragEvent, useRef, useState } from "react"

type UploadMethod = "file-picker" | "drag-and-drop"

interface UploadedCsv {
  fileName: string
  fileSize: number
  method: UploadMethod
  previewLines: string[]
}

export default function TitanicHomePage() {
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedCsv, setUploadedCsv] = useState<UploadedCsv | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const formatBytes = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const handleCsvUpload = async (file: File, method: UploadMethod) => {
    const isCsv =
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel"

    if (!isCsv) {
      setError("CSV 파일만 업로드할 수 있습니다.")
      setUploadedCsv(null)
      return
    }

    const text = await file.text()
    const previewLines = text
      .split(/\r?\n/)
      .filter((line) => line.trim().length > 0)
      .slice(0, 5)

    setError(null)
    setUploadedCsv({
      fileName: file.name,
      fileSize: file.size,
      method,
      previewLines,
    })
  }

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await handleCsvUpload(file, "file-picker")
    event.target.value = ""
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (!file) return

    await handleCsvUpload(file, "drag-and-drop")
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10 text-zinc-900">
      <div className="mx-auto grid w-full max-w-6xl gap-8 md:grid-cols-[16rem_1fr]">
        <aside className="sticky top-24 hidden h-fit rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm md:block">
          <p className="text-xs font-bold tracking-[0.14em] text-zinc-500">LESSON</p>
          <p className="mt-2 text-lg font-bold text-zinc-950">타이타닉</p>
          <div className="mt-4 border-t border-zinc-200 pt-4">
            <p className="text-sm font-semibold text-zinc-900">1. 데이터 수집</p>
          </div>
        </aside>

        <div className="flex min-w-0 flex-col gap-8">
          <div className="flex items-center justify-between md:hidden">
            <div>
              <p className="text-xs font-bold tracking-[0.14em] text-zinc-500">LESSON</p>
              <p className="mt-1 text-lg font-bold text-zinc-950">타이타닉</p>
            </div>
            <button
              type="button"
              onClick={() => setSidebarOpen(true)}
              className="inline-flex items-center justify-center rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
              aria-label="사이드바 열기"
            >
              <span aria-hidden className="text-lg leading-none">
                ≡
              </span>
            </button>
          </div>

          {sidebarOpen && (
            <div className="fixed inset-0 z-50 md:hidden" role="dialog" aria-modal="true">
              <button
                type="button"
                className="absolute inset-0 bg-black/35"
                onClick={() => setSidebarOpen(false)}
                aria-label="사이드바 닫기"
              />
              <aside className="relative h-full w-[18rem] max-w-[85vw] bg-white p-5 shadow-xl">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs font-bold tracking-[0.14em] text-zinc-500">
                      LESSON
                    </p>
                    <p className="mt-1 text-lg font-bold text-zinc-950">타이타닉</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSidebarOpen(false)}
                    className="rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
                  >
                    닫기
                  </button>
                </div>
                <div className="mt-4 border-t border-zinc-200 pt-4">
                  <p className="text-sm font-semibold text-zinc-900">1. 데이터 수집</p>
                </div>
              </aside>
            </div>
          )}

          <nav
            aria-label="타이타닉 서브 메뉴"
            className="sticky top-24 z-10 -mx-1 flex flex-wrap items-center justify-center gap-x-8 gap-y-2 border-b border-zinc-200 bg-white/95 px-1 py-3 text-xs font-semibold tracking-[0.18em] text-zinc-500 backdrop-blur sm:justify-start sm:text-sm"
          >
            {[
              "ALL",
              "SYSTEM",
              "ARCHITECTURE",
              "AGENT",
              "BACKEND",
              "MOBILE",
              "DEVOPS",
              "NLP",
            ].map((label) => (
              <button
                key={label}
                type="button"
                className="rounded-md px-1 py-1 transition-colors hover:text-zinc-900"
              >
                {label}
              </button>
            ))}
          </nav>

        <section className="text-center">
          <h1 className="text-4xl font-bold sm:text-6xl">타이타닉 홈</h1>
          <p className="mt-3 text-sm text-zinc-600 sm:text-base">
            타이타닉 CSV 파일을 두 가지 방법으로 업로드할 수 있습니다.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">방법 1. 파일 선택</h2>
            <p className="mt-2 text-sm text-zinc-600">
              버튼을 눌러 로컬의 타이타닉 CSV 파일을 선택하세요.
            </p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleInputChange}
            />
            <button
              type="button"
              onClick={() => inputRef.current?.click()}
              className="mt-5 rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              Titanic CSV 선택하기
            </button>
          </article>

          <article className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">방법 2. 드래그 앤 드롭</h2>
            <p className="mt-2 text-sm text-zinc-600">
              CSV 파일을 아래 영역으로 끌어다 놓아 업로드하세요.
            </p>
            <div
              onDragOver={(event) => {
                event.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`mt-5 flex min-h-40 items-center justify-center rounded-xl border-2 border-dashed px-4 text-center text-sm transition-colors ${
                isDragging
                  ? "border-zinc-900 bg-zinc-100 text-zinc-900"
                  : "border-zinc-300 bg-zinc-50 text-zinc-500"
              }`}
            >
              여기에 Titanic CSV 파일을 드래그해서 놓으세요.
            </div>
          </article>
        </section>

        {error && (
          <section className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </section>
        )}

        {uploadedCsv && (
          <section className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">업로드 결과</h2>
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="font-medium text-zinc-500">파일명</dt>
                <dd className="mt-1 break-all text-zinc-900">{uploadedCsv.fileName}</dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-500">크기</dt>
                <dd className="mt-1 text-zinc-900">{formatBytes(uploadedCsv.fileSize)}</dd>
              </div>
              <div>
                <dt className="font-medium text-zinc-500">업로드 방식</dt>
                <dd className="mt-1 text-zinc-900">
                  {uploadedCsv.method === "file-picker"
                    ? "파일 선택"
                    : "드래그 앤 드롭"}
                </dd>
              </div>
            </dl>

            <div className="mt-6">
              <h3 className="text-sm font-medium text-zinc-500">CSV 미리보기 (앞 5줄)</h3>
              <div className="mt-2 rounded-xl bg-zinc-950 p-4 text-sm text-zinc-100">
                {uploadedCsv.previewLines.length > 0 ? (
                  <pre className="overflow-x-auto whitespace-pre-wrap">
                    {uploadedCsv.previewLines.join("\n")}
                  </pre>
                ) : (
                  <p>미리볼 데이터가 없습니다.</p>
                )}
              </div>
            </div>
          </section>
        )}

        <section className="rounded-2xl border border-zinc-200 bg-zinc-50 p-6 shadow-sm">
          <div className="flex justify-center">
            <Image
              src="/titanic-illustration.svg"
              alt="바다 위를 항해하는 타이타닉 일러스트"
              width={720}
              height={270}
              className="h-auto w-full max-w-3xl"
              priority
            />
          </div>
        </section>
        </div>
      </div>
    </main>
  )
}
