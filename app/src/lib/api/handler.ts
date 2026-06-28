import { NextRequest, NextResponse } from "next/server";
import { ApiError } from "./errors";
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { requireApiKey } from "../authKey";

export async function withApiErrors<T>(
  fn: () => Promise<T>,
  successStatus = 200
) {
  try {
    const result = await fn();

    return NextResponse.json(result, {
      status: successStatus,
    });
  } catch (err) {
    if (err instanceof ApiError) {
      return NextResponse.json(
        { error: err.message },
        { status: err.status }
      );
    }

    console.error(err);

    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

type Handler<T> = (
  req: NextRequest,
  ctx: any
) => Promise<T> | T

export function routeHandler<T>(handler: Handler<T>, options?: { successStatus?: number, useApiKey?: boolean }) {
  return (req: NextRequest, ctx: any) => {
    return withApiErrors(async () => {
        console.log("useApiKey =", options?.useApiKey)
        console.log("auth header =", req.headers.get("authorization"))

        if (!options?.useApiKey) {
            const session = await getServerSession(authOptions)
    
            if (!session) {
            throw new ApiError(401, "Unauthorized")
            }
        } else {
            requireApiKey(req)
        }

      return handler(req, ctx)
    }, options?.successStatus)
  }
}

