"use client"

import { ChangeEvent, useEffect, useRef, useState } from "react"
import { BookUser, Mail, Upload, X } from "lucide-react"

interface Contact {
  name: string
  email: string
}

interface UploadResult {
  saved: number
  skipped: number
}

type Tab = "mail" | "contacts"

export default function TheWirePage() {
  const [tab, setTab] = useState<Tab>("contacts")
  const [contacts, setContacts] = useState<Contact[]>([])
  const [loadingList, setLoadingList] = useState(false)
  const [showUpload, setShowUpload] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [uploadResult, setUploadResult] = useState<UploadResult | null>(null)
  const [isDragging, setIsDragging] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  async function fetchContacts() {
    setLoadingList(true)
    try {
      const res = await fetch("/api/the-wire/contacts")
      const data = await res.json()
      setContacts(data.contacts ?? [])
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (tab === "contacts") fetchContacts()
  }, [tab])

  async function handleUpload(file: File) {
    if (!file.name.toLowerCase().endsWith(".csv")) {
      alert("CSV 파일만 업로드할 수 있습니다.")
      return
    }
    setUploading(true)
    setUploadResult(null)
    const formData = new FormData()
    formData.append("file", file)
    try {
      const res = await fetch("/api/the-wire/contacts/upload", {
        method: "POST",
        body: formData,
      })
      const data: UploadResult = await res.json()
      setUploadResult(data)
      await fetchContacts()
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) handleUpload(file)
    e.target.value = ""
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) handleUpload(file)
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex" style={{ background: "#0A0A0A", color: "#e5e7eb" }}>
      {/* 사이드바 */}
      <aside
        className="w-52 shrink-0 border-r flex flex-col py-6 px-3 gap-1"
        style={{ borderColor: "#1f1f1f", background: "#0d0d0d" }}
      >
        <p className="text-xs font-mono tracking-widest px-2 mb-3" style={{ color: "#444" }}>
          THE WIRE
        </p>
        <button
          onClick={() => setTab("mail")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors"
          style={{
            background: tab === "mail" ? "#1a1a1a" : "transparent",
            color: tab === "mail" ? "#ffffff" : "#6b7280",
          }}
        >
          <Mail className="h-4 w-4" />
          메일관리
        </button>
        <button
          onClick={() => setTab("contacts")}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors"
          style={{
            background: tab === "contacts" ? "#1a1a1a" : "transparent",
            color: tab === "contacts" ? "#ffffff" : "#6b7280",
          }}
        >
          <BookUser className="h-4 w-4" />
          주소록
        </button>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-6">
        {tab === "mail" && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm font-mono" style={{ color: "#444" }}>메일관리 기능 준비 중</p>
          </div>
        )}

        {tab === "contacts" && (
          <div className="max-w-3xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold text-white">주소록</h1>
              <button
                onClick={() => { setShowUpload(true); setUploadResult(null) }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-opacity hover:opacity-80"
                style={{ background: "#ffffff", color: "#000000" }}
              >
                <Upload className="h-4 w-4" />
                등록
              </button>
            </div>

            {/* 목록 */}
            {loadingList ? (
              <div className="text-sm font-mono" style={{ color: "#444" }}>불러오는 중...</div>
            ) : contacts.length === 0 ? (
              <div
                className="rounded-2xl border p-10 text-center text-sm font-mono"
                style={{ borderColor: "#1f1f1f", color: "#444" }}
              >
                등록된 연락처가 없습니다. CSV를 업로드해보세요.
              </div>
            ) : (
              <div className="rounded-2xl border overflow-hidden" style={{ borderColor: "#1f1f1f" }}>
                <table className="w-full text-sm">
                  <thead>
                    <tr style={{ background: "#111111", borderBottom: "1px solid #1f1f1f" }}>
                      <th className="text-left px-4 py-3 font-medium text-white">이름</th>
                      <th className="text-left px-4 py-3 font-medium text-white">이메일</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c, i) => (
                      <tr
                        key={c.email}
                        style={{
                          background: i % 2 === 0 ? "#0d0d0d" : "#111111",
                          borderBottom: "1px solid #1a1a1a",
                        }}
                      >
                        <td className="px-4 py-3 font-mono" style={{ color: "#d1d5db" }}>{c.name}</td>
                        <td className="px-4 py-3 font-mono" style={{ color: "#6b7280" }}>{c.email}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 업로드 팝업 */}
      {showUpload && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.7)" }}
          onClick={(e) => { if (e.target === e.currentTarget) setShowUpload(false) }}
        >
          <div
            className="relative w-full max-w-md rounded-2xl border p-6"
            style={{ background: "#111111", borderColor: "#2a2a2a" }}
          >
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-4 right-4 transition-colors"
              style={{ color: "#6b7280" }}
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold text-white mb-1">주소록 CSV 업로드</h2>
            <p className="text-xs font-mono mb-5" style={{ color: "#6b7280" }}>
              CSV 헤더: <span style={{ color: "#d1d5db" }}>name, email</span> 또는 <span style={{ color: "#d1d5db" }}>이름, 이메일</span>
            </p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,text/csv"
              className="hidden"
              onChange={handleFileChange}
            />
            <button
              type="button"
              disabled={uploading}
              onClick={() => fileInputRef.current?.click()}
              className="w-full rounded-xl px-4 py-3 text-sm font-medium mb-4 transition-opacity hover:opacity-80 disabled:opacity-40"
              style={{ background: "#ffffff", color: "#000000" }}
            >
              {uploading ? "업로드 중…" : "파일 선택하기"}
            </button>

            <div
              onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className="flex min-h-32 items-center justify-center rounded-xl border-2 border-dashed text-sm text-center transition-colors"
              style={{
                borderColor: isDragging ? "#ffffff" : "#2a2a2a",
                background: isDragging ? "#1a1a1a" : "#0d0d0d",
                color: isDragging ? "#ffffff" : "#6b7280",
              }}
            >
              CSV 파일을 여기에 드래그해서 놓으세요
            </div>

            {uploadResult && (
              <div
                className="mt-4 rounded-xl border px-4 py-3 text-sm font-mono"
                style={{ borderColor: "#2a2a2a", background: "#0d0d0d", color: "#d1d5db" }}
              >
                ✓ 저장 <span className="text-white font-semibold">{uploadResult.saved}</span>건 &nbsp;/&nbsp; 스킵 {uploadResult.skipped}건
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
