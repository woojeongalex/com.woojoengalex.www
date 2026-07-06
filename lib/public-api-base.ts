/** 화면에 안내용으로 노출하는 공개 API 베이스 URL (NEXT_PUBLIC_*) */
export function getPublicApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'
}
