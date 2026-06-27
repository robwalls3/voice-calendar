import { NextResponse } from "next/server";
import { ApiError } from "./errors";

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