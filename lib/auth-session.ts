/** 로그인 사용자 정보 — localStorage (클라이언트 전용) */

export type UserSession = {
  username: string
  nickname?: string | null
}

const STORAGE_KEY = "iuem_user"

export function getUserSession(): UserSession | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const data = JSON.parse(raw) as UserSession
    if (!data.username) return null
    return data
  } catch {
    return null
  }
}

export function setUserSession(user: UserSession): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(user))
  window.dispatchEvent(new Event("auth-changed"))
}

export function clearUserSession(): void {
  localStorage.removeItem(STORAGE_KEY)
  window.dispatchEvent(new Event("auth-changed"))
}

/** 네비 표시: 안녕하세요, {닉네임|아이디}님 */
export function formatUserHonorific(user: UserSession): string {
  const name = user.nickname?.trim() || user.username.trim()
  return `안녕하세요, ${name}님`
}
