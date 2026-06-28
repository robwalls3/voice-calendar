import { getEntries } from "@/lib/api/entries";
import { routeHandler } from "@/lib/api/handler";
import { entries } from '@/lib/db/schema'
import { db } from '@/lib/db';
import { NextRequest } from "next/server";



export const GET = routeHandler(async () => getEntries());

export const POST = routeHandler(async (req: NextRequest) => {
  const body = await req.json()

  const newEntry = await db
    .insert(entries)
    .values({
      subjectId: body.subjectId,
      event: body.event,
      date: body.date,
      time: body.time ?? null,
      notes: body.notes ?? null,
      rawInput: body.rawInput ?? null,
    })
    .returning()

  return newEntry[0]
})