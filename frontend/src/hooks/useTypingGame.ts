import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { gqlClient } from "../graphql/client";
import {
  SAVE_GAME_RESULT_MUTATION,
} from "../graphql/operations";

const SEQUENCE_LENGTH = 20;
const PENALTY_SECONDS = 0.5;

const LETTERS = "abcdefghijklmnopqrstuvwxyz";

const BEST_SCORE_KEY = "typing-game:best-score";

export type GameStatus =
  | "idle"
  | "playing"
  | "finished";

function generateSequence(length: number) {
  return Array.from(
    { length },
    () =>
      LETTERS[
        Math.floor(Math.random() * LETTERS.length)
      ]
  );
}

export function useTypingGame(
  isLoggedIn: boolean
) {
  const [sequence, setSequence] = useState<string[]>(
    () => generateSequence(SEQUENCE_LENGTH)
  );

  const [currentIndex, setCurrentIndex] = useState(0);

  const [status, setStatus] =
    useState<GameStatus>("idle");

  const [elapsedMs, setElapsedMs] = useState(0);

  const [wrongAttempts, setWrongAttempts] =
    useState(0);

  const [lastKeyWasWrong, setLastKeyWasWrong] =
    useState(false);

  const [finalTime, setFinalTime] =
    useState<number | null>(null);

  const [isNewBest, setIsNewBest] =
    useState(false);

  const [bestScore, setBestScore] =
    useState<number | null>(() => {
      const value =
        localStorage.getItem(BEST_SCORE_KEY);

      return value ? Number(value) : null;
    });

  const startedAtRef =
    useRef<number | null>(null);

  const intervalRef =
    useRef<ReturnType<typeof setInterval> | null>(
      null
    );

  const hiddenInputRef =
    useRef<HTMLInputElement>(null);

  const focusInput = useCallback(() => {
    hiddenInputRef.current?.focus();
  }, []);

  const start = useCallback(() => {
    setSequence(
      generateSequence(SEQUENCE_LENGTH)
    );

    setCurrentIndex(0);
    setWrongAttempts(0);
    setElapsedMs(0);
    setFinalTime(null);
    setIsNewBest(false);
    setLastKeyWasWrong(false);

    setStatus("playing");

    startedAtRef.current = Date.now();

    setTimeout(focusInput, 0);
  }, [focusInput]);

  useEffect(() => {
    if (status !== "playing") {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }

      return;
    }

    intervalRef.current = setInterval(() => {
      if (startedAtRef.current) {
        setElapsedMs(
          Date.now() - startedAtRef.current
        );
      }
    }, 50);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [status]);

  const finish = useCallback(
    async (totalWrong: number) => {
      const rawSeconds =
        startedAtRef.current
          ? (Date.now() -
              startedAtRef.current) /
            1000
          : 0;

      const penaltyTime =
        totalWrong * PENALTY_SECONDS;

      const totalTime = Number(
        (rawSeconds + penaltyTime).toFixed(2)
      );

      setFinalTime(totalTime);
      setStatus("finished");

      const beatBest =
        bestScore === null ||
        totalTime < bestScore;

      setIsNewBest(beatBest);

      if (beatBest) {
        localStorage.setItem(
          BEST_SCORE_KEY,
          String(totalTime)
        );

        setBestScore(totalTime);
      }

      if (isLoggedIn) {
        try {
          await gqlClient.request(
            SAVE_GAME_RESULT_MUTATION,
            {
              timeTaken: totalTime,
              correctChars: SEQUENCE_LENGTH,
              wrongAttempts: totalWrong,
              penaltyTime,
            }
          );
        } catch (error) {
          console.error(
            "Failed to save game result:",
            error
          );
        }
      }
    },
    [bestScore, isLoggedIn]
  );

  const handleKeyPress = useCallback(
    (key: string) => {
      if (status !== "playing") {
        return;
      }

      const expected =
        sequence[currentIndex];

      if (key === expected) {
        setLastKeyWasWrong(false);

        const nextIndex =
          currentIndex + 1;

        if (
          nextIndex >= SEQUENCE_LENGTH
        ) {
          setCurrentIndex(nextIndex);

          void finish(wrongAttempts);
        } else {
          setCurrentIndex(nextIndex);
        }
      } else {
        setLastKeyWasWrong(true);

        setWrongAttempts(
          (value) => value + 1
        );
      }
    },
    [
      status,
      sequence,
      currentIndex,
      wrongAttempts,
      finish,
    ]
  );

  const reset = useCallback(() => {
    setStatus("idle");
    setCurrentIndex(0);
    setWrongAttempts(0);
    setElapsedMs(0);
    setFinalTime(null);
    setLastKeyWasWrong(false);
  }, []);

  const liveWpm =
    elapsedMs > 0
      ? Math.round(
          (currentIndex / 5) /
            (elapsedMs / 1000 / 60)
        )
      : 0;

  return {
    sequence,
    currentIndex,
    status,
    elapsedSeconds: elapsedMs / 1000,
    wrongAttempts,
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
  };
}