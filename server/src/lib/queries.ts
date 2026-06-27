import { eq, like, desc } from 'drizzle-orm'
import { db } from '../db'
import { entries, subjects } from '../schema'

export const entryFields = {
  id: entries.id,
  subject: subjects.name,
  subjectType: subjects.type,
  event: entries.event,
  date: entries.date,
  time: entries.time,
  notes: entries.notes,
  rawInput: entries.rawInput,
  createdAt: entries.createdAt
}

function baseQuery() {
  return db
    .select(entryFields)
    .from(entries)
    .innerJoin(subjects, eq(entries.subjectId, subjects.id))
}

export async function getAllEntries() {
  return baseQuery().orderBy(desc(entries.date))
}

export async function getEntriesByMonth(month: string) {
  return baseQuery()
    .where(like(entries.date, `${month}%`))
    .orderBy(entries.date)
}

export async function getEntryById(id: number) {
  const result = await baseQuery().where(eq(entries.id, id))
  return result[0] ?? null
}