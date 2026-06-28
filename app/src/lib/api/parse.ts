import { db } from "@/lib/db";
import { entries, subjects } from "@/lib/db/schema";
import { getEntryById } from "@/lib/db/queries";
import { parseWithGemini } from "@/lib/gemini";
import { ApiError } from "./errors";

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

  let parsed;

  try {
    parsed = await parseWithGemini(text);
  } catch (err) {
    console.error("Gemini failed, using fallback", err);
    parsed = await fallbackParse(text);
  }

  if (!parsed?.subject || !parsed?.event || !parsed?.date) {
    throw new ApiError(422, "Could not extract required fields");
  }

  const allSubjects = await db.select().from(subjects);

  const matchedSubject = allSubjects.find(s =>
    parsed.subject &&
    s.name.toLowerCase() === parsed.subject.toLowerCase()
  );

  let subjectId: number;

  if (matchedSubject) {
    subjectId = matchedSubject.id;
  } else {
    const fallback = await db.select().from(subjects).limit(1);

    if (!fallback.length) {
      throw new ApiError(422, "No subjects available");
    }

    subjectId = fallback[0].id;
  }

  const inserted = await db
    .insert(entries)
    .values({
      subjectId, // FIXED
      event: parsed.event,
      date: parsed.date,
      time: parsed.time,
      notes: parsed.notes,
      rawInput: text,
    })
    .returning({ id: entries.id });

  return await getEntryById(inserted[0].id);
}

async function fallbackParse(text: string) {
  const lower = text.toLowerCase();
  const allSubjects = await db.select().from(subjects);

  const matched = allSubjects.find(s =>
    lower.includes(s.name.toLowerCase())
  );

  return {
    subject: matched?.name ?? "unknown",
    event: text,
    date: new Date().toISOString().slice(0, 10),
    time: null,
    notes: null,
  };
}