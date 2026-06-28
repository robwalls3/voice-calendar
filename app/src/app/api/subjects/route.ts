import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { subjects } from '@/lib/db/schema'
import { routeHandler } from '@/lib/api/handler'

export const GET = routeHandler(async (_) => {
  return db.select().from(subjects).orderBy(subjects.name)
})