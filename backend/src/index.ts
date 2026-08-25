import { createSchema, createYoga } from "graphql-yoga";
import { createContext } from "./context";
import { typeDefs } from "./schema/typeDefs";
import { resolvers } from "./resolvers";

const schema = createSchema({
  typeDefs,
  resolvers,
});

const allowedOrigins = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((origin) => origin.trim());

const yoga = createYoga({
  schema,
  context: createContext,
  graphqlEndpoint: "/graphql",
  cors: {
    origin: (process.env.FRONTEND_URL ?? "http://localhost:5173")
      .split(",")
      .map((url) => url.trim()),
    credentials: true,
  },
});

const port = Number(process.env.PORT) || 4000;

Bun.serve({
  fetch: yoga.fetch,
  port,
});

console.log(`🚀 GraphQL server ready at http://localhost:${port}/graphql`);