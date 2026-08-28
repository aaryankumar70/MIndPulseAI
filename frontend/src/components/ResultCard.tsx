import type { PredictionResult } from '../types';
import { Lightbulb, CheckCircle2, AlertCircle } from 'lucide-react';

interface Props {
  result: PredictionResult;
  savedStatus: 'idle' | 'saved' | 'failed';
}

const SCORE_COLORS: Record<string, { text: string; bg: string; border: string; gradientFrom: string; gradientTo: string }> = {
  excellent: {
    text: 'var(--neo-success)',
    bg: 'rgba(5, 150, 105, 0.12)',
    border: 'rgba(5, 150, 105, 0.3)',
    gradientFrom: '#10b981',
    gradientTo: '#34d399',
  },
  good: {
    text: 'var(--neo-info)',
    bg: 'rgba(37, 99, 235, 0.12)',
    border: 'rgba(37, 99, 235, 0.3)',
    gradientFrom: '#3b82f6',
    gradientTo: '#60a5fa',
  },
  fair: {
    text: 'var(--neo-warning)',
    bg: 'rgba(217, 119, 6, 0.12)',
    border: 'rgba(217, 119, 6, 0.3)',
    gradientFrom: '#f59e0b',
    gradientTo: '#fbbf24',
  },
  poor: {
    text: 'var(--neo-error)',
    bg: 'rgba(220, 38, 38, 0.12)',
    border: 'rgba(220, 38, 38, 0.3)',
    gradientFrom: '#ef4444',
    gradientTo: '#f87171',
  },
};

export function ResultCard({ result, savedStatus }: Props) {
  const colors = SCORE_COLORS[result.colorClass] ?? SCORE_COLORS.good;
  const scorePercent = (result.score / 10) * 100;

  return (
    <div className="space-y-6">
      {/* Score + Gradient Gauge */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Score Card */}
        <div className="neo-card text-center animate-scale-in">
          <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-1">
            Predicted Score
          </p>
          <p
            className="neo-score-value"
            style={{ color: colors.text }}
          >
            {result.score}
          </p>
          <span
            className="neo-score-tag mt-2"
            style={{
              color: colors.text,
              background: colors.bg,
              border: `1px solid ${colors.border}`,
            }}
          >
            {result.emoji} {result.category}
          </span>
          <p className="text-sm text-muted mt-4">
            Scale: 0 (Critical) → 10 (Excellent)
          </p>
        </div>

        {/* Gradient Gauge */}
        <div className="neo-card animate-scale-in delay-100">
          <p className="text-xs text-muted uppercase tracking-widest font-semibold mb-4 text-center">
            Risk Level Visualization
          </p>
          <GradientGauge score={result.score} colors={colors} />
        </div>
      </div>

      {/* Quick Insights */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 animate-fade-up delay-200">
        {result.insights.map((insight, i) => (
          <div key={i} className="neo-card-sm">
            <div className="text-2xl mb-1">{insight.icon}</div>
            <p className="text-xs text-muted uppercase tracking-wide font-semibold">{insight.title}</p>
            <p className="text-base font-bold text-primary mt-0.5">{insight.value}</p>
            <p className="text-xs text-muted mt-0.5">{insight.status}</p>
          </div>
        ))}
      </div>

      {/* Recommendations */}
      <div className="animate-fade-up delay-300">
        <div className="flex items-center gap-3 mb-4">
          <div className="neo-inset-sm !p-2.5 rounded-xl">
            <Lightbulb className="w-5 h-5 text-accent" />
          </div>
          <div>
            <p className="text-base font-bold text-primary">Personalized Recommendations</p>
            <p className="text-xs text-muted">Based on your inputs and predicted score</p>
          </div>
        </div>
        <div className="space-y-3">
          {result.recommendations.map((tip, i) => (
            <div key={i} className="neo-tip">
              <span className="text-xl flex-shrink-0">{tip.emoji}</span>
              <p className="text-sm text-secondary leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Save status */}
      {savedStatus === 'saved' && (
        <div className="flex items-center justify-center gap-2 text-sm text-success animate-fade-up">
          <CheckCircle2 className="w-4 h-4" />
          <span>Prediction saved to database</span>
        </div>
      )}
      {savedStatus === 'failed' && (
        <div className="flex items-center justify-center gap-2 text-sm text-error animate-fade-up">
          <AlertCircle className="w-4 h-4" />
          <span>Could not save to database</span>
        </div>
      )}
    </div>
  );
}

function GradientGauge({
  score,
  colors,
}: {
  score: number;
  colors: { gradientFrom: string; gradientTo: string; text: string };
}) {
  const scorePercent = (score / 10) * 100;
  const segments = [
    { label: 'Critical', range: '0–3.5', from: '#ef4444', to: '#f87171', width: 35 },
    { label: 'Fair', range: '3.5–5.5', from: '#f59e0b', to: '#fbbf24', width: 20 },
    { label: 'Good', range: '5.5–7.5', from: '#3b82f6', to: '#60a5fa', width: 20 },
    { label: 'Excellent', range: '7.5–10', from: '#10b981', to: '#34d399', width: 25 },
  ];

  return (
    <div>
      {/* Gradient bar */}
      <div
        className="relative h-8 rounded-full overflow-hidden"
        style={{
          background: 'linear-gradient(90deg, #ef4444 0%, #fbbf24 35%, #60a5fa 55%, #34d399 100%)',
          boxShadow: 'var(--shadow-in-sm)',
        }}
        role="img"
        aria-label={`Mental health score ${score} out of 10, category: ${segments.find(s => {
          if (score >= 7.5) return s.label === 'Excellent';
          if (score >= 5.5) return s.label === 'Good';
          if (score >= 3.5) return s.label === 'Fair';
          return s.label === 'Critical';
        })?.label}`}
      >
        {/* Score indicator */}
        <div
          className="absolute top-0 bottom-0 flex items-center justify-center transition-all duration-700 ease-out"
          style={{
            left: `${Math.max(0, Math.min(100, scorePercent))}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <div
            className="w-1.5 h-12 rounded-full shadow-lg"
            style={{ background: colors.gradientFrom, boxShadow: `0 0 12px ${colors.gradientFrom}` }}
          />
        </div>
      </div>

      {/* Score number above indicator */}
      <div className="relative h-8 mt-1">
        <div
          className="absolute transition-all duration-700 ease-out"
          style={{
            left: `${Math.max(2, Math.min(98, scorePercent))}%`,
            transform: 'translateX(-50%)',
          }}
        >
          <span className="text-sm font-extrabold" style={{ color: colors.text }}>
            {score}/10
          </span>
        </div>
      </div>

      {/* Labels */}
      <div className="flex justify-between mt-2">
        {segments.map(seg => (
          <div key={seg.label} className="text-center" style={{ width: `${seg.width}%` }}>
            <p className="text-xs font-semibold" style={{ color: seg.from }}>{seg.label}</p>
            <p className="text-[10px] text-muted">{seg.range}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
