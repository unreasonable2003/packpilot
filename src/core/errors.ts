export class PackPilotError extends Error {
  readonly code: string;
  readonly cause?: unknown;

  constructor(code: string, message: string, cause?: unknown) {
    super(message);
    this.name = "PackPilotError";
    this.code = code;
    this.cause = cause;
  }
}

export function toErrorMessage(error: unknown, fallback = "Unexpected error."): string {
  if (error instanceof PackPilotError) {
    return error.message;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return fallback;
}
