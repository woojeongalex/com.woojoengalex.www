/** 브라우저 → Next /api/auth 호출 */

async function parseJsonResponse<T>(
  res: Response,
  fallbackError: string
): Promise<T> {
  const raw = await res.text()
  let data: T & { error?: string } = {} as T & { error?: string }
  try {
    data = raw ? (JSON.parse(raw) as T & { error?: string }) : ({} as T)
  } catch {
    throw new Error(raw.slice(0, 120) || fallbackError)
  }
  if (!res.ok) {
    throw new Error(data.error ?? fallbackError)
  }
  return data
}

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
  return parseJsonResponse<T>(res, fallbackError)
}

export async function getAvailability(
  path: string,
  param: string,
  value: string,
  fallbackError: string
): Promise<boolean> {
  const res = await fetch(`${path}?${param}=${encodeURIComponent(value)}`)
  const data = await parseJsonResponse<{ available?: boolean }>(res, fallbackError)
  return Boolean(data.available)
}
