import type { GraphQLContext } from "../context";

import {
  comparePassword,
  hashPassword,
  signToken
} from "../utils/auth";

import {
  authError,
  conflictError,
  validationError
} from "../utils/errors";

import {
  formatZodError,
  loginSchema,
  registerSchema
} from "../utils/validation";

export const authResolvers = {

  Query: {

    me: async (
      _parent: unknown,
      _args: unknown,
      ctx: GraphQLContext
    ) => {

      if (!ctx.userId) {
        return null;
      }

      return ctx.prisma.user.findUnique({
        where: {
          id: ctx.userId
        }
      });
    }

  },

  Mutation: {

    register: async (
      _parent: unknown,
      args: {
        email: string;
        username: string;
        password: string;
      },
      ctx: GraphQLContext
    ) => {

      const parsed =
        registerSchema.safeParse(args);

      if (!parsed.success) {
        throw validationError(
          formatZodError(parsed.error)
        );
      }

      const {
        email,
        username,
        password
      } = parsed.data;

      const existing =
        await ctx.prisma.user.findFirst({
          where: {
            OR: [
              { email },
              { username }
            ]
          }
        });

      if (existing) {

        if (existing.email === email) {
          throw conflictError(
            "An account with this email already exists"
          );
        }

        throw conflictError(
          "This username is already taken"
        );
      }

      const hashed =
        await hashPassword(password);

      const user =
        await ctx.prisma.user.create({
          data: {
            email,
            username,
            password: hashed
          }
        });

      return {
        token: signToken({
          userId: user.id
        }),
        user
      };
    },

    login: async (
      _parent: unknown,
      args: {
        email: string;
        password: string;
      },
      ctx: GraphQLContext
    ) => {

      const parsed =
        loginSchema.safeParse(args);

      if (!parsed.success) {
        throw validationError(
          formatZodError(parsed.error)
        );
      }

      const {
        email,
        password
      } = parsed.data;

      const user =
        await ctx.prisma.user.findUnique({
          where: {
            email
          }
        });

      if (!user) {
        throw authError(
          "Invalid email or password"
        );
      }

      const valid =
        await comparePassword(
          password,
          user.password
        );

      if (!valid) {
        throw authError(
          "Invalid email or password"
        );
      }

      return {
        token: signToken({
          userId: user.id
        }),
        user
      };
    }

  }

};