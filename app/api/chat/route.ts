import { NextResponse } from "next/server"
import { proxyPost } from "@/app/api/_lib/proxy"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 })
  }

  return proxyPost("/chat", body, "AI 코칭 응답을 받지 못했습니다.", 60_000)
}
