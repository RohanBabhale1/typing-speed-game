import { GraphQLError } from "graphql";

export function authError(
  message = "You must be logged in to do this"
) {
  return new GraphQLError(message, {
    extensions: {
      code: "UNAUTHENTICATED",
      http: {
        status: 401
      }
    }
  });
}

export function validationError(
  message: string
) {
  return new GraphQLError(message, {
    extensions: {
      code: "BAD_USER_INPUT",
      http: {
        status: 400
      }
    }
  });
}

export function conflictError(
  message: string
) {
  return new GraphQLError(message, {
    extensions: {
      code: "CONFLICT",
      http: {
        status: 409
      }
    }
  });
}