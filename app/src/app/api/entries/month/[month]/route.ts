import { routeHandler } from "@/lib/api/handler";
import { getEntriesForMonth } from "@/lib/api/entries";

export const GET = routeHandler(async (_, { params }) => getEntriesForMonth((await params).month));