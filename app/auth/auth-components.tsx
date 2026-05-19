import { Check, LockKeyhole, UserPlus, type LucideIcon } from "lucide-react"
import type { ReactNode } from "react"

export type AvailabilityStatus = "idle" | "checking" | "available" | "taken" | "error"

/** 중복 확인 UI 상태 — SignupForm if-else 중첩 제거 */
export function availabilityLabel(
  status: AvailabilityStatus,
  takenText = "이미 사용중"
): { text: string; tone: "success" | "error" | "neutral" } | undefined {
  switch (status) {
    case "checking":
      return { text: "확인 중...", tone: "neutral" }
    case "available":
      return { text: "사용가능", tone: "success" }
    case "taken":
      return { text: takenText, tone: "error" }
    case "error":
      return { text: "확인 실패", tone: "error" }
    default:
      return undefined
  }
}

type SummaryRow = { label: string; value: string }

/** 로그인/회원가입 공통 모달 (스타일 단일화) */
export function AuthModal({
  icon: Icon,
  subtitle,
  title,
  rows,
  error,
  footer,
}: {
  icon: LucideIcon
  subtitle: string
  title: string
  rows?: SummaryRow[]
  error?: string | null
  footer: ReactNode
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/45 px-4 backdrop-blur-sm">
      <section className="w-full max-w-md rounded-[2rem] border border-zinc-200 bg-white p-6 text-zinc-950 shadow-[0_24px_80px_rgba(0,0,0,0.22)] sm:p-8">
        <div className="flex items-center gap-3">
          <div className="rounded-full bg-zinc-100 p-3">
            <Icon className="h-5 w-5 text-zinc-900" aria-hidden="true" />
          </div>
          <div>
            <p className="text-sm text-zinc-500">{subtitle}</p>
            <h2 className="text-2xl font-semibold">{title}</h2>
          </div>
        </div>

        {rows && rows.length > 0 && (
          <div className="mt-6 space-y-3 rounded-2xl border border-zinc-200 bg-zinc-50 p-4">
            {rows.map((row) => (
              <div
                key={row.label}
                className="flex items-start justify-between gap-4 text-sm"
              >
                <span className="shrink-0 font-medium text-zinc-500">{row.label}</span>
                <span className="break-all text-right font-semibold text-zinc-900">
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        )}

        {error && (
          <p className="mt-4 text-sm font-medium text-red-600" role="alert">
            {error}
          </p>
        )}

        <div className="mt-5">{footer}</div>
      </section>
    </div>
  )
}

export const AuthIcons = { LockKeyhole, UserPlus }

type FieldStatus = { text: string; tone: "success" | "error" | "neutral"; icon?: "check" }

function StatusBadge({ status }: { status?: FieldStatus }) {
  if (!status) return null
  const color =
    status.tone === "success"
      ? "text-green-600"
      : status.tone === "error"
        ? "text-red-600"
        : "text-zinc-500"
  return (
    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${color}`}>
      {status.icon === "check" && <Check className="h-3.5 w-3.5" aria-hidden="true" />}
      {status.text}
    </span>
  )
}

export function Field({
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
  status?: FieldStatus
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
        <span>{label}</span>
        <StatusBadge status={status} />
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

export function FieldWithAction({
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
  status?: FieldStatus
  required?: boolean
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-medium text-zinc-700">
        <span>{label}</span>
        <StatusBadge status={status} />
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
