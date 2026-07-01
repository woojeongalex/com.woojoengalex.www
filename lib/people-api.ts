export interface Contact {
  name: string
  email: string
}

export async function searchContacts(
  query: string,
  accessToken: string
): Promise<Contact[]> {
  if (!query || query.length < 1) return []

  const url = new URL("https://people.googleapis.com/v1/people:searchContacts")
  url.searchParams.set("query", query)
  url.searchParams.set("readMask", "names,emailAddresses")
  url.searchParams.set("pageSize", "5")

  const res = await fetch(url.toString(), {
    headers: { Authorization: `Bearer ${accessToken}` },
  })

  if (!res.ok) return []

  const data = await res.json()

  return (data.results ?? [])
    .map((r: any) => ({
      name: r.person?.names?.[0]?.displayName ?? "",
      email: r.person?.emailAddresses?.[0]?.value ?? "",
    }))
    .filter((c: Contact) => c.email !== "")
}
