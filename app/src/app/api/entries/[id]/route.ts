import { NextRequest, NextResponse } from "next/server";

import { deleteEntry, getEntry } from "@/lib/api/entries";
import { withApiErrors } from "@/lib/api/handler";

type Context = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(
  req: NextRequest,
  { params }: Context
) {
  const { id } = await params;

  return withApiErrors(() =>
    getEntry(Number(id))
  );
}

export async function DELETE(
  req: NextRequest,
  { params }: Context
) {
  const { id } = await params;

  return withApiErrors(() =>
    deleteEntry(Number(id))
  );
}