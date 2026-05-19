"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { WeatherWidget } from "@/components/weather-widget"
import {
  clearUserSession,
  formatUserHonorific,
  getUserSession,
  type UserSession,
} from "@/lib/auth-session"

export function SiteHeader() {
  const router = useRouter()
  const [user, setUser] = useState<UserSession | null>(null)

  useEffect(() => {
    const sync = () => setUser(getUserSession())
    sync()
    window.addEventListener("storage", sync)
    window.addEventListener("auth-changed", sync)
    return () => {
      window.removeEventListener("storage", sync)
      window.removeEventListener("auth-changed", sync)
    }
  }, [])

  const handleLogout = () => {
    clearUserSession()
    setUser(null)
    router.push("/")
  }

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav
        className={`flex w-full items-center justify-between px-3 sm:px-6 ${
          user ? "min-h-[4.75rem] py-2" : "h-16"
        }`}
      >
        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
          >
            IUEM
          </Link>
          <span className="whitespace-nowrap text-xs font-semibold tracking-[0.14em] text-zinc-500 sm:text-sm">
            오늘, 새로운 나와 이음
          </span>
        </div>

        <div className="flex flex-col items-end gap-2.5 pt-0.5">
          <div className="flex items-center gap-2 sm:gap-3">
            <WeatherWidget variant="compact" />
            <Link
              href="/speech"
              className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
            >
              스피치
            </Link>
            <Link
              href="/titanic"
              className="rounded-lg border border-zinc-300 bg-white px-4 py-2 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
            >
              타이타닉
            </Link>
            {user ? (
              <button
                type="button"
                onClick={handleLogout}
                className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                로그아웃
              </button>
            ) : (
              <Link
                href="/auth"
                className="rounded-lg border border-zinc-900 bg-zinc-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
              >
                로그인
              </Link>
            )}
          </div>
          {user && (
            <span className="mt-1 pr-1 text-base font-bold text-black sm:text-lg">
              {formatUserHonorific(user)}
            </span>
          )}
        </div>
      </nav>
    </header>
  )
}
