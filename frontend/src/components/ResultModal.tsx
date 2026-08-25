interface Props {
  finalTime: number;
  isNewBest: boolean;
  bestScore: number | null;
  onRestart: () => void;
}

export function ResultModal({
  finalTime,
  isNewBest,
  bestScore,
  onRestart,
}: Props) {
  return (
    <div className="result-overlay">
      <div className="result-card">
        <h2
          className={
            isNewBest
              ? "result-success"
              : "result-failure"
          }
        >
          {isNewBest
            ? "New Best!"
            : "Try Again"}
        </h2>

        <p className="result-time">
          {finalTime.toFixed(2)}s
        </p>

        {!isNewBest &&
          bestScore !== null && (
            <p className="result-best">
              Best: {bestScore.toFixed(2)}s
            </p>
          )}

        <button
          className="btn-primary"
          onClick={onRestart}
        >
          Play Again
        </button>
      </div>
    </div>
  );
}