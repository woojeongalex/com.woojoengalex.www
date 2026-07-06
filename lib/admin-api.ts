const API = process.env.NEXT_PUBLIC_API_BASE ?? 'http://localhost:4000'

export async function adminApiFetch<T>(path: string): Promise<T> {
  const res = await fetch(`${API}${path}`, { cache: 'no-store' })
  if (!res.ok) throw new Error(`${path} → ${res.status}`)
  return res.json() as Promise<T>
}
