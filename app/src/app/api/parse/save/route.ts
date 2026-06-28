import { parseAndSave } from "@/lib/api/parse";
import { routeHandler } from "@/lib/api/handler";

export const POST = routeHandler(async (body) => parseAndSave(body.text), { successStatus: 201, useApiKey: true })