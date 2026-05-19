import { NextResponse } from "next/server"
import { proxyGet } from "../_lib/proxy"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const nickname = new URL(request.url).searchParams.get("nickname")?.trim()
  if (!nickname) {
    return NextResponse.json({ error: "닉네임을 입력하세요." }, { status: 400 })
  }
  return proxyGet(
    `/api/auth/check-nickname?nickname=${encodeURIComponent(nickname)}`,
    "닉네임 중복 확인에 실패했습니다."
  )
}
