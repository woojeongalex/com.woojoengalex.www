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
  const res = await fetch("/api/the-wire/email", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  })
  if (!res.ok) throw new Error("이메일 전송에 실패했습니다.")
  return res.json()
}
