import { pgTable, serial, integer, text, timestamp } from 'drizzle-orm/pg-core'

export const subjects = pgTable('subjects', {
  id: serial('id').primaryKey(),
  name: text('name').notNull().unique(),
  type: text('type').notNull(),
})

export const entries = pgTable('entries', {
  id: serial('id').primaryKey(),
  subjectId: integer('subject_id').notNull().references(() => subjects.id),
  event: text('event').notNull(),         // sneeze, wheeze, anxious, felt great, etc
  date: text('date').notNull(),
  time: text('time'),
  notes: text('notes'),
  rawInput: text('raw_input'),
  createdAt: timestamp('created_at').defaultNow()
})

export type Subject = typeof subjects.$inferSelect
export type Entry = typeof entries.$inferSelect
export type NewEntry = typeof entries.$inferInsert