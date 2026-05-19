"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, LockKeyhole, UserPlus } from "lucide-react"
import { getAvailability, postAuthJson } from "@/lib/auth-client"
import { setUserSession } from "@/lib/auth-session"
import {
  AuthIcons,
  AuthModal,
  availabilityLabel,
  Field,
  FieldWithAction,
  type AvailabilityStatus,
} from "./auth-components"

type AuthMode = "login" | "signup"
type SignupValues = {
  username: string
  nickname: string
  password: string
  passwordConfirm: string
  email: string
}
type LoginResult = {
  username: string
  nickname?: string | null
  message: string
}

const btnPrimary =
  "inline-flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-950 px-5 py-3 text-sm font-medium text-white transition-colors hover:bg-zinc-800 disabled:opacity-60"
const btnSecondary =
  "inline-flex items-center justify-center rounded-xl border border-zinc-200 bg-white px-5 py-3 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-50 disabled:opacity-60"

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
            이 화면에서는 로그인과 회원가입을 모두 진행할 수 있습니다.
          </p>
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            <div className="rounded-2xl border border-zinc-800 bg-white/5 p-5">
              <p className="text-sm font-medium text-zinc-400">로그인 후 가능</p>
              <p className="mt-3 text-2xl font-semibold">분석 기록 저장</p>
            </div>
            <div className="rounded-2xl border border-zinc-800 bg-white/5 p-5">
              <p className="text-sm font-medium text-zinc-400">회원가입 후 가능</p>
              <p className="mt-3 text-2xl font-semibold">맞춤 피드백 축적</p>
            </div>
          </div>
        </section>

        <section className="rounded-[2rem] border border-zinc-200 bg-white p-6 shadow-sm sm:p-8">
          <div className="flex rounded-2xl border border-zinc-200 bg-zinc-50 p-1">
            {(["login", "signup"] as const).map((tab) => (
              <button
                key={tab}
                type="button"
                onClick={() => setMode(tab)}
                className={`flex-1 rounded-xl px-4 py-3 text-sm font-medium transition-colors ${
                  mode === tab ? "bg-zinc-950 text-white" : "text-zinc-600 hover:bg-zinc-100"
                }`}
              >
                {tab === "login" ? "로그인" : "회원가입"}
              </button>
            ))}
          </div>
          {mode === "login" ? <LoginForm /> : <SignupForm />}
        </section>
      </div>
    </main>
  )
}

function LoginForm() {
  const router = useRouter()
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [loginResult, setLoginResult] = useState<LoginResult | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      const data = await postAuthJson<{
        message?: string
        nickname?: string | null
        username?: string | null
      }>("/api/auth/login", { username: username.trim(), password }, "로그인에 실패했습니다.")
      setLoginResult({
        username: data.username ?? username.trim(),
        nickname: data.nickname,
        message: "환영합니다!",
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : "로그인에 실패했습니다.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <FormHeader icon={LockKeyhole} label="로그인" title="계정으로 계속하기" />
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <Field label="아이디" type="text" placeholder="아이디를 입력하세요" value={username} required onChange={setUsername} />
        <Field label="비밀번호" type="password" placeholder="비밀번호를 입력하세요" value={password} required onChange={setPassword} />
        {error && <p className="text-sm font-medium text-red-600" role="alert">{error}</p>}
        <button type="submit" disabled={loading} className={btnPrimary}>
          {loading ? "로그인 중..." : "로그인하기"}
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>
      {loginResult && (
        <AuthModal
          icon={AuthIcons.LockKeyhole}
          subtitle="로그인"
          title={loginResult.message}
          rows={[
            { label: "아이디", value: loginResult.username },
            ...(loginResult.nickname ? [{ label: "닉네임", value: loginResult.nickname }] : []),
          ]}
          footer={
            <button
              type="button"
              onClick={() => {
                setUserSession({
                  username: loginResult.username,
                  nickname: loginResult.nickname,
                })
                setLoginResult(null)
                router.push("/")
              }}
              className={btnPrimary}
            >
              확인
            </button>
          }
        />
      )}
    </div>
  )
}

function SignupForm() {
  const [username, setUsername] = useState("")
  const [usernameStatus, setUsernameStatus] = useState<AvailabilityStatus>("idle")
  const [nickname, setNickname] = useState("")
  const [nicknameStatus, setNicknameStatus] = useState<AvailabilityStatus>("idle")
  const [password, setPassword] = useState("")
  const [passwordConfirm, setPasswordConfirm] = useState("")
  const [email, setEmail] = useState("")
  const [pendingSignup, setPendingSignup] = useState<SignupValues | null>(null)
  const [signupLoading, setSignupLoading] = useState(false)
  const [signupError, setSignupError] = useState<string | null>(null)
  const [signupSuccess, setSignupSuccess] = useState(false)

  const passwordMismatch = passwordConfirm.length > 0 && password !== passwordConfirm
  const passwordMatch = password.length > 0 && passwordConfirm.length > 0 && password === passwordConfirm

  const runAvailabilityCheck = async (
    value: string,
    path: string,
    param: string,
    fallbackError: string,
    setStatus: (s: AvailabilityStatus) => void
  ) => {
    const trimmed = value.trim()
    if (!trimmed) {
      setStatus("idle")
      return
    }
    setStatus("checking")
    try {
      const available = await getAvailability(path, param, trimmed, fallbackError)
      setStatus(available ? "available" : "taken")
    } catch {
      setStatus("error")
    }
  }

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (password !== passwordConfirm) return
    setSignupError(null)
    setSignupSuccess(false)
    setPendingSignup({
      username: username.trim(),
      nickname: nickname.trim(),
      password,
      passwordConfirm,
      email: email.trim(),
    })
  }

  const confirmSignup = async () => {
    if (!pendingSignup) return
    setSignupLoading(true)
    setSignupError(null)
    try {
      await postAuthJson("/api/auth/signup", {
        username: pendingSignup.username,
        nickname: pendingSignup.nickname,
        password: pendingSignup.password,
        password_confirm: pendingSignup.passwordConfirm,
        email: pendingSignup.email,
        role: "user",
      }, "회원가입 요청에 실패했습니다.")
      setSignupSuccess(true)
    } catch (err) {
      setSignupError(err instanceof Error ? err.message : "회원가입 요청에 실패했습니다.")
    } finally {
      setSignupLoading(false)
    }
  }

  return (
    <div className="mt-8">
      <FormHeader icon={UserPlus} label="회원가입" title="새 계정 만들기" />
      <form className="mt-8 space-y-4" onSubmit={handleSubmit}>
        <FieldWithAction
          label="아이디"
          type="text"
          placeholder="아이디를 입력하세요"
          actionLabel="중복 확인"
          value={username}
          required
          onChange={(v) => { setUsername(v); setUsernameStatus("idle") }}
          onAction={() => runAvailabilityCheck(username, "/api/auth/check-id", "username", "아이디 중복 확인에 실패했습니다.", setUsernameStatus)}
          status={availabilityLabel(usernameStatus)}
        />
        <FieldWithAction
          label="닉네임"
          type="text"
          placeholder="닉네임을 입력하세요"
          actionLabel="중복 확인"
          value={nickname}
          required
          onChange={(v) => { setNickname(v); setNicknameStatus("idle") }}
          onAction={() => runAvailabilityCheck(nickname, "/api/auth/check-nickname", "nickname", "닉네임 중복 확인에 실패했습니다.", setNicknameStatus)}
          status={availabilityLabel(nicknameStatus, "불가능")}
        />
        <Field label="비밀번호" type="password" placeholder="비밀번호를 설정하세요" value={password} required onChange={setPassword} />
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
        <Field label="이메일" type="email" placeholder="you@example.com" value={email} required onChange={setEmail} />
        <button type="submit" className={btnPrimary}>
          회원가입하기
          <ArrowRight className="h-4 w-4" aria-hidden="true" />
        </button>
      </form>

      {pendingSignup && (
        <AuthModal
          icon={AuthIcons.UserPlus}
          subtitle="회원가입 정보"
          title={signupSuccess ? "가입이 완료되었습니다" : "이대로 진행할까요?"}
          rows={
            signupSuccess
              ? undefined
              : [
                  { label: "아이디", value: pendingSignup.username },
                  { label: "닉네임", value: pendingSignup.nickname },
                  { label: "이메일", value: pendingSignup.email },
                ]
          }
          error={signupError}
          footer={
            signupSuccess ? (
              <button
                type="button"
                onClick={() => {
                  setPendingSignup(null)
                  setSignupSuccess(false)
                  setSignupError(null)
                }}
                className={btnPrimary}
              >
                확인
              </button>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setPendingSignup(null)
                    setSignupError(null)
                  }}
                  disabled={signupLoading}
                  className={btnSecondary}
                >
                  취소
                </button>
                <button type="button" onClick={confirmSignup} disabled={signupLoading} className={btnPrimary}>
                  {signupLoading ? "가입 중..." : "가입하기"}
                </button>
              </div>
            )
          }
        />
      )}
    </div>
  )
}

function FormHeader({
  icon: Icon,
  label,
  title,
}: {
  icon: typeof LockKeyhole
  label: string
  title: string
}) {
  return (
    <div className="flex items-center gap-3">
      <div className="rounded-full bg-zinc-100 p-3">
        <Icon className="h-5 w-5 text-zinc-900" aria-hidden="true" />
      </div>
      <div>
        <p className="text-sm text-zinc-500">{label}</p>
        <h2 className="text-2xl font-semibold">{title}</h2>
      </div>
    </div>
  )
}
