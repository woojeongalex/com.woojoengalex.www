import { NextRequest, NextResponse } from "next/server"

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://127.0.0.1:8000"

export async function POST(req: NextRequest) {
  const formData = await req.formData()
  const res = await fetch(`${API_URL}/api/the-wire/contacts/upload`, {
    method: "POST",
    body: formData,
  })
  const data = await res.json()
  return NextResponse.json(data, { status: res.status })
}
