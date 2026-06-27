import { NextResponse } from "next/server";
import { withApiErrors } from "@/lib/api/handler";
import { getEntriesForMonth } from "@/lib/api/entries";

type Context = {
  params: Promise<{
    month: string;
  }>;
};

export async function GET(
  req: Request,
  { params }: Context
) {
  const { month } = await params;

  return withApiErrors(() =>
    getEntriesForMonth(month)
  );
}