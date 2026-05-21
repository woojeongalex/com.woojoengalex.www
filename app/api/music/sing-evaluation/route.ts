import { NextResponse } from "next/server"
import { proxyPost } from "@/app/api/_lib/proxy"
import { UI_ERRORS } from "@/lib/user-facing-error"

export const runtime = "nodejs"

export async function POST(request: Request) {
  let body: unknown
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: "요청 본문이 올바르지 않습니다." }, { status: 400 })
  }
  return proxyPost("/api/music/sing-evaluation", body, UI_ERRORS.requestFailed)
}
