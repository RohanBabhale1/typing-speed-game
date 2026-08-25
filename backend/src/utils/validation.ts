import { z } from "zod";

export const registerSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be at most 20 characters")
    .regex(
      /^[a-zA-Z0-9_]+$/,
      "Username can only contain letters, numbers and underscores"
    ),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
});

export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .toLowerCase()
    .email("Invalid email address"),

  password: z
    .string()
    .min(1, "Password is required")
});

export const saveGameResultSchema = z
  .object({
    timeTaken: z
      .number()
      .positive("timeTaken must be positive"),

    correctChars: z
      .number()
      .int()
      .min(0)
      .max(20, "A game has at most 20 characters"),

    wrongAttempts: z
      .number()
      .int()
      .min(0),

    penaltyTime: z
      .number()
      .min(0)
  })
  .refine(
    (data) =>
      Math.abs(
        data.wrongAttempts * 0.5 -
        data.penaltyTime
      ) < 0.001,
    {
      message:
        "penaltyTime must equal wrongAttempts * 0.5",
      path: ["penaltyTime"]
    }
  );

export function formatZodError(
  error: z.ZodError
): string {
  return error.errors
    .map((error) => error.message)
    .join("; ");
}