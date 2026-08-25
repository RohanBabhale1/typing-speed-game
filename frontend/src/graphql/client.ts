import { GraphQLClient } from "graphql-request";

const endpoint =
  import.meta.env.VITE_GRAPHQL_URL ??
  `http://${window.location.hostname}:4000/graphql`;

export const gqlClient = new GraphQLClient(endpoint);

export function setAuthToken(token: string | null) {
  if (token) {
    gqlClient.setHeader("authorization", `Bearer ${token}`);
  } else {
    gqlClient.setHeaders({});
  }
}

// Restore token immediately when the application starts
const storedToken = localStorage.getItem("typing-game:token");

if (storedToken) {
  setAuthToken(storedToken);
}
