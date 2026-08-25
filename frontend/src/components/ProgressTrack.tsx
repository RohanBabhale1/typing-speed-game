interface Props {
  total: number;
  current: number;
}

export function ProgressTrack({
  total,
  current,
}: Props) {
  return (
    <div
      className="progress-track"
      aria-label={`Progress ${current} / ${total}`}
    >
      {Array.from(
        { length: total },
        (_, index) => (
          <span
            key={index}
            className={`progress-dot ${
              index < current
                ? "filled"
                : ""
            }`}
          />
        )
      )}

      <span className="progress-label">
        {current} / {total}
      </span>
    </div>
  );
}