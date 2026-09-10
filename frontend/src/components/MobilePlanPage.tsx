import { useEffect, useState } from 'react';
import { BreathingActivity } from '@/components/activities/BreathingActivity';
import {
  addTaskToCalendar,
  addAllTasksToCalendar,
} from '@/lib/calendar';
import type { PlanTask } from '@/types';

const API_URL =
  import.meta.env.VITE_API_URL ||
  'http://127.0.0.1:8000';

interface MobilePlanPageProps {
  planToken: string;
}

/*
 * Animated visual for each activity type.
 * These are lightweight CSS animations so the mobile page
 * does not need another animation library.
 */
function ActivityVisual({
  activityType,
}: {
  activityType: string;
}) {
  switch (activityType) {
    case 'movement':
      return (
        <div className="flex justify-center py-4">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping" />
            <div className="relative text-6xl animate-bounce">
              🏃
            </div>
          </div>
        </div>
      );

    case 'screen_break':
      return (
        <div className="flex justify-center py-4">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full border-2 border-primary/20 animate-pulse" />

            <div className="relative flex flex-col items-center">
              <div className="text-5xl transition-transform duration-700 animate-pulse">
                📱
              </div>

              <div className="mt-2 text-xl">
                👀
              </div>
            </div>
          </div>
        </div>
      );

    case 'wind_down':
      return (
        <div className="flex justify-center py-4">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <div className="absolute inset-2 rounded-full bg-primary/5 animate-pulse" />
            <div className="relative text-6xl animate-pulse">
              🌙
            </div>
          </div>
        </div>
      );

    case 'focus':
      return (
        <div className="flex justify-center py-4">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full border-2 border-primary/20 animate-pulse" />

            <div className="relative text-6xl">
              <span className="inline-block animate-pulse">
                🎯
              </span>
            </div>
          </div>
        </div>
      );

    case 'hydration':
      return (
        <div className="flex justify-center py-4">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-primary/5 animate-pulse" />

            <div className="relative text-6xl animate-bounce">
              💧
            </div>
          </div>
        </div>
      );

    case 'social':
      return (
        <div className="flex justify-center py-4">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <div className="absolute text-2xl left-2 top-3 animate-pulse">
              ❤️
            </div>

            <div className="absolute text-2xl right-2 bottom-3 animate-pulse">
              💬
            </div>

            <div className="relative text-6xl animate-bounce">
              🧑‍🤝‍🧑
            </div>
          </div>
        </div>
      );

    case 'breathing':
      return (
        <div className="flex justify-center py-4">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <div className="absolute h-24 w-24 rounded-full bg-primary/10 animate-ping" />
            <div className="absolute h-20 w-20 rounded-full bg-primary/10 animate-pulse" />

            <div className="relative text-5xl">
              🌿
            </div>
          </div>
        </div>
      );

    default:
      return (
        <div className="flex justify-center py-4">
          <div className="relative h-28 w-28 flex items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/10 animate-pulse" />

            <div className="relative text-6xl animate-bounce">
              ✨
            </div>
          </div>
        </div>
      );
  }
}

export function MobilePlanPage({
  planToken,
}: MobilePlanPageProps) {
  const [tasks, setTasks] = useState<PlanTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [activeTask, setActiveTask] =
    useState<PlanTask | null>(null);

  const [secondsRemaining, setSecondsRemaining] =
    useState(0);

  const [isRunning, setIsRunning] =
    useState(false);

  const [completing, setCompleting] =
    useState(false);

  /*
   * Load plan from QR token.
   */
  useEffect(() => {
    async function loadPlan() {
      if (!planToken) {
        setError('Invalid plan link.');
        setLoading(false);
        return;
      }

      try {
        const response = await fetch(
          `${API_URL}/plan/qr/${planToken}`
        );

        if (!response.ok) {
          let message = 'Unable to load this plan.';

          try {
            const data = await response.json();
            message = data.detail || message;
          } catch {}

          throw new Error(message);
        }

        const data = await response.json();

        setTasks(data.tasks || []);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load this plan.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadPlan();
  }, [planToken]);

  /*
   * Generic activity timer.
   */
  useEffect(() => {
    if (
      !isRunning ||
      secondsRemaining <= 0 ||
      activeTask?.activity_type === 'breathing'
    ) {
      return;
    }

    const timer = window.setInterval(() => {
      setSecondsRemaining((seconds) => {
        if (seconds <= 1) {
          setIsRunning(false);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => {
      window.clearInterval(timer);
    };
  }, [
    isRunning,
    secondsRemaining,
    activeTask?.activity_type,
  ]);

  function startTask(task: PlanTask) {
    setError('');
    setActiveTask(task);

    /*
     * Most tasks use minutes as their target.
     * Hydration/social tasks may have a target of 1
     * but are still kept compatible with the existing timer.
     */
    setSecondsRemaining(
      Math.max(1, Number(task.target) || 1) * 60
    );

    setIsRunning(false);
  }

  function backToPlan() {
    setActiveTask(null);
    setIsRunning(false);
    setSecondsRemaining(0);
    setError('');
  }

  async function completeActivity() {
    if (!activeTask) {
      return;
    }

    try {
      setCompleting(true);
      setError('');

      const response = await fetch(
        `${API_URL}/plan/qr/${planToken}/task/${activeTask.id}/complete`,
        {
          method: 'POST',
        }
      );

      if (!response.ok) {
        let message =
          'Unable to complete this activity.';

        try {
          const data = await response.json();
          message = data.detail || message;
        } catch {}

        throw new Error(message);
      }

      /*
       * Update the checklist immediately.
       */
      setTasks((currentTasks) =>
        currentTasks.map((task) =>
          task.id === activeTask.id
            ? {
                ...task,
                status: 'completed',
              }
            : task
        )
      );

      setActiveTask(null);
      setIsRunning(false);
      setSecondsRemaining(0);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete this activity.'
      );
    } finally {
      setCompleting(false);
    }
  }

  function formatTime(totalSeconds: number) {
    const minutes = Math.floor(
      totalSeconds / 60
    );

    const seconds = totalSeconds % 60;

    return `${String(minutes).padStart(
      2,
      '0'
    )}:${String(seconds).padStart(2, '0')}`;
  }

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{
          backgroundColor: 'var(--neo-bg)',
        }}
      >
        <div className="text-center">
          <div className="text-5xl mb-5 animate-pulse">
            🌱
          </div>

          <p className="text-lg font-semibold">
            Loading your plan...
          </p>

          <p className="text-sm text-muted mt-2">
            Preparing your personalized activities.
          </p>
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error && !activeTask) {
    return (
      <div
        className="min-h-screen flex items-center justify-center px-6"
        style={{
          backgroundColor: 'var(--neo-bg)',
        }}
      >
        <div className="text-center max-w-md">
          <div className="text-5xl mb-5">
            ⚠️
          </div>

          <h1 className="text-2xl font-bold mb-3">
            Plan unavailable
          </h1>

          <p className="text-muted">
            {error}
          </p>
        </div>
      </div>
    );
  }

  /*
   * ACTIVITY SCREEN
   */
  if (activeTask) {
    const totalSeconds =
      Math.max(1, Number(activeTask.target) || 1) *
      60;

    const progress =
      totalSeconds > 0
        ? ((totalSeconds -
            secondsRemaining) /
            totalSeconds) *
          100
        : 0;

    /*
     * Breathing activity gets the dedicated
     * animated breathing component.
     */
    if (
      activeTask.activity_type ===
      'breathing'
    ) {
      return (
        <div
          className="min-h-screen px-4 py-8 sm:px-6"
          style={{
            backgroundColor:
              'var(--neo-bg)',
          }}
        >
          <div className="mx-auto max-w-xl">
            <button
              type="button"
              className="neo-btn mb-6"
              onClick={backToPlan}
            >
              ← Back to Plan
            </button>

            <div className="neo-card p-5 sm:p-8">
              <div className="text-center">
                <p className="text-sm font-bold text-accent uppercase tracking-wider">
                  MindPulse Activity
                </p>

                <h1 className="text-3xl font-black mt-3">
                  {activeTask.title}
                </h1>

                <p className="text-muted mt-3">
                  {activeTask.description}
                </p>
              </div>

              <div className="mt-8">
                <BreathingActivity
                  targetMinutes={
                    activeTask.target
                  }
                  onComplete={
                    completeActivity
                  }
                />
              </div>

              {error && (
                <p className="text-error mt-5 text-center">
                  {error}
                </p>
              )}
            </div>
          </div>
        </div>
      );
    }

    /*
     * Generic animated activity screen.
     */
    return (
      <div
        className="min-h-screen px-4 py-8 sm:px-6"
        style={{
          backgroundColor:
            'var(--neo-bg)',
        }}
      >
        <div className="mx-auto max-w-xl">
          <button
            type="button"
            className="neo-btn mb-6"
            onClick={backToPlan}
          >
            ← Back to Plan
          </button>

          <div className="neo-card p-5 sm:p-8 text-center">
            <p className="text-sm font-bold text-accent uppercase tracking-wider">
              MindPulse Activity
            </p>

            <h1 className="text-3xl font-black mt-3">
              {activeTask.title}
            </h1>

            <p className="text-muted mt-3 leading-relaxed">
              {activeTask.description}
            </p>

            <ActivityVisual
              activityType={
                activeTask.activity_type
              }
            />

            <div className="neo-inset mt-5 p-8">
              <div
                className={`neo-score-value text-accent transition-transform duration-500 ${
                  isRunning
                    ? 'scale-105'
                    : ''
                }`}
              >
                {formatTime(
                  secondsRemaining
                )}
              </div>

              <p className="text-muted mt-3">
                {secondsRemaining === 0
                  ? 'Time complete'
                  : isRunning
                  ? 'Activity in progress'
                  : 'Ready when you are'}
              </p>

              <div className="neo-loading-bar mt-6 overflow-hidden">
                <div
                  className="neo-loading-bar-fill transition-all duration-1000"
                  style={{
                    width: `${progress}%`,
                  }}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {!isRunning &&
                secondsRemaining > 0 && (
                  <button
                    type="button"
                    className="neo-btn neo-btn-primary"
                    onClick={() =>
                      setIsRunning(true)
                    }
                  >
                    {secondsRemaining <
                    totalSeconds
                      ? '▶ Resume'
                      : '▶ Start'}
                  </button>
                )}

              {isRunning && (
                <button
                  type="button"
                  className="neo-btn"
                  onClick={() =>
                    setIsRunning(false)
                  }
                >
                  ⏸ Pause
                </button>
              )}

              <button
                type="button"
                className="neo-btn"
                disabled={completing}
                onClick={
                  completeActivity
                }
              >
                {completing
                  ? 'Saving...'
                  : '✓ Finish Activity'}
              </button>
            </div>

            {error && (
              <p className="text-error mt-5">
                {error}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  /*
   * PLAN SCREEN
   */
  const completedCount =
    tasks.filter(
      (task) =>
        task.status === 'completed'
    ).length;

  const progress =
    tasks.length > 0
      ? (completedCount /
          tasks.length) *
        100
      : 0;

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6"
      style={{
        backgroundColor:
          'var(--neo-bg)',
      }}
    >
      <div className="mx-auto max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center h-16 w-16 rounded-full bg-primary/10 mb-4 animate-pulse">
            <span className="text-3xl">
              🌱
            </span>
          </div>

          <p className="text-sm font-semibold text-primary mb-2">
            MindPulse
          </p>

          <h1 className="text-3xl sm:text-4xl font-bold tracking-tight">
            Your Well-being Plan
          </h1>

          <p className="text-muted mt-3 leading-relaxed">
            Small steps for today,
            personalized from your
            latest check-in.
          </p>
        </div>

        {/* Progress */}
        <div className="neo-card p-5 mb-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-semibold">
              Today's Progress
            </h2>

            <span className="text-sm text-muted">
              {completedCount}/
              {tasks.length}
            </span>
          </div>

          <div className="h-3 rounded-full bg-muted overflow-hidden">
            <div
              className="h-full bg-primary transition-all duration-700 ease-out"
              style={{
                width: `${progress}%`,
              }}
            />
          </div>

          <p className="text-xs text-muted mt-3">
            {progress === 100
              ? '🎉 You completed your plan!'
              : completedCount === 0
              ? 'Start with one small step.'
              : `${tasks.length - completedCount} activities remaining.`}
          </p>
        </div>

        {/* Add all to calendar */}
        {tasks.length > 0 && (
          <button
            type="button"
            className="w-full rounded-xl border px-4 py-3 mb-6 text-sm font-semibold transition-all duration-300 hover:bg-muted hover:-translate-y-0.5 active:translate-y-0"
            onClick={() =>
              addAllTasksToCalendar(
                tasks.map((task) => ({
                  title: task.title,
                  description:
                    task.description,
                  target: task.target,
                  unit: task.unit,
                  suggested_time:
                    task.suggested_time,
                }))
              )
            }
          >
            📅 Add All to Calendar
          </button>
        )}

        {/* Tasks */}
        <div className="space-y-4">
          {tasks.map((task, index) => {
            const completed =
              task.status === 'completed';

            return (
              <div
                key={task.id}
                className={`neo-card p-5 transition-all duration-500 hover:-translate-y-1 ${
                  completed
                    ? 'opacity-70'
                    : ''
                }`}
                style={{
                  animationDelay: `${index * 80}ms`,
                }}
              >
                <div className="flex items-start gap-4">
                  {/* Check indicator */}
                  <div
                    className={`mt-1 h-7 w-7 shrink-0 rounded-full border-2 flex items-center justify-center text-sm font-bold transition-all duration-500 ${
                      completed
                        ? 'bg-primary border-primary text-primary-foreground scale-110'
                        : 'border-muted'
                    }`}
                  >
                    {completed
                      ? '✓'
                      : ''}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <h3 className="font-semibold text-lg">
                        {task.title}
                      </h3>

                      {!completed && (
                        <span className="text-lg animate-pulse">
                          ✦
                        </span>
                      )}
                    </div>

                    <p className="text-sm text-muted mt-1 leading-relaxed">
                      {task.description}
                    </p>

                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className="text-xs rounded-full bg-muted px-3 py-1">
                        Target:{' '}
                        {task.target}
                        {task.unit
                          ? ` ${task.unit}`
                          : ''}
                      </span>

                      {task.suggested_time && (
                        <span className="text-xs rounded-full bg-muted px-3 py-1">
                          Suggested:{' '}
                          {
                            task.suggested_time
                          }
                        </span>
                      )}
                    </div>

                    {/* Animated activity preview */}
                    {!completed && (
                      <div className="mt-2 -mb-2 scale-75 origin-left">
                        <ActivityVisual
                          activityType={
                            task.activity_type
                          }
                        />
                      </div>
                    )}

                    {/* Actions */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
                      <button
                        type="button"
                        disabled={completed}
                        className="rounded-xl bg-primary px-4 py-3 text-sm font-semibold text-primary-foreground transition-all duration-300 hover:-translate-y-0.5 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-50"
                        onClick={() =>
                          startTask(task)
                        }
                      >
                        {completed
                          ? '✓ Completed'
                          : '▶ Start Activity'}
                      </button>

                      <button
                        type="button"
                        className="rounded-xl border px-4 py-3 text-sm font-semibold transition-all duration-300 hover:bg-muted hover:-translate-y-0.5 active:translate-y-0"
                        onClick={() =>
                          addTaskToCalendar({
                            title: task.title,
                            description:
                              task.description,
                            target:
                              task.target,
                            unit: task.unit,
                            suggested_time:
                              task.suggested_time,
                          })
                        }
                      >
                        📅 Add to Calendar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        <p className="text-center text-xs text-muted mt-8 leading-relaxed">
          Your plan is generated from
          your latest MindPulse check-in.
        </p>
      </div>
    </div>
  );
}