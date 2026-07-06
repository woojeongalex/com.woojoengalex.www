export interface GeminiChatResponse {
  ok: boolean
  reply?: string
  error?: string
}

export async function sendGeminiChatMessage(
  message: string
): Promise<GeminiChatResponse> {
  const res = await fetch('/api/gemini/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message }),
  })
  const data = (await res.json()) as { reply?: string; error?: string }
  return { ok: res.ok, ...data }
}
