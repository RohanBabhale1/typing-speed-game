import { authResolvers } from "./auth.resolvers";
import { gameResolvers } from "./game.resolvers";

export const resolvers = {

  Query: {
    ...authResolvers.Query,
    ...gameResolvers.Query
  },

  Mutation: {
    ...authResolvers.Mutation,
    ...gameResolvers.Mutation
  },

  GameResult:
    gameResolvers.GameResult

};