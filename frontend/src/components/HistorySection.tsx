import { useEffect, useState } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  Database,
  Inbox,
  Smartphone,
  Moon,
  Activity,
  Bell,
  BookOpen,
  Brain,
} from 'lucide-react';

interface HistoryRecord {
  age: number;
  gender: string;
  country: string;
  academic_level: string;
  most_used_platform: string;
  purpose_of_use: string;
  avg_daily_usage_hours: number;
  daily_unlocks: number;
  study_hours: number;
  physical_activity_hours: number;
  sleep_hours_per_night: number;
  stress_level: string;
  predicted_score: number;
  created_at: string;
}

interface BehaviorChange {
  previous: number | string;
  current: number | string;
  change?: number;
}

interface TrendData {
  status: 'comparison' | 'first_prediction' | 'no_data';
  latest_score?: number;
  previous_score?: number | null;
  change?: number | null;
  direction?: 'improving' | 'declining' | 'stable' | 'neutral';
  message: string;
  latest_date?: string;
  previous_date?: string;
  behavior_changes?: {
    screen_time: BehaviorChange;
    sleep: BehaviorChange;
    physical_activity: BehaviorChange;
    study_hours: BehaviorChange;
    daily_unlocks: BehaviorChange;
    stress: BehaviorChange;
  };
}

export function HistorySection() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [trend, setTrend] = useState<TrendData | null>(null);
  const [loading, setLoading] = useState(true);
  const [trendLoading, setTrendLoading] = useState(true);
  const [error, setError] = useState('');

  async function load() {
    setLoading(true);
    setTrendLoading(true);
    setError('');

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        'http://127.0.0.1:8000';

      const token = localStorage.getItem('mindpulse_token');

      if (!token) {
        throw new Error('You are not logged in.');
      }

      const headers = {
        Authorization: `Bearer ${token}`,
      };

      const [historyResponse, trendResponse] = await Promise.all([
        fetch(`${apiUrl}/history`, {
          method: 'GET',
          headers,
        }),
        fetch(`${apiUrl}/trend`, {
          method: 'GET',
          headers,
        }),
      ]);

      const historyData = await historyResponse.json();
      const trendData = await trendResponse.json();

      if (!historyResponse.ok) {
        throw new Error(
          historyData.detail || 'Failed to load history'
        );
      }

      if (!trendResponse.ok) {
        throw new Error(
          trendData.detail || 'Failed to load trend'
        );
      }

      setRecords(historyData);
      setTrend(trendData);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Failed to load history'
      );
    } finally {
      setLoading(false);
      setTrendLoading(false);
    }
  }

  useEffect(() => {
    load();
  }, []);

  const totalPredictions = records.length;

  const avgScore =
    totalPredictions > 0
      ? (
        records.reduce(
          (sum, r) => sum + r.predicted_score,
          0
        ) / totalPredictions
      ).toFixed(2)
      : '—';

  const highestScore =
    totalPredictions > 0
      ? Math.max(
        ...records.map((r) => r.predicted_score)
      ).toFixed(2)
      : '—';

  const lowestScore =
    totalPredictions > 0
      ? Math.min(
        ...records.map((r) => r.predicted_score)
      ).toFixed(2)
      : '—';

  return (
    <section id="history" className="px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-4xl">

        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-primary">
            Prediction History
          </h2>

          <p className="text-sm text-muted mt-1">
            Your past predictions stored securely
          </p>
        </div>

        {loading ? (
          <div className="neo-card text-center">
            <div className="neo-loading-bar max-w-xs mx-auto">
              <div className="neo-loading-bar-fill" />
            </div>

            <p className="text-sm text-muted mt-3">
              Loading history...
            </p>
          </div>
        ) : error ? (
          <div className="neo-card text-center">
            <p className="text-sm text-error">
              {error}
            </p>

            <button
              type="button"
              onClick={load}
              className="neo-btn neo-btn-primary mt-4"
            >
              Try again
            </button>
          </div>
        ) : totalPredictions === 0 ? (
          <div className="neo-card text-center">
            <Inbox className="w-12 h-12 text-muted mx-auto mb-3" />

            <p className="text-secondary font-medium">
              No predictions yet
            </p>

            <p className="text-sm text-muted mt-1">
              Go to the Predict section and make your first prediction!
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard
                icon={<Database className="w-5 h-5 text-accent" />}
                label="Total Predictions"
                value={String(totalPredictions)}
              />

              <StatCard
                icon={<BarChart3 className="w-5 h-5 text-accent" />}
                label="Avg Score"
                value={avgScore}
              />

              <StatCard
                icon={<TrendingUp className="w-5 h-5 text-success" />}
                label="Highest Score"
                value={highestScore}
              />

              <StatCard
                icon={<TrendingDown className="w-5 h-5 text-error" />}
                label="Lowest Score"
                value={lowestScore}
              />
            </div>

            {/* Trend Intelligence */}
            {!trendLoading && trend && (
              <TrendCard trend={trend} />
            )}

            {/* Trend Chart */}
            {records.length > 1 && (
              <div className="neo-card mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neo-inset-sm !p-2.5 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>

                  <div>
                    <p className="text-base font-bold text-primary">
                      Score Trend
                    </p>

                    <p className="text-xs text-muted">
                      Track your predicted scores over time
                    </p>
                  </div>
                </div>

                <TrendChart records={records} />
              </div>
            )}

            {/* Data Table */}
            <div className="neo-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-gray-300/30">
                    <th className="pb-3 pr-4 font-semibold">
                      Age
                    </th>

                    <th className="pb-3 pr-4 font-semibold">
                      Gender
                    </th>

                    <th className="pb-3 pr-4 font-semibold">
                      Country
                    </th>

                    <th className="pb-3 pr-4 font-semibold">
                      Platform
                    </th>

                    <th className="pb-3 pr-4 font-semibold">
                      Stress
                    </th>

                    <th className="pb-3 pr-4 font-semibold text-right">
                      Score
                    </th>

                    <th className="pb-3 font-semibold">
                      Date
                    </th>
                  </tr>
                </thead>

                <tbody>
                  {records.map((r, index) => (
                    <tr
                      key={`${r.created_at}-${index}`}
                      className="border-b border-gray-300/20 last:border-0"
                    >
                      <td className="py-3 pr-4 text-secondary">
                        {r.age}
                      </td>

                      <td className="py-3 pr-4 text-secondary">
                        {r.gender}
                      </td>

                      <td className="py-3 pr-4 text-secondary">
                        {r.country}
                      </td>

                      <td className="py-3 pr-4 text-secondary">
                        {r.most_used_platform}
                      </td>

                      <td className="py-3 pr-4 text-secondary">
                        {r.stress_level}
                      </td>

                      <td className="py-3 pr-4 text-right font-bold text-primary">
                        {r.predicted_score.toFixed(2)}
                      </td>

                      <td className="py-3 text-muted text-xs">
                        {new Date(
                          `${r.created_at}Z`
                        ).toLocaleDateString('en-GB', {
                          day: '2-digit',
                          month: '2-digit',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </section>
  );
}

function TrendCard({
  trend,
}: {
  trend: TrendData;
}) {
  const isImproving = trend.direction === 'improving';
  const isDeclining = trend.direction === 'declining';
  const isStable = trend.direction === 'stable';

  const Icon = isImproving
    ? TrendingUp
    : isDeclining
      ? TrendingDown
      : Minus;

  const directionLabel = isImproving
    ? 'Improving'
    : isDeclining
      ? 'Declining'
      : isStable
        ? 'Stable'
        : 'Neutral';

  const directionClass = isImproving
    ? 'text-success'
    : isDeclining
      ? 'text-error'
      : 'text-accent';

  const behavior = trend.behavior_changes;

  return (
    <div className="neo-card mb-6">
      <div className="flex items-center justify-between gap-4 mb-5">
        <div>
          <p className="text-base font-bold text-primary">
            Your Recent Trend
          </p>

          <p className="text-xs text-muted mt-1">
            Comparison with your previous assessment
          </p>
        </div>

        <div className="neo-inset-sm !p-3 rounded-xl">
          <Icon
            className={`w-6 h-6 ${directionClass}`}
          />
        </div>
      </div>

      {trend.status === 'comparison' ? (
        <>
          {/* Score comparison */}
          <div className="grid grid-cols-2 gap-4 mb-5">
            <div className="neo-inset rounded-xl p-4 text-center">
              <p className="text-xs text-muted mb-1">
                Previous
              </p>

              <p className="text-2xl font-extrabold text-primary">
                {trend.previous_score?.toFixed(2)}
              </p>
            </div>

            <div className="neo-inset rounded-xl p-4 text-center">
              <p className="text-xs text-muted mb-1">
                Latest
              </p>

              <p className="text-2xl font-extrabold text-primary">
                {trend.latest_score?.toFixed(2)}
              </p>
            </div>
          </div>

          {/* Direction */}
          <div className="neo-inset-sm rounded-xl p-4 mb-5">
            <div className="flex items-center gap-3">
              <Icon
                className={`w-5 h-5 ${directionClass}`}
              />

              <div>
                <p
                  className={`font-bold ${directionClass}`}
                >
                  {directionLabel}

                  {trend.change !== undefined &&
                    trend.change !== null &&
                    ` · ${trend.change > 0 ? '+' : ''
                    }${trend.change.toFixed(2)}`}
                </p>

                <p className="text-sm text-secondary mt-1">
                  {trend.message}
                </p>
              </div>
            </div>
          </div>

          {/* Behavioral Changes */}
          {behavior && (
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Activity className="w-4 h-4 text-accent" />

                <p className="text-sm font-bold text-primary">
                  What changed?
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">

                <BehaviorItem
                  icon={<Smartphone className="w-4 h-4" />}
                  label="Screen Time"
                  previous={behavior.screen_time.previous}
                  current={behavior.screen_time.current}
                  change={behavior.screen_time.change}
                  unit="h"
                  lowerIsBetter
                />

                <BehaviorItem
                  icon={<Moon className="w-4 h-4" />}
                  label="Sleep"
                  previous={behavior.sleep.previous}
                  current={behavior.sleep.current}
                  change={behavior.sleep.change}
                  unit="h"
                />

                <BehaviorItem
                  icon={<Activity className="w-4 h-4" />}
                  label="Physical Activity"
                  previous={behavior.physical_activity.previous}
                  current={behavior.physical_activity.current}
                  change={behavior.physical_activity.change}
                  unit="h"
                />

                <BehaviorItem
                  icon={<BookOpen className="w-4 h-4" />}
                  label="Study Hours"
                  previous={behavior.study_hours.previous}
                  current={behavior.study_hours.current}
                  change={behavior.study_hours.change}
                  unit="h"
                />

                <BehaviorItem
                  icon={<Bell className="w-4 h-4" />}
                  label="Daily Unlocks"
                  previous={behavior.daily_unlocks.previous}
                  current={behavior.daily_unlocks.current}
                  change={behavior.daily_unlocks.change}
                />

                <BehaviorItem
                  icon={<Brain className="w-4 h-4" />}
                  label="Stress"
                  previous={behavior.stress.previous}
                  current={behavior.stress.current}
                  isText
                />

              </div>
            </div>
          )}

          <p className="text-xs text-muted mt-5">
            These comparisons show how your reported inputs changed
            between assessments. They do not establish cause and effect
            and are not a medical diagnosis.
          </p>
        </>
      ) : (
        <div className="neo-inset-sm rounded-xl p-4">
          <p className="text-sm text-secondary">
            {trend.message}
          </p>

          {trend.status === 'first_prediction' && (
            <p className="text-xs text-muted mt-2">
              Complete another assessment later to see how your
              predicted score changes over time.
            </p>
          )}
        </div>
      )}
    </div>
  );
}

function BehaviorItem({
  icon,
  label,
  previous,
  current,
  change,
  unit,
  lowerIsBetter = false,
  isText = false,
}: {
  icon: React.ReactNode;
  label: string;
  previous: number | string;
  current: number | string;
  change?: number;
  unit?: string;
  lowerIsBetter?: boolean;
  isText?: boolean;
}) {
  let changeClass = 'text-accent';

  if (!isText && change !== undefined && change !== 0) {
    const positiveChange = lowerIsBetter
      ? change < 0
      : change > 0;

    changeClass = positiveChange
      ? 'text-success'
      : 'text-error';
  }

  return (
    <div className="neo-inset-sm rounded-xl p-3">
      <div className="flex items-center gap-2 mb-2">
        <span className="text-accent">
          {icon}
        </span>

        <p className="text-xs font-semibold text-secondary">
          {label}
        </p>
      </div>

      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="text-xs text-muted">
            Previous
          </p>

          <p className="text-sm font-bold text-primary">
            {isText
              ? previous
              : `${Number(previous).toFixed(1)}${unit || ''}`}
          </p>
        </div>

        <div className="text-muted text-xs pb-1">
          →
        </div>

        <div>
          <p className="text-xs text-muted">
            Latest
          </p>

          <p className="text-sm font-bold text-primary">
            {isText
              ? current
              : `${Number(current).toFixed(1)}${unit || ''}`}
          </p>
        </div>

        {!isText && change !== undefined && (
          <div className="ml-auto">
            <p className={`text-xs font-bold ${changeClass}`}>
              {change > 0 ? '+' : ''}
              {change.toFixed(1)}
              {unit || ''}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="neo-card-sm text-center">
      <div className="flex justify-center mb-2">
        {icon}
      </div>

      <p className="text-2xl font-extrabold text-primary">
        {value}
      </p>

      <p className="text-xs text-muted mt-0.5">
        {label}
      </p>
    </div>
  );
}

function TrendChart({
  records,
}: {
  records: HistoryRecord[];
}) {
  const reversed = [...records].reverse();

  const maxScore = 10;
  const width = 100;
  const height = 40;

  const points = reversed.map((r, i) => {
    const x =
      reversed.length === 1
        ? width / 2
        : (i / (reversed.length - 1)) * width;

    const y =
      height -
      (r.predicted_score / maxScore) * height;

    return {
      x,
      y,
      score: r.predicted_score,
    };
  });

  const pathD = points
    .map(
      (p, i) =>
        `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`
    )
    .join(' ');

  const areaD =
    `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        style={{ height: '200px' }}
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient
            id="trendGradient"
            x1="0"
            y1="0"
            x2="0"
            y2="1"
          >
            <stop
              offset="0%"
              stopColor="rgba(99,102,241,0.25)"
            />

            <stop
              offset="100%"
              stopColor="rgba(99,102,241,0)"
            />
          </linearGradient>
        </defs>

        {[0, 25, 50, 75, 100].map((pct) => (
          <line
            key={pct}
            x1="0"
            y1={(pct / 100) * height}
            x2={width}
            y2={(pct / 100) * height}
            stroke="rgba(168,179,196,0.15)"
            strokeWidth="0.2"
          />
        ))}

        <path
          d={areaD}
          fill="url(#trendGradient)"
        />

        <path
          d={pathD}
          fill="none"
          stroke="#6366f1"
          strokeWidth="0.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {points.map((p, i) => (
          <circle
            key={i}
            cx={p.x}
            cy={p.y}
            r="1.2"
            fill="#6366f1"
            stroke="#4f46e5"
            strokeWidth="0.3"
          />
        ))}
      </svg>

      <div className="flex justify-between mt-2 text-xs text-muted">
        <span>Prediction 1</span>

        <span>
          Prediction {reversed.length}
        </span>
      </div>

      <div className="flex justify-between mt-1 text-xs text-muted">
        <span>Score: 0</span>
        <span>Score: 10</span>
      </div>
    </div>
  );
}