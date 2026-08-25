import { useEffect, useState } from "react";
import { gqlClient } from "../graphql/client";
import { LEADERBOARD_QUERY } from "../graphql/operations";

interface Entry {
  rank: number;
  username: string;
  bestTime: number;
}

export function Leaderboard() {
  const [entries, setEntries] =
    useState<Entry[]>([]);

  const [loading, setLoading] =
    useState(true);

  const [error, setError] =
    useState<string | null>(null);

    useEffect(() => {
    gqlClient
        .request<{ leaderboard: Entry[] }>(
        LEADERBOARD_QUERY,
        { limit: 20 }
        )
        .then((data) => {
        setEntries(data.leaderboard);
        })
        .catch((error: unknown) => {
        setError(
            error instanceof Error
            ? error.message
            : "Failed to load leaderboard"
        );
        })
        .finally(() => {
        setLoading(false);
        });
    }, []);

  if (loading) {
    return (
      <p className="status-text">
        Loading leaderboard...
      </p>
    );
  }

  if (error) {
    return (
      <p className="form-error">
        {error}
      </p>
    );
  }

  return (
    <div className="leaderboard">
      <h1>Leaderboard</h1>

      <table>
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Best Time</th>
          </tr>
        </thead>

        <tbody>
          {entries.map((entry) => (
            <tr key={entry.rank}>
              <td>{entry.rank}</td>

              <td>{entry.username}</td>

              <td>
                {entry.bestTime.toFixed(2)}s
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {entries.length === 0 && (
        <p className="status-text">
          No scores yet — be the first!
        </p>
      )}
    </div>
  );
}