import { eq } from "drizzle-orm";

import { db } from "@/lib/db";
import { entries } from "@/lib/db/schema";
import {
  getAllEntries,
  getEntriesByMonth,
  getEntryById,
} from "@/lib/db/queries";

import { ApiError } from "./errors";

export async function getEntries() {
  return getAllEntries();
}

export async function getEntry(id: number) {
  if (isNaN(id)) {
    throw new ApiError(400, "Invalid id");
  }

  const entry = await getEntryById(id);

  if (!entry) {
    throw new ApiError(404, "Entry not found");
  }

  return entry;
}

export async function getEntriesForMonth(month: string) {
  if (!month) {
    throw new ApiError(400, "Month is required");
  }

  return getEntriesByMonth(month);
}

export async function deleteEntry(id: number) {
  if (isNaN(id)) {
    throw new ApiError(400, "Invalid id");
  }

  await db.delete(entries).where(eq(entries.id, id));

  return {
    message: "Entry deleted",
  };
}