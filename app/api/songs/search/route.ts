import { NextRequest, NextResponse } from "next/server"
import { proxyGet } from "@/app/api/_lib/proxy"
import { UI_ERRORS } from "@/lib/user-facing-error"

export const runtime = "nodejs"

export async function GET(req: NextRequest) {
  const q = req.nextUrl.searchParams.get("q")?.trim() ?? ""
  if (!q) {
    return NextResponse.json({ error: "검색어를 입력하세요." }, { status: 400 })
  }
  const path = `/api/songs/search?${new URLSearchParams({ q }).toString()}`
  return proxyGet(path, UI_ERRORS.requestFailed)
}
