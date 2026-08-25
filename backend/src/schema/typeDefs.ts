export const typeDefs = /* GraphQL */ `

  type User {
    id: ID!
    email: String!
    username: String!
    createdAt: String!
  }

  type GameResult {
    id: ID!
    timeTaken: Float!
    correctChars: Int!
    wrongAttempts: Int!
    penaltyTime: Float!
    createdAt: String!
    user: User!
  }

  type AuthPayload {
    token: String!
    user: User!
  }

  type LeaderboardEntry {
    rank: Int!
    username: String!
    bestTime: Float!
  }

  type Query {
    me: User
    myGameHistory: [GameResult!]!
    myBestScore: GameResult
    leaderboard(limit: Int): [LeaderboardEntry!]!
  }

  type Mutation {
    register(
      email: String!
      username: String!
      password: String!
    ): AuthPayload!

    login(
      email: String!
      password: String!
    ): AuthPayload!

    saveGameResult(
      timeTaken: Float!
      correctChars: Int!
      wrongAttempts: Int!
      penaltyTime: Float!
    ): GameResult!
  }

`;