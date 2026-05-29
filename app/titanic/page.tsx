"use client"

import Image from "next/image"
import { useRouter } from "next/navigation"
import { ChangeEvent, DragEvent, useRef, useState } from "react"

import { useAsyncAction } from "@/hooks/use-async-action"
import { setUploadedFileName, uploadTitanicCsv } from "@/lib/titanic-api"

export default function TitanicHomePage() {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [uploadedFileName, setUploadedFileNameState] = useState<string | null>(null)
  const { loading, error, run } = useAsyncAction()

  const handleCsvUpload = async (file: File) => {
    const isCsv =
      file.name.toLowerCase().endsWith(".csv") ||
      file.type === "text/csv" ||
      file.type === "application/vnd.ms-excel"

    if (!isCsv) {
      throw new Error("CSV 파일만 업로드할 수 있습니다.")
    }

    const result = await uploadTitanicCsv(file)
    setUploadedFileName(result.file_name)
    setUploadedFileNameState(result.file_name)
  }

  const handleInputChange = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    await run(() => handleCsvUpload(file), { fallbackError: "업로드에 실패했습니다." })
    event.target.value = ""
  }

  const handleDrop = async (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDragging(false)
    const file = event.dataTransfer.files?.[0]
    if (!file) return
    await run(() => handleCsvUpload(file), { fallbackError: "업로드에 실패했습니다." })
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10 text-zinc-900">
      <div className="mx-auto w-full max-w-4xl space-y-8">
        <section className="text-center">
          <h1 className="text-4xl font-bold sm:text-5xl">타이타닉 홈</h1>
          <p className="mt-3 text-sm text-zinc-600 sm:text-base">
            Titanic CSV를 업로드한 뒤 DB에 저장된 데이터를 상세 페이지에서 확인합니다.
          </p>
        </section>

        <section className="grid gap-6 md:grid-cols-2">
          <article className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">파일 선택</h2>
            <p className="mt-2 text-sm text-zinc-600">로컬 CSV 파일을 선택해 업로드합니다.</p>
            <input
              ref={inputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleInputChange}
            />
            <button
              type="button"
              disabled={loading}
              onClick={() => inputRef.current?.click()}
              className="mt-5 rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:bg-zinc-400"
            >
              {loading ? "업로드 중…" : "Titanic CSV 선택하기"}
            </button>
          </article>

          <article className="rounded-2xl border border-zinc-200 p-6 shadow-sm">
            <h2 className="text-xl font-semibold">드래그 앤 드롭</h2>
            <p className="mt-2 text-sm text-zinc-600">CSV 파일을 아래 영역에 놓아 업로드합니다.</p>
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
                : "CSV 업로드 후 상세 페이지로 이동할 수 있습니다."}
            </p>
            <button
              type="button"
              onClick={() => router.push("/titanic/detail")}
              disabled={!uploadedFileName || loading}
              className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:cursor-not-allowed disabled:border-zinc-300 disabled:bg-zinc-300"
            >
              상세페이지 이동하기
            </button>
          </div>
        </section>
      </div>
    </main>
  )
}
