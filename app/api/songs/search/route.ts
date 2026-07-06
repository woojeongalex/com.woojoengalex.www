import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { proxyToBackend } from '@/app/api/_lib/proxy'

export const runtime = 'nodejs'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q') ?? ''
  const res = await proxyToBackend(
    `/api/songs/search?${new URLSearchParams({ q })}`
  )
  const data: unknown = await res.json()
  return NextResponse.json(data, { status: res.status })
}
