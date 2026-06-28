export class ApiError extends Error {
  constructor(
    public status: number,
    message: string
  ) {
    super(message);
    this.name = "ApiError";

    console.error(`[ApiError ${status}] ${message}`, {
      stack: this.stack,
    });
  }
}