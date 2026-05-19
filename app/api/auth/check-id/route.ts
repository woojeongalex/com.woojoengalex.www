import { NextResponse } from "next/server"
import { proxyGet } from "../_lib/proxy"

export const runtime = "nodejs"

export async function GET(request: Request) {
  const username = new URL(request.url).searchParams.get("username")?.trim()
  if (!username) {
    return NextResponse.json({ error: "아이디를 입력하세요." }, { status: 400 })
  }
  return proxyGet(
    `/api/auth/check-id?username=${encodeURIComponent(username)}`,
    "아이디 중복 확인에 실패했습니다."
  )
}
