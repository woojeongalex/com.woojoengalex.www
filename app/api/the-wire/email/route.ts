import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

const API_URL = process.env.API_BASE_URL ?? 'http://localhost:8000'

export async function POST(req: NextRequest) {
  const body: unknown = await req.json()
  const res = await fetch(`${API_URL}/api/the-wire/email`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const data: unknown = await res.json()
  return NextResponse.json(data, { status: res.status })
}
