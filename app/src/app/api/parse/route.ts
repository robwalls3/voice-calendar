
import { parse } from "@/lib/api/parse";
import { routeHandler } from "@/lib/api/handler";

export const POST = routeHandler(async (body) => parse(body.text));