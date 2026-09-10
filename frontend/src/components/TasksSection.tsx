
import { useEffect, useState } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { getTasks, getPlan } from '@/tasks';
import type { WellbeingTask } from '@/types';

interface TasksSectionProps {
  onStartActivity: (task: WellbeingTask) => void;
  refreshKey: number;
}

export function TasksSection({
  onStartActivity,
  refreshKey,
}: TasksSectionProps) {
  const [tasks, setTasks] = useState<WellbeingTask[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [planToken, setPlanToken] = useState<string | null>(null);
  const [showPlanQr, setShowPlanQr] = useState(false);

  async function loadTasks() {
    const token = localStorage.getItem('mindpulse_token');

    if (!token) {
      setError('Please log in to view your tasks.');
      setLoading(false);
      return;
    }

    try {
      setError('');
      setLoading(true);

      const data = await getTasks(token);
      setTasks(data);

      const plan = await getPlan(token);
      setPlanToken(plan.plan_token);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to load tasks.'
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTasks();
  }, [refreshKey]);

  return (
    <section className="px-4 sm:px-6 py-12">
      <div className="mx-auto max-w-5xl">

        {/* HEADER */}
        <div className="text-center mb-10">
          <p className="text-sm font-bold text-accent uppercase tracking-wider">
            MindPulse Activities
          </p>

          <h2 className="text-3xl sm:text-4xl font-black mt-2">
            Your Well-being Tasks
          </h2>

          <p className="text-muted mt-3 max-w-2xl mx-auto">
            Small activities based on your latest reported
            behavioral data.
          </p>
        </div>

        {/* LOADING */}
        {loading && (
          <div className="neo-card text-center">
            <p className="text-muted">
              Loading your activities...
            </p>
          </div>
        )}

        {/* ERROR */}
        {!loading && error && (
          <div className="neo-card text-center">
            <p className="text-error font-semibold">
              {error}
            </p>

            <button
              type="button"
              className="neo-btn neo-btn-primary mt-5"
              onClick={loadTasks}
            >
              Try Again
            </button>
          </div>
        )}

        {/* EMPTY */}
        {!loading && !error && tasks.length === 0 && (
          <div className="neo-card text-center">
            <p className="text-muted">
              No activities are available yet.
            </p>

            <p className="text-sm text-muted mt-2">
              Complete a prediction first to generate
              personalized activities.
            </p>
          </div>
        )}

        {/* TASKS */}
        {!loading && !error && tasks.length > 0 && (
          <>
            {/* MY PLAN QR */}
            <div className="neo-card mb-8 text-center">
              <p className="text-sm font-bold text-accent uppercase tracking-wider">
                Your Mobile Plan
              </p>

              <h3 className="text-2xl font-bold mt-2">
                Take Your Tasks With You
              </h3>

              <p className="text-muted mt-2 max-w-xl mx-auto">
                Scan one QR code to open your personalized
                well-being plan on your phone.
              </p>

              <button
                type="button"
                className="neo-btn neo-btn-primary mt-5"
                onClick={() =>
                  setShowPlanQr(!showPlanQr)
                }
              >
                {showPlanQr
                  ? 'Hide My Plan QR'
                  : 'Show My Plan QR'}
              </button>

              {showPlanQr && planToken && (
                <div className="neo-inset-sm mt-6 inline-flex flex-col items-center gap-3 p-6">
                  <QRCodeCanvas
                    value={`${window.location.origin}/plan/${planToken}`}
                    size={240}
                    level="M"
                  />

                  <p className="text-sm text-muted text-center">
                    Scan this code with your phone.
                  </p>
                </div>
              )}
            </div>

            {/* TASK GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="neo-card"
                >
                  <div className="flex items-start justify-between gap-4">

                    <div>
                      <span className="text-xs font-bold uppercase tracking-wider text-accent">
                        {task.activity_type.replace(
                          '_',
                          ' '
                        )}
                      </span>

                      <h3 className="text-xl font-bold mt-2">
                        {task.title}
                      </h3>

                      <p className="text-muted mt-2 leading-relaxed">
                        {task.description}
                      </p>
                    </div>

                    <div
                      className={
                        task.status === 'completed'
                          ? 'text-success font-bold text-sm'
                          : 'text-warning font-bold text-sm'
                      }
                    >
                      {task.status === 'completed'
                        ? '✓ Done'
                        : 'Pending'}
                    </div>

                  </div>

                  <div className="neo-inset-sm mt-5">

                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted">
                        Target
                      </span>

                      <strong>
                        {task.target} {task.unit}
                      </strong>
                    </div>

                    {task.suggested_time && (
                      <div className="flex items-center justify-between text-sm mt-3">
                        <span className="text-muted">
                          Suggested time
                        </span>

                        <strong>
                          {task.suggested_time}
                        </strong>
                      </div>
                    )}

                  </div>

                  <button
                    type="button"
                    className="neo-btn neo-btn-primary w-full mt-5"
                    disabled={
                      task.status === 'completed'
                    }
                    onClick={() =>
                      onStartActivity(task)
                    }
                  >
                    {task.status === 'completed'
                      ? 'Activity Completed'
                      : 'Start Activity'}
                  </button>

                </div>
              ))}
            </div>
          </>
        )}

      </div>
    </section>
  );
}
