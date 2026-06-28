import { deleteEntry, getEntry } from "@/lib/api/entries";
import { routeHandler } from "@/lib/api/handler";

export const GET = routeHandler(async (req, { params }) => getEntry(Number((await params).id)));
export const DELETE = routeHandler(async (request, { params }) => deleteEntry(Number((await params).id)));