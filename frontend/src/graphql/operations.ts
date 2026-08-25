export const REGISTER_MUTATION = `
  mutation Register($email: String!, $username: String!, $password: String!) {
    register(email: $email, username: $username, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const LOGIN_MUTATION = `
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user {
        id
        username
        email
      }
    }
  }
`;

export const ME_QUERY = `
  query Me {
    me {
      id
      username
      email
    }
  }
`;

export const SAVE_GAME_RESULT_MUTATION = `
  mutation SaveGameResult(
    $timeTaken: Float!
    $correctChars: Int!
    $wrongAttempts: Int!
    $penaltyTime: Float!
  ) {
    saveGameResult(
      timeTaken: $timeTaken
      correctChars: $correctChars
      wrongAttempts: $wrongAttempts
      penaltyTime: $penaltyTime
    ) {
      id
      timeTaken
      createdAt
    }
  }
`;

export const MY_GAME_HISTORY_QUERY = `
  query MyGameHistory {
    myGameHistory {
      id
      timeTaken
      correctChars
      wrongAttempts
      penaltyTime
      createdAt
    }
  }
`;

export const MY_BEST_SCORE_QUERY = `
  query MyBestScore {
    myBestScore {
      id
      timeTaken
      createdAt
    }
  }
`;

export const LEADERBOARD_QUERY = `
  query Leaderboard($limit: Int) {
    leaderboard(limit: $limit) {
      rank
      username
      bestTime
    }
  }
`;
