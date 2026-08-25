import { PrismaClient } from "@prisma/client";
import type { YogaInitialContext } from "graphql-yoga";
import { verifyToken } from "./utils/auth";

export const prisma = new PrismaClient();

export interface GraphQLContext extends YogaInitialContext {
  prisma: PrismaClient;
  userId: string | null;
}

export async function createContext(
  initialContext: YogaInitialContext
): Promise<GraphQLContext> {
  const authHeader =
    initialContext.request.headers.get("authorization") ?? "";

  const token = authHeader.startsWith("Bearer ")
    ? authHeader.slice(7)
    : null;

  const payload = token ? verifyToken(token) : null;

  return {
    ...initialContext,
    prisma,
    userId: payload?.userId ?? null,
  };
}