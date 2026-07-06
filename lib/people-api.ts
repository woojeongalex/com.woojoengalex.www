export interface Contact {
  name: string
  email: string
}

interface LocalContactsResponse {
  contacts?: Contact[]
}

interface GooglePersonName {
  displayName?: string
}

interface GooglePersonEmail {
  value?: string
}

interface GooglePerson {
  names?: GooglePersonName[]
  emailAddresses?: GooglePersonEmail[]
}

interface GoogleSearchResult {
  person?: GooglePerson
}

interface GoogleSearchContactsResponse {
  results?: GoogleSearchResult[]
}

const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://127.0.0.1:8000'

async function searchLocal(query: string): Promise<Contact[]> {
  const res = await fetch(
    `${API_BASE}/api/the-wire/contacts?q=${encodeURIComponent(query)}`
  )
  if (!res.ok) return []
  const data = (await res.json()) as LocalContactsResponse
  return data.contacts ?? []
}

async function saveLocal(contact: Contact): Promise<void> {
  await fetch(`${API_BASE}/api/the-wire/contacts`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(contact),
  })
}

async function searchGoogle(
  query: string,
  accessToken: string
): Promise<Contact[]> {
  const url = new URL('https://people.googleapis.com/v1/people:searchContacts')
  url.searchParams.set('query', query)
  url.searchParams.set('readMask', 'names,emailAddresses')
  url.searchParams.set('pageSize', '5')

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })
  if (!res.ok) return []

  const data = (await res.json()) as GoogleSearchContactsResponse
  return (data.results ?? [])
    .map((r) => ({
      name: r.person?.names?.[0]?.displayName ?? '',
      email: r.person?.emailAddresses?.[0]?.value ?? '',
    }))
    .filter((c: Contact) => c.email !== '')
}

export async function searchContacts(
  query: string,
  accessToken: string
): Promise<Contact[]> {
  if (!query || query.length < 1) return []

  // 1. 로컬 DB 먼저 검색 (로그인 불필요)
  const local = await searchLocal(query)
  if (local.length > 0) return local

  // 2. 로컬에 없고 Google 로그인 된 경우에만 Google API 검색
  if (!accessToken) return []
  const google = await searchGoogle(query, accessToken)

  // 3. 검색 결과를 로컬 DB에 저장 (소버린 AI)
  for (const contact of google) {
    saveLocal(contact).catch(() => {})
  }

  return google
}
