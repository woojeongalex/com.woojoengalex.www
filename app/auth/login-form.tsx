"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, LockKeyhole } from "lucide-react"
import { postAuthJson } from "@/lib/auth-client"
import { AUTH_MESSAGES } from "@/lib/auth-messages"
import type { LoginResponse } from "@/lib/auth-types"
import { setUserSession } from "@/lib/auth-session"
import { useAsyncAction } from "@/hooks/use-async-action"
import { AuthFormMessage, AuthFormShell, btnPrimary, Field, FormHeader } from "./auth-components"

export function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const { loading, error, run } = useAsyncAction()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await run(
      () =>
        postAuthJson<LoginResponse>(
          "/api/auth/login",
          { username: username.trim(), password },
          AUTH_MESSAGES.loginFailed
        ),
      {
        fallbackError: AUTH_MESSAGES.loginFailed,
        onSuccess: (data) => {
          setUserSession({
            username: data.username ?? username.trim(),
            nickname: data.nickname,
          })
          router.push("/")
        },
      }
    )
  }

  return (
    <AuthFormShell>
      <FormHeader icon={LockKeyhole} label="로그인" title="계정으로 계속하기" />
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Field
          label="아이디"
          type="text"
          placeholder="아이디를 입력하세요"
          value={username}
          required
          onChange={setUsername}
        />
        <Field
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 입력하세요"
          value={password}
          required
          onChange={setPassword}
        />
        <AuthFormMessage error={error} />
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "로그인 중..." : "로그인하기"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </AuthFormShell>
  )
}
