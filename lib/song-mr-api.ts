import {
  UserFacingError,
  UI_ERRORS,
  apiErrorOrFallback,
} from "@/lib/user-facing-error"

/** FastAPI `GET /api/songs/search` 응답 (Next 프록시 경유) */

export type SongMrHit = {
  /** Neon `song_mr_search_lists.id` (정수 PK) */
  id: number
  catalog_song_id: string
  title: string
  artist: string
  bpm: number
  song_key: string
  range_label: string
  mr_track_name: string
  mr_description: string
}

export type SongMrSearchPayload = {
  query: string
  hits: SongMrHit[]
  count: number
}

export async function fetchSongMrSearch(query: string): Promise<SongMrSearchPayload> {
  const q = query.trim()
  const res = await fetch(`/api/songs/search?${new URLSearchParams({ q })}`, {
    cache: "no-store",
  })
  const data = (await res.json()) as SongMrSearchPayload & { error?: string }
  if (!res.ok) {
    throw new UserFacingError(
      apiErrorOrFallback(data.error, UI_ERRORS.requestFailed)
    )
  }
  return {
    query: typeof data.query === "string" ? data.query : q,
    hits: Array.isArray(data.hits) ? data.hits : [],
    count: typeof data.count === "number" ? data.count : 0,
  }
}
