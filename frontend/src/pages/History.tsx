import { useEffect, useState } from "react";
import { gqlClient } from "../graphql/client";
import { MY_GAME_HISTORY_QUERY } from "../graphql/operations";

interface GameResult {
  id: string;
  timeTaken: number;
  correctChars: number;
  wrongAttempts: number;
  penaltyTime: number;
  createdAt: string;
}

export function History() {
  const [history, setHistory] = useState<GameResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    gqlClient
      .request<{ myGameHistory: GameResult[] }>(
        MY_GAME_HISTORY_QUERY
      )
      .then((data) => {
        setHistory(data.myGameHistory);
      })
      .catch((error: unknown) => {
        setError(
          error instanceof Error
            ? error.message
            : "Failed to load history"
        );
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p className="status-text">Loading history...</p>;
  }

  if (error) {
    return <p className="form-error">{error}</p>;
  }

  return (
    <div className="leaderboard">
      <h1>Your History</h1>

      <table>
        <thead>
          <tr>
            <th>Date</th>
            <th>Time</th>
            <th>Correct</th>
            <th>Wrong</th>
            <th>Penalty</th>
          </tr>
        </thead>

        <tbody>
          {history.map((game) => (
            <tr key={game.id}>
              <td>
                {new Date(game.createdAt).toLocaleString()}
              </td>

              <td>{game.timeTaken.toFixed(2)}s</td>

              <td>{game.correctChars}</td>

              <td>{game.wrongAttempts}</td>

              <td>{game.penaltyTime.toFixed(2)}s</td>
            </tr>
          ))}
        </tbody>
      </table>

      {history.length === 0 && (
        <p className="status-text">
          No games played yet.
        </p>
      )}
    </div>
  );
}