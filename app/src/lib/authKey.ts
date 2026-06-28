import { NextRequest } from "next/server"
import { ApiError } from "@/lib/api/errors"

export function requireApiKey(req: NextRequest) {
  const auth = req.headers.get("authorization")

  if (!auth) {
    throw new ApiError(401, "Missing Authorization header")
  }

  const [type, key] = auth.split(" ")

  if (type !== "Bearer" || !key) {
    throw new ApiError(401, "Invalid Authorization format")
  }

  if (key !== process.env.PARSE_API_KEY) {
    throw new ApiError(403, "Invalid API key")
  }

  return true
}