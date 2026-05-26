export function getApiBaseUrl(): string {
  const base =
    process.env.API_BASE_URL?.trim() ||
    process.env.NEXT_PUBLIC_API_BASE_URL?.trim() ||
    "http://127.0.0.1:8000"
  return base.replace(/\/$/, "")
}

export async function proxyToBackend(
  path: string,
  init?: RequestInit
): Promise<Response> {
  const url = `${getApiBaseUrl()}${path.startsWith("/") ? path : `/${path}`}`
  return fetch(url, { ...init, cache: "no-store" })
}
