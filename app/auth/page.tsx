"use client"

import { useState } from "react"
import { ArrowRight, Check, LockKeyhole, UserPlus } from "lucide-react"

type AuthMode = "login" | "signup"
type SignupValues = {
  username: string
  nickname: string
  password: string
  passwordConfirm: string
  email: string
}

export default function AuthPage() {
  const [mode, setMode] = useState<AuthMode>("login")

  return (
    <main className="min-h-[calc(100vh-4rem)] bg-white px-4 py-10 text-zinc-950">
      <div className="mx-auto grid w-full max-w-6xl gap-8 lg:grid-cols-[1fr_0.95fr]">
        <section className="rounded-[2rem] border border-zinc-200 bg-zinc-950 px-6 py-10 text-white shadow-[0_24px_60px_rgba(0,0,0,0.12)] sm:px-10">
          <p className="text-sm font-medium tracking-[0.18em] text-zinc-400 uppercase">
            Account
          </p>
          <h1 className="mt-4 text-4xl font-semibold tracking-tight sm:text-5xl">
            로그인하고 나만의
            <br />
            분석 기록을 이어가세요.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-zinc-300 sm:text-base">
            이 화면에서는 로그인과 회원가입을 모두 진행할 수 있습니다. 이후에는 사용자의
            분석 기록, 즐겨찾는 곡, 피드백 히스토리를 계정 단위로 저장하는 흐름으로
            확장할 수 있습니다.
          </p>

          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-white/5 p-5">
              <p className="text-sm font-medium text-zinc-400">로그인 후 가능</p>
              <p className="mt-3 text-2xl font-semibold">분석 기록 저장</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                이전에 분석한 곡과 음정/박자 결과를 다시 확인할 수 있습니다.
              </p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/5 p-5">
              <p className="text-sm font-medium text-zinc-400">회원가입 후 가능</p>
              <p className="mt-3 text-2xl font-semibold">맞춤 피드백 축적</p>
              <p className="mt-2 text-sm leading-6 text-zinc-400">
                연습 패턴에 맞는 개인화 코칭과 선호 장르를 관리할 수 있습니다.
              </p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1">
            <button
              type="button"
              onClick={() => setMode("login")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                mode === "login"
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              로그인
            </button>
            <button
              type="button"
              onClick={() => setMode("signup")}
              className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                mode === "signup"
                  ? "bg-zinc-950 text-white"
                  : "text-zinc-600 hover:bg-zinc-100"
              }`}
            >
              회원가입
            </button>
          </div>

          {mode === "login" ? <LoginForm /> : <SignupForm />}
        </section>
      </div>
    </main>
  )
}

function LoginForm() {
  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-zinc-100 p-3">
          <LockKeyhole className="h-5 w-5 text-zinc-900" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-zinc-500">로그인</p>
          <h2 className="text-2xl font-semibold">계정으로 계속하기</h2>
        </div>
      </div>

      <form className="mt-8 space-y-4">
        <Field label="이메일" type="email" placeholder="you@example.com" />
        <Field label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" />

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          로그인하기
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
    </div>
  )
}

function SignupForm() {
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle")
  const [nickname, setNickname] = useState("")
  const [nicknameStatus, setNicknameStatus] = useState<
    "idle" | "checking" | "available" | "taken" | "error"
  >("idle")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [email, setEmail] = useState("")
  const [submittedValues, setSubmittedValues] = useState<SignupValues | null>(null)

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm
  const passwordMatch = password.length > 0 && passwordConfirm.length > 0 && password === passwordConfirm

  const checkUsername = async () => {
    const trimmed = username.trim()
    if (!trimmed) {
      setUsernameStatus("idle")
      return
    }

    setUsernameStatus("checking")
    try {
      const res = await fetch(`/api/auth/check-id?username=${encodeURIComponent(trimmed)}`)
      const data = (await res.json()) as { available?: boolean }
      if (!res.ok) {
        throw new Error("아이디 중복 확인에 실패했습니다.")
      }
      setUsernameStatus(data.available ? "available" : "taken")
    } catch {
      setUsernameStatus("error")
    }
  }

  const checkNickname = async () => {
    const trimmed = nickname.trim()
    if (!trimmed) {
      setNicknameStatus("idle")
      return
    }

    setNicknameStatus("checking")
    try {
      const res = await fetch(`/api/auth/check-nickname?nickname=${encodeURIComponent(trimmed)}`)
      const data = (await res.json()) as { available?: boolean }
      if (!res.ok) {
        throw new Error("닉네임 중복 확인에 실패했습니다.")
      }
      setNicknameStatus(data.available ? "available" : "taken")
    } catch {
      setNicknameStatus("error")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    const values = {
      username,
      nickname,
      password,
      passwordConfirm,
      email,
    }

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: values.username,
          nickname: values.nickname,
          password: values.password,
          password_confirm: values.passwordConfirm,
          email: values.email,
          role: "user",
        }),
      })
      const data = (await res.json()) as { error?: string }

      if (!res.ok) {
        throw new Error(data.error ?? "회원가입 요청에 실패했습니다.")
      }

      setSubmittedValues(values)
    } catch (error) {
      alert(error instanceof Error ? error.message : "회원가입 요청에 실패했습니다.")
    }
  }

  return (
    <div className="mt-8">
      <div className="flex items-center gap-3">
        <div className="rounded-full bg-zinc-100 p-3">
          <UserPlus className="h-5 w-5 text-zinc-900" aria-hidden="true" />
        </div>
        <div>
          <p className="text-sm text-zinc-500">회원가입</p>
          <h2 className="text-2xl font-semibold">새 계정 만들기</h2>
        </div>
      </div>

      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <FieldWithAction
          label="아이디"
          type="text"
          placeholder="아이디를 입력하세요"
          actionLabel="중복 확인"
          value={username}
          required
          onChange={(value) => {
            setUsername(value)
            setUsernameStatus("idle")
          }}
          onAction={checkUsername}
          status={
            usernameStatus === "checking"
              ? { text: "확인 중...", tone: "neutral" }
              : usernameStatus === "available"
                ? { text: "사용가능", tone: "success" }
                : usernameStatus === "taken"
                  ? { text: "이미 사용중", tone: "error" }
                  : usernameStatus === "error"
                    ? { text: "확인 실패", tone: "error" }
                    : undefined
          }
        />
        <FieldWithAction
          label="닉네임"
          type="text"
          placeholder="닉네임을 입력하세요"
          actionLabel="중복 확인"
          value={nickname}
          required
          onChange={(value) => {
            setNickname(value)
            setNicknameStatus("idle")
          }}
          onAction={checkNickname}
          status={
            nicknameStatus === "checking"
              ? { text: "확인 중...", tone: "neutral" }
              : nicknameStatus === "available"
                ? { text: "사용가능", tone: "success" }
                : nicknameStatus === "taken"
                  ? { text: "불가능", tone: "error" }
                  : nicknameStatus === "error"
                    ? { text: "확인 실패", tone: "error" }
                    : undefined
          }
        />
        <Field
          label="비밀번호"
          type="password"
          placeholder="비밀번호를 설정하세요"
          value={password}
          required
          onChange={setPassword}
        />
        <Field
          label="비밀번호 확인"
          type="password"
          placeholder="비밀번호를 다시 입력하세요"
          value={passwordConfirm}
          required
          onChange={setPasswordConfirm}
          status={
            passwordMismatch
              ? { text: "비밀번호가 다릅니다", tone: "error" }
              : passwordMatch
                ? { text: "일치", tone: "success", icon: "check" }
              : undefined
          }
        />
        <Field
          label="이메일"
          type="email"
          placeholder="you@example.com"
          value={email}
          required
          onChange={setEmail}
        />

        <button
          type="submit"
          className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          회원가입하기
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {submittedValues && (
        <SignupSummaryModal
          values={submittedValues}
          onClose={() => setSubmittedValues(null)}
        />
      )}
    </div>
  )
}

function SignupSummaryModal({
  values,
  onClose,
}: {
  values: SignupValues
  onClose: () => void
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-6 text-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-zinc-100 p-3">
            <UserPlus className="h-5 w-5 text-zinc-900" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">회원가입 정보</p>
            <h2 className="text-2xl font-semibold">이대로 진행할까요?</h2>
          </div>
        </div>

        <div className="mt-6 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
          <SummaryRow label="아이디" value={values.username} />
          <SummaryRow label="닉네임" value={values.nickname} />
          <SummaryRow label="이메일" value={values.email} />
        </div>

        <button
          type="button"
          onClick={onClose}
          className="mt-5 inline-flex w-full items-center justify-center rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800"
        >
          확인
        </button>
      </section>
    </div>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-4 text-sm">
      <span className="shrink-0 font-medium text-zinc-500">{label}</span>
      <span className="break-all text-right font-semibold text-zinc-900">{value}</span>
    </div>
  )
}

function FieldWithAction({
  label,
  type,
  placeholder,
  actionLabel,
  value,
  onChange,
  onAction,
  status,
  required,
}: {
  label: string
  type: string
  placeholder: string
  actionLabel: string
  value: string
  onChange: (value: string) => void
  onAction: () => void
  status?: { text: string; tone: "success" | "error" | "neutral"; icon?: "check" }
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
        <span>{label}</span>
        {status && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              status.tone === "success"
                ? "text-green-600"
                : status.tone === "error"
                  ? "text-red-600"
                  : "text-zinc-500"
            }`}
          >
            {status.icon === "check" && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {status.text}
          </span>
        )}
      </span>
      <div className="flex gap-2">
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          required={required}
          onChange={(e) => onChange(e.target.value)}
          className="min-w-0 flex-1 rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950"
        />
        <button
          type="button"
          onClick={onAction}
          className="shrink-0 rounded-xl border border-zinc-900 bg-white px-4 py-3 text-sm font-medium text-zinc-900 transition-colors hover:bg-zinc-50"
        >
          {actionLabel}
        </button>
      </div>
    </label>
  )
}

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  status,
  required,
}: {
  label: string
  type: string
  placeholder: string
  value?: string
  onChange?: (value: string) => void
  status?: { text: string; tone: "success" | "error" | "neutral"; icon?: "check" }
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
        <span>{label}</span>
        {status && (
          <span
            className={`inline-flex items-center gap-1 text-xs font-semibold ${
              status.tone === "success"
                ? "text-green-600"
                : status.tone === "error"
                  ? "text-red-600"
                  : "text-zinc-500"
            }`}
          >
            {status.icon === "check" && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
            {status.text}
          </span>
        )}
      </span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        required={required}
        onChange={onChange ? (e) => onChange(e.target.value) : undefined}
        className="w-full rounded-xl border border-zinc-300 bg-white px-4 py-3 text-sm text-zinc-900 outline-none transition-colors placeholder:text-zinc-400 focus:border-zinc-950"
      />
    </label>
  )
}
