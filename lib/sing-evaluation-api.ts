import {
  UserFacingError,
  UI_ERRORS,
  apiErrorOrFallback,
} from "@/lib/user-facing-error"

export type SingEvaluationPayload = {
  catalogSongId?: string | null
  mrSearchListId?: number | null
  inputSource: "mic" | "video"
  pitchScore: number
  rhythmScore: number
  vocalGrade: string
  summary: string
  fileName: string
  durationSec: number
}

export type SingEvaluationApiResponse = {
  id: number
  ok: boolean
  message: string
}

export async function postSingEvaluation(
  payload: SingEvaluationPayload
): Promise<SingEvaluationApiResponse> {
  const res = await fetch("/api/music/sing-evaluation", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  const data = (await res.json()) as SingEvaluationApiResponse & {
    error?: string
    detail?: string | unknown
  }
  if (!res.ok) {
    const detailStr =
      typeof data.detail === "string"
        ? data.detail
        : Array.isArray(data.detail) && data.detail.length > 0
          ? JSON.stringify(data.detail)
          : undefined
    throw new UserFacingError(
      apiErrorOrFallback(data.error ?? detailStr, UI_ERRORS.requestFailed)
    )
  }
  return {
    id: data.id,
    ok: Boolean(data.ok),
    message: typeof data.message === "string" ? data.message : "저장되었습니다.",
  }
}
