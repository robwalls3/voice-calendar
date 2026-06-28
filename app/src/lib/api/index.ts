import type { Entry } from '@/types/entry'
import { Subject } from '../db/schema'


async function apiFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`/api${path}`, {
    headers: { 
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_SECRET}`
    },
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

export async function createEntry(data: {
  subjectId: number
  event: string
  date: string
  time?: string
  notes?: string
  rawInput?: string
}) {
  return apiFetch<Entry>('/entries', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export async function getSubjects() {
  return apiFetch<Subject[]>('/subjects')
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