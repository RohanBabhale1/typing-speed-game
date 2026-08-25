import { ClientError } from "graphql-request";

export function getErrorMessage(
  error: unknown,
  fallback: string
): string {
  if (error instanceof ClientError) {
    return (
      error.response.errors?.[0]?.message ?? fallback
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return fallback;
}