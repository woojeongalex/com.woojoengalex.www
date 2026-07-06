export interface EmailPayload {
  to: string
  subject: string
  topic: string
}

export interface EmailResult {
  success: boolean
  detail: string
}

export async function sendEmail(payload: EmailPayload): Promise<EmailResult> {
  const res = await fetch('/api/the-wire/email', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error('이메일 전송에 실패했습니다.')
  return (await res.json()) as EmailResult
}

export interface Contact {
  name: string
  email: string
}

export interface UploadResult {
  saved: number
  skipped: number
}

export interface InboxMail {
  id: number
  sender: string
  subject: string
  body: string
  received_at: string
  is_read: boolean
}

export async function fetchInboxMails(): Promise<InboxMail[]> {
  const res = await fetch('http://localhost:8000/api/the-wire/inbox')
  const data = (await res.json()) as { mails?: InboxMail[] }
  return data.mails ?? []
}

export async function fetchContactList(): Promise<Contact[]> {
  const res = await fetch('/api/the-wire/contacts')
  const data = (await res.json()) as { contacts?: Contact[] }
  return data.contacts ?? []
}

export async function uploadContactsCsv(file: File): Promise<UploadResult> {
  const formData = new FormData()
  formData.append('file', file)
  const res = await fetch('/api/the-wire/contacts/upload', {
    method: 'POST',
    body: formData,
  })
  return (await res.json()) as UploadResult
}
