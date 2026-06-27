import { NextRequest, NextResponse } from "next/server";

import { parseAndSave } from "@/lib/api/parse";
import { ApiError } from "@/lib/api/errors";
import { withApiErrors } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  return withApiErrors(
    () => parseAndSave(text),
    201
  );
}