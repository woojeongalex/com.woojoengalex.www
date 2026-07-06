'use client'

import type { ChangeEvent } from 'react'
import { useEffect, useRef, useState } from 'react'
import { BookUser, Inbox, Mail, Upload, X } from 'lucide-react'
import type { Contact, InboxMail, UploadResult } from '@/lib/the-wire-api'
import {
  fetchContactList,
  fetchInboxMails,
  uploadContactsCsv,
} from '@/lib/the-wire-api'

type Tab = 'mail' | 'contacts' | 'inbox'

export default function TheWirePage() {
  const [tab, setTab] = useState<Tab>('contacts')
  const [inboxMails, setInboxMails] = useState<InboxMail[]>([])
  const [loadingInbox, setLoadingInbox] = useState(false)
  const [selectedMail, setSelectedMail] = useState<InboxMail | null>(null)

  async function fetchInbox() {
    setLoadingInbox(true)
    try {
      setInboxMails(await fetchInboxMails())
    } finally {
      setLoadingInbox(false)
    }
  }

  useEffect(() => {
    if (tab === 'inbox') queueMicrotask(() => void fetchInbox())
  }, [tab])
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
      setContacts(await fetchContactList())
    } finally {
      setLoadingList(false)
    }
  }

  useEffect(() => {
    if (tab === 'contacts') queueMicrotask(() => void fetchContacts())
  }, [tab])

  async function handleUpload(file: File) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('CSV 파일만 업로드할 수 있습니다.')
      return
    }
    setUploading(true)
    setUploadResult(null)
    try {
      const data = await uploadContactsCsv(file)
      setUploadResult(data)
      await fetchContacts()
    } finally {
      setUploading(false)
    }
  }

  function handleFileChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (file) void handleUpload(file)
    e.target.value = ''
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleUpload(file)
  }

  return (
    <main className="min-h-[calc(100vh-4rem)] flex bg-background text-foreground">
      {/* 사이드바 */}
      <aside className="w-52 shrink-0 border-r border-border flex flex-col py-6 px-3 gap-1 bg-card">
        <p className="text-xs font-mono tracking-widest px-2 mb-3 text-muted-foreground">
          THE WIRE
        </p>
        <button
          onClick={() => setTab('mail')}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors ${
            tab === 'mail'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Mail className="h-4 w-4" />
          메일관리
        </button>
        <button
          onClick={() => setTab('contacts')}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors ${
            tab === 'contacts'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <BookUser className="h-4 w-4" />
          주소록
        </button>
        <button
          onClick={() => setTab('inbox')}
          className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-left transition-colors ${
            tab === 'inbox'
              ? 'bg-muted text-foreground'
              : 'text-muted-foreground hover:bg-muted/50'
          }`}
        >
          <Inbox className="h-4 w-4" />
          받은 메일함
        </button>
      </aside>

      {/* 메인 콘텐츠 */}
      <div className="flex-1 p-6">
        {tab === 'mail' && (
          <div className="flex items-center justify-center h-full">
            <p className="text-sm font-mono text-muted-foreground">
              메일관리 기능 준비 중
            </p>
          </div>
        )}

        {tab === 'inbox' && (
          <div className="max-w-3xl mx-auto">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold">받은 메일함</h1>
              <button
                onClick={() => {
                  void fetchInbox()
                }}
                className="rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-80 transition-opacity"
              >
                새로고침
              </button>
            </div>

            {loadingInbox ? (
              <p className="text-sm font-mono text-muted-foreground">
                불러오는 중...
              </p>
            ) : inboxMails.length === 0 ? (
              <div className="rounded-2xl border border-border p-10 text-center text-sm font-mono text-muted-foreground">
                받은 메일이 없습니다.
              </div>
            ) : (
              <div className="rounded-2xl border border-border overflow-hidden">
                {inboxMails.map((mail, i) => (
                  <div
                    key={mail.id}
                    onClick={() =>
                      setSelectedMail(
                        selectedMail?.id === mail.id ? null : mail
                      )
                    }
                    className={`cursor-pointer border-b border-border px-4 py-3 ${
                      i % 2 === 0 ? 'bg-background' : 'bg-card'
                    } ${!mail.is_read ? 'font-semibold' : ''}`}
                  >
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-mono text-foreground">
                        {mail.sender}
                      </span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {new Date(mail.received_at).toLocaleString('ko-KR')}
                      </span>
                    </div>
                    <div className="text-sm mt-0.5 text-muted-foreground">
                      {mail.subject}
                    </div>
                    {selectedMail?.id === mail.id && (
                      <div className="mt-3 text-sm font-mono text-foreground whitespace-pre-wrap border-t border-border pt-3">
                        {mail.body}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'contacts' && (
          <div className="max-w-3xl mx-auto">
            {/* 헤더 */}
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-xl font-semibold">주소록</h1>
              <button
                onClick={() => {
                  setShowUpload(true)
                  setUploadResult(null)
                }}
                className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium bg-primary text-primary-foreground hover:opacity-80 transition-opacity"
              >
                <Upload className="h-4 w-4" />
                등록
              </button>
            </div>

            {/* 목록 */}
            {loadingList ? (
              <p className="text-sm font-mono text-muted-foreground">
                불러오는 중...
              </p>
            ) : contacts.length === 0 ? (
              <div className="rounded-2xl border border-border p-10 text-center text-sm font-mono text-muted-foreground">
                등록된 연락처가 없습니다. CSV를 업로드해보세요.
              </div>
            ) : (
              <div className="rounded-2xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="bg-card border-b border-border">
                      <th className="text-left px-4 py-3 font-medium">이름</th>
                      <th className="text-left px-4 py-3 font-medium">
                        이메일
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((c, i) => (
                      <tr
                        key={c.email}
                        className={`border-b border-border ${
                          i % 2 === 0 ? 'bg-background' : 'bg-card'
                        }`}
                      >
                        <td className="px-4 py-3 font-mono text-foreground">
                          {c.name}
                        </td>
                        <td className="px-4 py-3 font-mono text-muted-foreground">
                          {c.email}
                        </td>
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
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowUpload(false)
          }}
        >
          <div className="relative w-full max-w-md rounded-2xl border border-border p-6 bg-card shadow-xl">
            <button
              onClick={() => setShowUpload(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            <h2 className="text-lg font-semibold mb-1">주소록 CSV 업로드</h2>
            <p className="text-xs font-mono mb-5 text-muted-foreground">
              CSV 헤더: <span className="text-foreground">name, email</span>{' '}
              또는 <span className="text-foreground">이름, 이메일</span>
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
              className="w-full rounded-xl px-4 py-3 text-sm font-medium mb-4 bg-primary text-primary-foreground hover:opacity-80 disabled:opacity-40 transition-opacity"
            >
              {uploading ? '업로드 중…' : '파일 선택하기'}
            </button>

            <div
              onDragOver={(e) => {
                e.preventDefault()
                setIsDragging(true)
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={`flex min-h-32 items-center justify-center rounded-xl border-2 border-dashed text-sm text-center transition-colors ${
                isDragging
                  ? 'border-primary bg-muted text-foreground'
                  : 'border-border bg-background text-muted-foreground'
              }`}
            >
              CSV 파일을 여기에 드래그해서 놓으세요
            </div>

            {uploadResult && (
              <div className="mt-4 rounded-xl border border-border px-4 py-3 text-sm font-mono bg-background text-muted-foreground">
                ✓ 저장{' '}
                <span className="font-semibold text-foreground">
                  {uploadResult.saved}
                </span>
                건 &nbsp;/&nbsp; 스킵 {uploadResult.skipped}건
              </div>
            )}
          </div>
        </div>
      )}
    </main>
  )
}
