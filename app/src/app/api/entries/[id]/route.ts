import { deleteEntry, getEntry } from "@/lib/api/entries";
import { routeHandler } from "@/lib/api/handler";

export const GET = routeHandler(async (_, { params }) => getEntry(Number((await params).id)));
export const DELETE = routeHandler(async (_, { params }) => deleteEntry(Number((await params).id)));