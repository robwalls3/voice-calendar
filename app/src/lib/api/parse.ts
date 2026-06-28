import { db } from "@/lib/db";
import { entries, Subject, subjects } from "@/lib/db/schema";
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

  const allSubjects = await db.select().from(subjects);

  // try {
  //   parsed = await parseWithGemini(text);
  // } catch (err) {
  //   console.error("Gemini failed, using fallback", err);
  const parsed = await fallbackParse(text, allSubjects);
  // }

  if (!parsed?.subject || !parsed?.event || !parsed?.date) {
    throw new ApiError(422, "Could not extract required fields");
  }


  const matchedSubject = allSubjects.find(s =>
    parsed.subject &&
    s.name.toLowerCase() === parsed.subject.toLowerCase()
  );

  const subjectId = matchedSubject?.id || allSubjects[0].id;

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

  return { ...inserted }
}

async function fallbackParse(text: string, allSubjects: Subject[]) {
  const lower = text.toLowerCase();

  const matched = allSubjects.find(s =>
    lower.includes(s.name.toLowerCase())
  );

  const { date, time } = (() => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Denver",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    }).formatToParts(now);

    const get = (type: any) => parts.find(p => p.type === type)?.value;

    return {
      date: `${get("year")}-${get("month")}-${get("day")}`,
      time: `${get("hour")}:${get("minute")}:${get("second")}`,
    };
  })();

  return {
    subject: matched?.name ?? "unknown",
    event: text,
    date,
    time,
    notes: null,
  };
}