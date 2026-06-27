import type { Entry } from '@/types/entry'


async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options
  })
  if (!res.ok) throw new Error(`API error: ${res.status} ${res.statusText}`)
  return res.json() as Promise<T>
}

export async function getEntries() {
  return apiFetch<Entry[]>('/entries')
}

export async function getEntriesByMonth(month: string) {
  return apiFetch<Entry[]>(`/entries/month/${month}`)
}

export async function getEntry(id: number) {
  return apiFetch<Entry>(`/entries/${id}`)
}

export async function deleteEntry(id: number) {
  return apiFetch(`/entries/${id}`, { method: 'DELETE' })
}

export async function parseAndSave(text: string) {
  return apiFetch<Entry>('/parse/save', {
    method: 'POST',
    body: JSON.stringify({ text })
  })
}