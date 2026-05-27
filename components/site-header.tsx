"use client"

import Link from "next/link"
import { ChevronDown } from "lucide-react"
import { WeatherWidget } from "@/components/weather-widget"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useUserSession } from "@/hooks/use-user-session"
import { getUserDisplayName } from "@/lib/auth-session"

const navLinkClass =
  "inline-flex shrink-0 items-center justify-center rounded-lg border px-3 py-2 text-xs font-medium transition-colors sm:px-4 sm:text-sm"

/** MENU 드롭다운 — 흰 건반 / 검은 건반 */
const pianoMenuKeyWhite =
  "rounded-none bg-white px-4 py-3 font-medium text-zinc-900 focus:bg-zinc-100 focus:text-zinc-900 data-[highlighted]:bg-zinc-100 data-[highlighted]:text-zinc-900"
const pianoMenuKeyBlack =
  "rounded-none border-t border-zinc-300 bg-zinc-900 px-4 py-3 font-medium text-white focus:bg-zinc-800 focus:text-white data-[highlighted]:bg-zinc-800 data-[highlighted]:text-white"

export function SiteHeader() {
  const user = useUserSession()

  return (
    <header className="sticky top-0 z-50 border-b border-zinc-200 bg-white/95 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl min-w-0 flex-col gap-3 px-3 py-3 sm:px-6 md:flex-row md:items-center md:justify-between md:gap-4 md:py-2.5">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link
            href="/"
            className={`${navLinkClass} border-zinc-300 bg-white text-zinc-900 hover:bg-zinc-50`}
          >
            IUEM
          </Link>
          <span className="hidden min-w-0 truncate text-xs font-semibold tracking-[0.14em] text-zinc-500 sm:inline sm:text-sm">
            오늘, 새로운 나와 이음
          </span>
        </div>

        <div className="flex min-w-0 flex-col gap-2 md:items-end">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <WeatherWidget variant="compact" />
            <DropdownMenu>
              <DropdownMenuTrigger
                className={`${navLinkClass} gap-1 border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800 data-[state=open]:bg-zinc-800`}
              >
                MENU
                <ChevronDown className="size-3.5 opacity-80" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="min-w-[9.5rem] overflow-hidden rounded-lg border border-zinc-900 bg-white p-0 shadow-md"
              >
                <DropdownMenuItem asChild className={pianoMenuKeyWhite}>
                  <Link href="/speech" className="flex w-full cursor-pointer">
                    스피치
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild className={pianoMenuKeyBlack}>
                  <Link href="/titanic" className="flex w-full cursor-pointer">
                    LESSON
                  </Link>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            {!user && (
              <Link
                href="/auth"
                className={`${navLinkClass} border-zinc-900 bg-zinc-900 text-white hover:bg-zinc-800`}
              >
                로그인
              </Link>
            )}
          </div>
          {user && (
            <p className="min-w-0 truncate pl-0.5 text-sm font-bold text-black sm:text-base md:text-right">
              안녕하세요,{" "}
              <Link
                href="/mypage"
                className="underline decoration-zinc-400 underline-offset-2 hover:text-zinc-700"
              >
                {getUserDisplayName(user)}
              </Link>
              님
            </p>
          )}
        </div>
      </nav>
    </header>
  )
}
