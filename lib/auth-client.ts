/** 브라우저 → Next /api/auth 호출 공통 (page.tsx 중복 fetch 파싱 제거) */

export async function postAuthJson<T>(
  path: string,
  body: unknown,
  fallbackError: string
): Promise<T> {
  const res = await fetch(path, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const raw = await res.text()
  let data: T & { error?: string } = {} as T & { error?: string }
  try {
    data = raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T)
  } catch {
    throw new Error(raw.slice(0, 120) || fallbackError)
  }
  if (!res.ok) {
    throw new Error(
      (data as { error?: string }).error ?? fallbackError
    )
  }
  return data
}

export async function getAvailability(
  path: string,
  param: string,
  value: string,
  fallbackError: string
): Promise<boolean> {
  const res = await fetch(
    `${path}?${param}=${encodeURIComponent(value)}`
  )
  const data = (await res.json()) as { available?: boolean; error?: string }
  if (!res.ok) {
    throw new Error(data.error ?? fallbackError)
  }
  return Boolean(data.available)
}
