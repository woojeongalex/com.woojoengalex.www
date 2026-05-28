"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChangeEvent, DragEvent, useRef, useState } from "react"

export default function TitanicHomePage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleCsvUpload = async (file: File) => {
    const isCsv =
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel"

    if (!isCsv) {
      setError("CSV 파일만 업로드할 수 있습니다.")
      return
    }

    const formData = new FormData()
    formData.append("file", file)

    try {
      const rawText = await file.text()
      const response = await fetch("/api/titanic/james/upload", {
        method: "POST",
        body: formData,
      })
      const data = await response.json()
      if (!response.ok) {
        setError(typeof data?.detail === "string" ? data.detail : "업로드에 실패했습니다.")
        return
      }

      setError(null)
      setUploadedFileName(file.name)
      sessionStorage.setItem("titanic_uploaded_file_name", file.name)
      sessionStorage.setItem("titanic_uploaded_csv_text", rawText)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "업로드 요청 중 오류가 발생했습니다."
      setError(message)
      setUploadedFileName(null)
    }
  }

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    await handleCsvUpload(file)
    event.target.value = ""
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)

    const file = event.dataTransfer.files?.[0]
    if (!file) return

    await handleCsvUpload(file)
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
          <div className="mt-6 flex flex-col items-center gap-3">
            <p className="text-sm text-zinc-600">
              {uploadedFileName
                ? `업로드 완료: ${uploadedFileName}`
                : "CSV 업로드 후 상세페이지로 이동할 수 있습니다."}
            </p>
            <button
              type="button"
              onClick={() => router.push("/titanic/detail")}
              disabled={!uploadedFileName}
              className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-300"
            >
              상세페이지 이동하기
            </button>
          </div>
        </section>
        </div>
      </div>
    </main>
  )
}
