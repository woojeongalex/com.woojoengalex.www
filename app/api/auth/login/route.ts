import { proxyPost } from "../_lib/proxy"

export const runtime = "nodejs"

export async function POST(request: Request) {
  const body = await request.json()
  return proxyPost("/api/auth/login", body, "로그인에 실패했습니다.")
}
