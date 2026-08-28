import type { StudentData, PredictionResult, Recommendation, Insight } from './types';

const API_URL = import.meta.env.VITE_API_URL ?? 'http://127.0.0.1:8000/predict';

/**
 * Score category logic
 */
export function getScoreCategory(score: number): { category: string; colorClass: string; emoji: string } {
  if (score >= 7.5) return { category: 'Excellent', colorClass: 'excellent', emoji: '🟢' };
  if (score >= 5.5) return { category: 'Good', colorClass: 'good', emoji: '🔵' };
  if (score >= 3.5) return { category: 'Fair', colorClass: 'fair', emoji: '🟡' };
  return { category: 'Needs Attention', colorClass: 'poor', emoji: '🔴' };
}

/**
 * Recommendation logic
 */
export function getRecommendations(score: number, data: StudentData): Recommendation[] {
  const tips: Recommendation[] = [];

  if (score < 5.5) {
    tips.push({
      emoji: '🛡️',
      color: '#dc2626',
      text: 'Your predicted score suggests mental well-being could use improvement. Consider reaching out to a counselor or trusted person.',
    });
  }

  if (data.avg_daily_usage_hours > 5) {
    tips.push({
      emoji: '📱',
      color: '#d97706',
      text: `You're spending ~${data.avg_daily_usage_hours}h/day on social media. Try setting a 2-hour daily limit to reclaim focus time.`,
    });
  }

  if (data.sleep_hours_per_night < 7) {
    tips.push({
      emoji: '😴',
      color: '#6366f1',
      text: `Only ${data.sleep_hours_per_night}h of sleep? Aim for 7–9 hours — sleep is the #1 predictor of mental health.`,
    });
  }

  if (data.physical_activity_hours < 1) {
    tips.push({
      emoji: '🏃',
      color: '#059669',
      text: 'Less than 1 hour of physical activity. Even a 30-minute walk can significantly boost mood and reduce anxiety.',
    });
  }

  if (data.study_hours < 2) {
    tips.push({
      emoji: '📚',
      color: '#2563eb',
      text: 'Low study hours detected. Building a structured study routine can improve both academic confidence and mental clarity.',
    });
  }

  if (data.stress_level === 'High' || data.stress_level === 'Very High') {
    tips.push({
      emoji: '🧘',
      color: '#7c3aed',
      text: 'High stress levels! Try meditation, deep breathing, or journaling — even 10 minutes a day makes a difference.',
    });
  }

  if (data.daily_unlocks > 150) {
    tips.push({
      emoji: '🔓',
      color: '#ea580c',
      text: `${data.daily_unlocks} daily unlocks is very high. Enable Focus Mode to reduce compulsive checking.`,
    });
  }

  if (tips.length === 0) {
    tips.push({
      emoji: '✨',
      color: '#059669',
      text: 'Great job! Your lifestyle metrics look healthy. Keep maintaining this balanced routine!',
    });
  }

  return tips;
}

/**
 * Insight generation
 */
export function getInsights(data: StudentData): Insight[] {
  return [
    {
      icon: '📱',
      title: 'Screen Time',
      value: `${data.avg_daily_usage_hours}h/day`,
      status: data.avg_daily_usage_hours > 5 ? 'High' : data.avg_daily_usage_hours > 3 ? 'Moderate' : 'Low',
    },
    {
      icon: '😴',
      title: 'Sleep Quality',
      value: `${data.sleep_hours_per_night}h/night`,
      status: data.sleep_hours_per_night >= 7 ? 'Good' : 'Low',
    },
    {
      icon: '🏃',
      title: 'Activity Level',
      value: `${data.physical_activity_hours}h/day`,
      status: data.physical_activity_hours >= 1.5 ? 'Active' : 'Low',
    },
    {
      icon: '🧘',
      title: 'Stress',
      value: data.stress_level,
      status: data.stress_level === 'High' || data.stress_level === 'Very High' ? 'Manage' : 'OK',
    },
  ];
}

/**
 * Sends the student's inputs to the prediction API (FastAPI service wrapping
 * the trained Random Forest model) and shapes the response into the data
 * the UI needs: score, category, insights, and recommendations.
 */
export async function predictMentalHealth(data: StudentData): Promise<PredictionResult> {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => '');
    throw new Error(`Prediction request failed (${response.status}). ${detail}`);
  }

  const body = await response.json();
  const score = Math.max(0, Math.min(10, Number(body.predicted_mental_health_score)));

  const { category, colorClass, emoji } = getScoreCategory(score);
  const recommendations = getRecommendations(score, data);
  const insights = getInsights(data);

  return { score, category, colorClass, emoji, recommendations, insights };
}
