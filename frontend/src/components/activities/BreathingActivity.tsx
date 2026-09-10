import { useEffect, useState } from 'react';

interface BreathingActivityProps {
  targetMinutes: number;
  onComplete: () => void;
}

const PHASES = [
  { name: 'Breathe In', duration: 4 },
  { name: 'Hold', duration: 4 },
  { name: 'Breathe Out', duration: 6 },
];

export function BreathingActivity({
  targetMinutes,
  onComplete,
}: BreathingActivityProps) {
  const totalSeconds = targetMinutes * 60;

  const [remaining, setRemaining] =
    useState(totalSeconds);

  const [running, setRunning] = useState(false);

  const [phaseIndex, setPhaseIndex] = useState(0);

  const [phaseRemaining, setPhaseRemaining] =
    useState(PHASES[0].duration);

  useEffect(() => {
    if (!running || remaining <= 0) {
      return;
    }

    const interval = window.setInterval(() => {
      setRemaining((current) =>
        Math.max(current - 1, 0)
      );

      setPhaseRemaining((current) => {
        if (current <= 1) {
          setPhaseIndex((index) => {
            const next =
              (index + 1) % PHASES.length;

            setPhaseRemaining(
              PHASES[next].duration
            );

            return next;
          });

          return PHASES[phaseIndex].duration;
        }

        return current - 1;
      });
    }, 1000);

    return () => window.clearInterval(interval);
  }, [running, remaining, phaseIndex]);

  useEffect(() => {
    if (remaining === 0) {
      setRunning(false);
    }
  }, [remaining]);

  const phase = PHASES[phaseIndex];

  const progress =
    totalSeconds > 0
      ? ((totalSeconds - remaining) /
          totalSeconds) *
        100
      : 0;

  function formatTime(seconds: number) {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;

    return `${String(minutes).padStart(2, '0')}:${String(
      secs
    ).padStart(2, '0')}`;
  }

  return (
    <div className="text-center">

      <p className="text-sm font-bold text-accent uppercase tracking-wider">
        Guided Breathing
      </p>

      <h2 className="text-2xl font-black mt-2">
        {remaining === 0
          ? 'Session Complete'
          : phase.name}
      </h2>

      <p className="text-muted mt-2">
        Follow the breathing rhythm at a comfortable pace.
      </p>

      <div className="flex justify-center my-10">
        <div
          className="flex items-center justify-center rounded-full"
          style={{
            width:
              phase.name === 'Breathe In'
                ? '220px'
                : phase.name === 'Hold'
                ? '190px'
                : '150px',
            height:
              phase.name === 'Breathe In'
                ? '220px'
                : phase.name === 'Hold'
                ? '190px'
                : '150px',
            background:
              'var(--neo-bg)',
            boxShadow:
              'var(--shadow-out-lg)',
            transition:
              'width 4s ease, height 4s ease',
          }}
        >
          <div>
            <div className="text-4xl font-black text-accent">
              {phaseRemaining}
            </div>

            <div className="text-sm text-muted mt-1">
              seconds
            </div>
          </div>
        </div>
      </div>

      <div className="neo-inset-sm max-w-md mx-auto">
        <div className="flex justify-between text-sm">
          <span className="text-muted">
            Session progress
          </span>

          <strong>
            {formatTime(remaining)}
          </strong>
        </div>

        <div className="neo-loading-bar mt-4">
          <div
            className="neo-loading-bar-fill"
            style={{
              width: `${progress}%`,
            }}
          />
        </div>
      </div>

      <div className="flex justify-center gap-4 mt-7">

        {remaining > 0 && (
          <button
            type="button"
            className="neo-btn neo-btn-primary"
            onClick={() =>
              setRunning((value) => !value)
            }
          >
            {running ? '⏸ Pause' : '▶ Start'}
          </button>
        )}

        {remaining === 0 && (
          <button
            type="button"
            className="neo-btn neo-btn-primary"
            onClick={onComplete}
          >
            ✓ Complete Activity
          </button>
        )}

      </div>

    </div>
  );
}