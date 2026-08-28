import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, Database, Inbox } from 'lucide-react';
import type { HistoryRecord } from '../types';
import { getHistory } from '../supabase';

export function HistorySection() {
  const [records, setRecords] = useState<HistoryRecord[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const data = await getHistory();
    setRecords(data);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const totalPredictions = records.length;
  const avgScore = totalPredictions > 0
    ? (records.reduce((sum, r) => sum + r.predicted_score, 0) / totalPredictions).toFixed(2)
    : '—';
  const highestScore = totalPredictions > 0 ? Math.max(...records.map(r => r.predicted_score)).toFixed(2) : '—';
  const lowestScore = totalPredictions > 0 ? Math.min(...records.map(r => r.predicted_score)).toFixed(2) : '—';

  return (
    <section id="history" className="px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-primary">Prediction History</h2>
          <p className="text-sm text-muted mt-1">All past predictions stored in the database</p>
        </div>

        {loading ? (
          <div className="neo-card text-center">
            <div className="neo-loading-bar max-w-xs mx-auto">
              <div className="neo-loading-bar-fill" />
            </div>
            <p className="text-sm text-muted mt-3">Loading history...</p>
          </div>
        ) : totalPredictions === 0 ? (
          <div className="neo-card text-center">
            <Inbox className="w-12 h-12 text-muted mx-auto mb-3" />
            <p className="text-secondary font-medium">No predictions yet</p>
            <p className="text-sm text-muted mt-1">
              Go to the Predict section and make your first prediction!
            </p>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <StatCard icon={<Database className="w-5 h-5 text-accent" />} label="Total Predictions" value={String(totalPredictions)} />
              <StatCard icon={<BarChart3 className="w-5 h-5 text-accent" />} label="Avg Score" value={avgScore} />
              <StatCard icon={<TrendingUp className="w-5 h-5 text-success" />} label="Highest Score" value={highestScore} />
              <StatCard icon={<TrendingUp className="w-5 h-5 text-error" />} label="Lowest Score" value={lowestScore} />
            </div>

            {/* Trend chart */}
            {records.length > 1 && (
              <div className="neo-card mb-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="neo-inset-sm !p-2.5 rounded-xl">
                    <TrendingUp className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <p className="text-base font-bold text-primary">Score Trend</p>
                    <p className="text-xs text-muted">Track mental health scores over time</p>
                  </div>
                </div>
                <TrendChart records={records} />
              </div>
            )}

            {/* Data table */}
            <div className="neo-card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-muted border-b border-gray-300/30">
                    <th className="pb-3 pr-4 font-semibold">Age</th>
                    <th className="pb-3 pr-4 font-semibold">Gender</th>
                    <th className="pb-3 pr-4 font-semibold">Country</th>
                    <th className="pb-3 pr-4 font-semibold">Platform</th>
                    <th className="pb-3 pr-4 font-semibold">Stress</th>
                    <th className="pb-3 pr-4 font-semibold text-right">Score</th>
                    <th className="pb-3 font-semibold">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {records.map(r => (
                    <tr key={r.id} className="border-b border-gray-300/20 last:border-0">
                      <td className="py-3 pr-4 text-secondary">{r.age}</td>
                      <td className="py-3 pr-4 text-secondary">{r.gender}</td>
                      <td className="py-3 pr-4 text-secondary">{r.country}</td>
                      <td className="py-3 pr-4 text-secondary">{r.most_used_platform}</td>
                      <td className="py-3 pr-4 text-secondary">{r.stress_level}</td>
                      <td className="py-3 pr-4 text-right font-bold text-primary">{r.predicted_score.toFixed(2)}</td>
                      <td className="py-3 text-muted text-xs">
                        {new Date(r.created_at).toLocaleDateString('en-GB', {
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

function StatCard({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return (
    <div className="neo-card-sm text-center">
      <div className="flex justify-center mb-2">{icon}</div>
      <p className="text-2xl font-extrabold text-primary">{value}</p>
      <p className="text-xs text-muted mt-0.5">{label}</p>
    </div>
  );
}

function TrendChart({ records }: { records: HistoryRecord[] }) {
  const reversed = [...records].reverse();
  const maxScore = 10;
  const width = 100;
  const height = 40;
  const points = reversed.map((r, i) => {
    const x = reversed.length === 1 ? width / 2 : (i / (reversed.length - 1)) * width;
    const y = height - (r.predicted_score / maxScore) * height;
    return { x, y, score: r.predicted_score };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`)
    .join(' ');
  const areaD = `${pathD} L ${width} ${height} L 0 ${height} Z`;

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height: '200px' }} preserveAspectRatio="none">
        <defs>
          <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="rgba(99,102,241,0.25)" />
            <stop offset="100%" stopColor="rgba(99,102,241,0)" />
          </linearGradient>
        </defs>
        {/* Grid lines */}
        {[0, 25, 50, 75, 100].map(pct => (
          <line
            key={pct}
            x1="0" y1={`${(pct / 100) * height}`} x2={width} y2={`${(pct / 100) * height}`}
            stroke="rgba(168,179,196,0.15)" strokeWidth="0.2"
          />
        ))}
        <path d={areaD} fill="url(#trendGradient)" />
        <path d={pathD} fill="none" stroke="#6366f1" strokeWidth="0.8" strokeLinecap="round" strokeLinejoin="round" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="1.2" fill="#6366f1" stroke="#4f46e5" strokeWidth="0.3" />
        ))}
      </svg>
      <div className="flex justify-between mt-2 text-xs text-muted">
        <span>Prediction 1</span>
        <span>Prediction {reversed.length}</span>
      </div>
      <div className="flex justify-between mt-1 text-xs text-muted">
        <span>Score: 0</span>
        <span>Score: 10</span>
      </div>
    </div>
  );
}
