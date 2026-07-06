import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')
  const url = q
    ? `${API_URL}/api/the-wire/contacts?q=${encodeURIComponent(q)}`
    : `${API_URL}/api/the-wire/contacts/all`
  const res = await fetch(url)
  const data: unknown = await res.json()
  return NextResponse.json(data, { status: res.status })
}

export async function POST(req: NextRequest) {
  const body: unknown = await req.json()
  const res = await fetch(`${API_URL}/api/the-wire/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data: unknown = await res.json()
  return NextResponse.json(data, { status: res.status })
}
