import { parseAndSave } from "@/lib/api/parse";
import { routeHandler } from "@/lib/api/handler";

export const POST = routeHandler(async (req) => parseAndSave((await req.json()).text), { successStatus: 201, useApiKey: true })