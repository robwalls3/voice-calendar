import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { entries, subjects } from "@/lib/db/schema";
import { getEntryById } from "@/lib/db/queries";
import { parseWithGemini } from "@/lib/gemini";
import { ApiError } from "./errors"

export async function parse(text: string) {
  if (!text) {
    throw new ApiError(400, "text is required");
  }

  return await parseWithGemini(text);
}

export async function parseAndSave(text: string) {
  if (!text) {
    throw new ApiError(400, "text is required");
  }

  const parsed = await parseWithGemini(text);

  if (!parsed.subject || !parsed.event || !parsed.date) {
    throw new ApiError(422, "Could not extract required fields");
  }

  const subject = await db
    .select()
    .from(subjects)
    .where(eq(subjects.name, parsed.subject.toLowerCase()))
    .limit(1);

  if (!subject.length) {
    throw new ApiError(422, `Unknown subject: ${parsed.subject}`);
  }

  const inserted = await db
    .insert(entries)
    .values({
      subjectId: subject[0].id,
      event: parsed.event,
      date: parsed.date,
      time: parsed.time,
      notes: parsed.notes,
      rawInput: text,
    })
    .returning({ id: entries.id });

  return await getEntryById(inserted[0].id);
}