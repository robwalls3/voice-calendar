import type { Request, Response } from 'express'
import { eq } from 'drizzle-orm'
import { db } from '../../db'
import { entries, subjects } from '../../schema'
import { getEntryById } from '../../lib/queries'
import type { Route } from '../../handler'

import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

console.log("Created ai", process.env.GEMINI_API_KEY);

type ParsedEntry = {
  subject: string
  event: string
  date: string
  time: string | null
  notes: string | null
}

const getPrompt = () => {
  const now = new Date();

  const currentDate = now.toLocaleDateString("en-CA"); // YYYY-MM-DD
  const currentTime = now.toLocaleTimeString("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
  return  `You are a journal assistant for a family.

Extract the primary event from the user's journal entry or voice transcript.

Subjects:
- daisy: the cat
- rob: a person
- meredith: a person
- house: anything related to the home or household

Guidelines:
- Choose the single most appropriate subject.
- event should be 2–5 lowercase words describing the primary event.
- notes should contain any useful additional context that doesn't belong in event.
- If the user mentions a specific date or time, use it.
- Otherwise assume today's date.
- If no time is given, use null.
- Resolve relative dates and times such as "today", "yesterday", "this morning", "last night", or "tomorrow" using the current date and time below.

Current date: ${currentDate}
Current time: ${currentTime} (24-hour)
`;
}

async function parseWithGemini(text: string): Promise<ParsedEntry> {
  const SYSTEM_PROMPT = getPrompt();

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: `${SYSTEM_PROMPT}\n\nUser input:\n${text}`,
    config: {
      temperature: 0.1,
      responseMimeType: "application/json",
    },
  });

  return JSON.parse(response.text!) as ParsedEntry;
}

export const parseRoute: Route = [
  {
    method: 'post',
    path: '/',
    handler: async (req: Request, res: Response) => {
      const { text } = req.body
      if (!text) return res.status(400).json({ error: 'text is required' })

      try {
        const parsed = await parseWithGemini(text)
        res.json(parsed)
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse', details: String(err) })
      }
    }
  },
  {
    method: 'post',
    path: '/save',
    handler: async (req: Request, res: Response) => {
      const { text } = req.body
      if (!text) return res.status(400).json({ error: 'text is required' })

      try {
        const parsed = await parseWithGemini(text)

        if (!parsed.subject || !parsed.event || !parsed.date) {
          return res.status(422).json({ error: 'Could not extract required fields', raw: parsed })
        }

        const subject = await db
          .select()
          .from(subjects)
          .where(eq(subjects.name, parsed.subject.toLowerCase()))
          .limit(1)

        if (!subject.length) {
          return res.status(422).json({ error: `Unknown subject: ${parsed.subject}` })
        }

        const inserted = await db.insert(entries).values({
          subjectId: subject[0].id,
          event: parsed.event,
          date: parsed.date,
          time: parsed.time,
          notes: parsed.notes,
          rawInput: text
        }).returning({ id: entries.id })

        const entry = await getEntryById(inserted[0].id)
        res.status(201).json(entry)
      } catch (err) {
        res.status(500).json({ error: 'Failed to parse and save', details: String(err) })
      }
    }
  }
]