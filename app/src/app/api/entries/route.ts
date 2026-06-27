import { getEntries } from "@/lib/api/entries";
import { withApiErrors } from "@/lib/api/handler";

export async function GET() {
  return withApiErrors(() => getEntries());
}