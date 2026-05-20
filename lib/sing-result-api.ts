import {
  UserFacingError,
  UI_ERRORS,
  apiErrorOrFallback,
} from "@/lib/user-facing-error"

export type SingResultPayload = {
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

export type SingResultApiResponse = {
  id: number
  ok: boolean
  message: string
}

export async function postSingResult(
  payload: SingResultPayload
): Promise<SingResultApiResponse> {
  const res = await fetch("/api/music/sing-result", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
    cache: "no-store",
  })
  const data = (await res.json()) as SingResultApiResponse & {
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
