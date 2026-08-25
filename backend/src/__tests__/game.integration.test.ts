/**
 * Integration tests — run against a REAL PostgreSQL instance (the `db` service
 * in docker-compose.yml), not mocks. Run with:
 *
 *   docker compose run --rm backend bun test
 */

import { afterAll, beforeAll, beforeEach, describe, expect, test } from "bun:test";
import { createSchema, createYoga } from "graphql-yoga";
import { PrismaClient } from "@prisma/client";

import { typeDefs } from "../schema/typeDefs";
import { resolvers } from "../resolvers";
import { verifyToken } from "../utils/auth";

const prisma = new PrismaClient();

const schema = createSchema({ typeDefs, resolvers });

const yoga = createYoga({
  schema,
  context: async ({ request }) => {
    const authHeader = request.headers.get("authorization") ?? "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
    const payload = token ? verifyToken(token) : null;
    return { prisma, userId: payload?.userId ?? null };
  },
});

async function gqlRequest(
  query: string,
  variables?: Record<string, unknown>,
  token?: string
) {
  const headers: Record<string, string> = {
    "content-type": "application/json",
  };

  if (token) {
    headers.authorization = `Bearer ${token}`;
  }

  const response = await yoga.fetch("http://localhost/graphql", {
    method: "POST",
    headers,
    body: JSON.stringify({ query, variables }),
  });

  return response.json();
}

beforeAll(async () => {
  // Sanity check: fail fast with a clear message if Postgres isn't reachable,
  // instead of every test timing out individually.
  await prisma.$connect();
});

afterAll(async () => {
  await prisma.$disconnect();
});

beforeEach(async () => {
  // Clean slate before every test — order matters because of the FK.
  await prisma.gameResult.deleteMany();
  await prisma.user.deleteMany();
});

describe("register", () => {
  test("creates a user and returns a token", async () => {
    const result = await gqlRequest(
      `mutation Register($email: String!, $username: String!, $password: String!) {
        register(email: $email, username: $username, password: $password) {
          token
          user { id username email }
        }
      }`,
      { email: "alice@example.com", username: "alice", password: "password123" }
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.register.token).toBeTruthy();
    expect(result.data.register.user.username).toBe("alice");

    const stored = await prisma.user.findUnique({
      where: { email: "alice@example.com" },
    });
    expect(stored).not.toBeNull();
    // Password must never be stored in plaintext.
    expect(stored?.password).not.toBe("password123");
  });

  test("rejects a duplicate email with a CONFLICT error", async () => {
    await prisma.user.create({
      data: { email: "bob@example.com", username: "bob", password: "hashed" },
    });

    const result = await gqlRequest(
      `mutation Register($email: String!, $username: String!, $password: String!) {
        register(email: $email, username: $username, password: $password) {
          token
        }
      }`,
      { email: "bob@example.com", username: "bobby", password: "password123" }
    );

    expect(result.errors).toBeDefined();
    expect(result.errors[0].extensions.code).toBe("CONFLICT");
  });

  test("rejects an invalid email with BAD_USER_INPUT", async () => {
    const result = await gqlRequest(
      `mutation Register($email: String!, $username: String!, $password: String!) {
        register(email: $email, username: $username, password: $password) {
          token
        }
      }`,
      { email: "not-an-email", username: "carol", password: "password123" }
    );

    expect(result.errors).toBeDefined();
    expect(result.errors[0].extensions.code).toBe("BAD_USER_INPUT");
  });
});

describe("login", () => {
  test("rejects wrong password with UNAUTHENTICATED", async () => {
    await gqlRequest(
      `mutation Register($email: String!, $username: String!, $password: String!) {
        register(email: $email, username: $username, password: $password) { token }
      }`,
      { email: "dave@example.com", username: "dave", password: "correcthorse" }
    );

    const result = await gqlRequest(
      `mutation Login($email: String!, $password: String!) {
        login(email: $email, password: $password) { token }
      }`,
      { email: "dave@example.com", password: "wrongpassword" }
    );

    expect(result.errors).toBeDefined();
    expect(result.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });
});

describe("saveGameResult", () => {
  async function registerAndGetToken(username: string) {
    const result = await gqlRequest(
      `mutation Register($email: String!, $username: String!, $password: String!) {
        register(email: $email, username: $username, password: $password) { token }
      }`,
      { email: `${username}@example.com`, username, password: "password123" }
    );
    return result.data.register.token as string;
  }

  test("rejects unauthenticated calls", async () => {
    const result = await gqlRequest(
      `mutation Save($timeTaken: Float!, $correctChars: Int!, $wrongAttempts: Int!, $penaltyTime: Float!) {
        saveGameResult(timeTaken: $timeTaken, correctChars: $correctChars, wrongAttempts: $wrongAttempts, penaltyTime: $penaltyTime) {
          id
        }
      }`,
      { timeTaken: 10, correctChars: 20, wrongAttempts: 0, penaltyTime: 0 }
    );

    expect(result.errors).toBeDefined();
    expect(result.errors[0].extensions.code).toBe("UNAUTHENTICATED");
  });

  test("rejects a tampered penaltyTime that doesn't match wrongAttempts * 0.5", async () => {
    const token = await registerAndGetToken("eve");

    const result = await gqlRequest(
      `mutation Save($timeTaken: Float!, $correctChars: Int!, $wrongAttempts: Int!, $penaltyTime: Float!) {
        saveGameResult(timeTaken: $timeTaken, correctChars: $correctChars, wrongAttempts: $wrongAttempts, penaltyTime: $penaltyTime) {
          id
        }
      }`,
      { timeTaken: 5, correctChars: 20, wrongAttempts: 4, penaltyTime: 0 }, // should be 2.0
      token
    );

    expect(result.errors).toBeDefined();
    expect(result.errors[0].extensions.code).toBe("BAD_USER_INPUT");

    const count = await prisma.gameResult.count();
    expect(count).toBe(0);
  });

  test("persists a valid result for the authenticated user", async () => {
    const token = await registerAndGetToken("frank");

    const result = await gqlRequest(
      `mutation Save($timeTaken: Float!, $correctChars: Int!, $wrongAttempts: Int!, $penaltyTime: Float!) {
        saveGameResult(timeTaken: $timeTaken, correctChars: $correctChars, wrongAttempts: $wrongAttempts, penaltyTime: $penaltyTime) {
          id
          timeTaken
        }
      }`,
      { timeTaken: 8.5, correctChars: 20, wrongAttempts: 1, penaltyTime: 0.5 },
      token
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.saveGameResult.timeTaken).toBe(8.5);

    const count = await prisma.gameResult.count();
    expect(count).toBe(1);
  });
});

describe("leaderboard", () => {
  test("ranks by each user's best time only, ascending", async () => {
    const userA = await prisma.user.create({
      data: { email: "a@example.com", username: "playerA", password: "hashed" },
    });
    const userB = await prisma.user.create({
      data: { email: "b@example.com", username: "playerB", password: "hashed" },
    });

    // playerA has two attempts — only the best (5.0) should count.
    await prisma.gameResult.createMany({
      data: [
        { userId: userA.id, timeTaken: 9.0, correctChars: 20, wrongAttempts: 0, penaltyTime: 0 },
        { userId: userA.id, timeTaken: 5.0, correctChars: 20, wrongAttempts: 0, penaltyTime: 0 },
        { userId: userB.id, timeTaken: 6.0, correctChars: 20, wrongAttempts: 0, penaltyTime: 0 },
      ],
    });

    const result = await gqlRequest(
      `query Leaderboard($limit: Int) {
        leaderboard(limit: $limit) { rank username bestTime }
      }`,
      { limit: 10 }
    );

    expect(result.errors).toBeUndefined();
    expect(result.data.leaderboard).toEqual([
      { rank: 1, username: "playerA", bestTime: 5.0 },
      { rank: 2, username: "playerB", bestTime: 6.0 },
    ]);
  });
});