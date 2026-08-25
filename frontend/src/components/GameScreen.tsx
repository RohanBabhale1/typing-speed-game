import { useEffect } from "react";

import { useAuth } from "../context/AuthContext";
import { useTypingGame } from "../hooks/useTypingGame";

import { ProgressTrack } from "./ProgressTrack";
import { ResultModal } from "./ResultModal";

export function GameScreen() {
  const { user } = useAuth();

  const {
    sequence,
    currentIndex,
    status,
    elapsedSeconds,
    lastKeyWasWrong,
    finalTime,
    isNewBest,
    bestScore,
    liveWpm,
    hiddenInputRef,
    focusInput,
    start,
    reset,
    handleKeyPress,
  } = useTypingGame(Boolean(user));

  useEffect(() => {
    if (status === "playing") {
      focusInput();
    }
  }, [status, focusInput]);

  function onKeyDown(
    event: React.KeyboardEvent<HTMLInputElement>
  ) {
    if (event.key.length !== 1) {
      return;
    }

    event.preventDefault();

    handleKeyPress(
      event.key.toLowerCase()
    );
  }

  return (
    <div
      className="game-screen"
      onClick={focusInput}
    >
      <div className="game-stats">
        <ProgressTrack
          total={sequence.length}
          current={currentIndex}
        />

        <span className="wpm-badge">
          WPM: {liveWpm}
        </span>

        <span className="timer-badge">
          {elapsedSeconds.toFixed(1)}s
        </span>
      </div>

      <div
        className={`sequence-display ${
          lastKeyWasWrong ? "shake" : ""
        }`}
      >
        {sequence.map((char, index) => (
          <span
            key={index}
            className={
              index < currentIndex
                ? "char-done"
                : index === currentIndex
                ? "char-current"
                : "char-pending"
            }
          >
            {char}
          </span>
        ))}
      </div>

      <input
        ref={hiddenInputRef}
        className="hidden-input"
        value=""
        onChange={() => {}}
        onKeyDown={onKeyDown}
        onBlur={() => {
          if (status === "playing") {
            focusInput();
          }
        }}
        aria-label="Type the highlighted letter"
      />

      {status === "idle" && (
        <button
          className="btn-primary"
          onClick={start}
        >
          Start
        </button>
      )}

      {status === "finished" &&
        finalTime !== null && (
          <ResultModal
            finalTime={finalTime}
            isNewBest={isNewBest}
            bestScore={bestScore}
            onRestart={() => {
              reset();
              start();
            }}
          />
        )}
    </div>
  );
}