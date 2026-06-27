import { NextRequest } from "next/server";

import { parse } from "@/lib/api/parse";
import { withApiErrors } from "@/lib/api/handler";

export async function POST(req: NextRequest) {
  const { text } = await req.json();

  return withApiErrors(() =>
    parse(text)
  );
}