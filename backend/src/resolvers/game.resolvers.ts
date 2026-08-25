import type { GraphQLContext } from "../context";

import { authError, validationError } from "../utils/errors";

import {
  formatZodError,
  saveGameResultSchema,
} from "../utils/validation";

export const gameResolvers = {
  Query: {
    myGameHistory: async (
      _parent: unknown,
      _args: unknown,
      ctx: GraphQLContext,
    ) => {
      if (!ctx.userId) {
        throw authError();
      }

      const games = await ctx.prisma.gameResult.findMany({
        where: {
          userId: ctx.userId,
        },
        orderBy: {
          createdAt: "desc",
        },
      });

      return games.map((game) => ({
        ...game,
        createdAt: game.createdAt.toISOString(),
      }));
    },

    myBestScore: async (
      _parent: unknown,
      _args: unknown,
      ctx: GraphQLContext,
    ) => {
      if (!ctx.userId) {
        throw authError();
      }

      const game = await ctx.prisma.gameResult.findFirst({
        where: {
          userId: ctx.userId,
        },
        orderBy: {
          timeTaken: "asc",
        },
      });

      if (!game) {
        return null;
      }

      return {
        ...game,
        createdAt: game.createdAt.toISOString(),
      };
    },

    leaderboard: async (
      _parent: unknown,
      args: {
        limit?: number | null;
      },
      ctx: GraphQLContext,
    ) => {
      const limit = Math.min(
        Math.max(args.limit ?? 10, 1),
        100,
      );

      const best = await ctx.prisma.gameResult.groupBy({
        by: ["userId"],
        _min: {
          timeTaken: true,
        },
      });

      const sorted = best
        .filter(
          (entry) => entry._min.timeTaken !== null,
        )
        .sort(
          (a, b) =>
            (a._min.timeTaken as number) -
            (b._min.timeTaken as number),
        )
        .slice(0, limit);

      const users = await ctx.prisma.user.findMany({
        where: {
          id: {
            in: sorted.map(
              (entry) => entry.userId,
            ),
          },
        },
      });

      const usernameById = new Map(
        users.map((user) => [
          user.id,
          user.username,
        ]),
      );

      return sorted.map((entry, index) => ({
        rank: index + 1,
        username:
          usernameById.get(entry.userId) ??
          "unknown",
        bestTime:
          entry._min.timeTaken as number,
      }));
    },
  },

  Mutation: {
    saveGameResult: async (
      _parent: unknown,
      args: {
        timeTaken: number;
        correctChars: number;
        wrongAttempts: number;
        penaltyTime: number;
      },
      ctx: GraphQLContext,
    ) => {
      if (!ctx.userId) {
        throw authError();
      }

      const parsed =
        saveGameResultSchema.safeParse(args);

      if (!parsed.success) {
        throw validationError(
          formatZodError(parsed.error),
        );
      }

      const game =
        await ctx.prisma.gameResult.create({
          data: {
            ...parsed.data,
            userId: ctx.userId,
          },
        });

      return {
        ...game,
        createdAt:
          game.createdAt.toISOString(),
      };
    },
  },

  GameResult: {
    user: async (
      parent: { userId: string },
      _args: unknown,
      ctx: GraphQLContext,
    ) => {
      return ctx.prisma.user.findUnique({
        where: {
          id: parent.userId,
        },
      });
    },
  },
};