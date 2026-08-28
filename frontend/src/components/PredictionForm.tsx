import { useState } from 'react';
import { User, Smartphone, Leaf, Brain, Sparkles, Loader2 } from 'lucide-react';
import type { StudentData, PredictionResult } from '../types';
import {
  PLATFORMS, COUNTRIES, GENDERS, ACADEMIC_LEVELS,
  PURPOSES, STRESS_LEVELS, DEFAULT_VALUES,
} from '../types';
import { predictMentalHealth } from '../prediction';
import { savePrediction } from '../supabase';
import { ResultCard } from './ResultCard';

interface Props {
  onPredictionSaved: () => void;
}

export function PredictionForm({ onPredictionSaved }: Props) {
  const [data, setData] = useState<StudentData>(DEFAULT_VALUES);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [savedStatus, setSavedStatus] = useState<'idle' | 'saved' | 'failed'>('idle');
  const [error, setError] = useState<string | null>(null);

  function update<K extends keyof StudentData>(key: K, value: StudentData[K]) {
    setData(prev => ({ ...prev, [key]: value }));
  }

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    setSavedStatus('idle');
    setError(null);

    try {
      const prediction = await predictMentalHealth(data);
      setResult(prediction);

      const saved = await savePrediction({
        age: data.age,
        gender: data.gender,
        country: data.country,
        academic_level: data.academic_level,
        most_used_platform: data.most_used_platform,
        purpose_of_use: data.purpose_of_use,
        avg_daily_usage_hours: data.avg_daily_usage_hours,
        daily_unlocks: data.daily_unlocks,
        study_hours: data.study_hours,
        physical_activity_hours: data.physical_activity_hours,
        sleep_hours_per_night: data.sleep_hours_per_night,
        stress_level: data.stress_level,
        predicted_score: prediction.score,
      });

      setSavedStatus(saved ? 'saved' : 'failed');
      if (saved) onPredictionSaved();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Could not reach the prediction service. Make sure the backend is running.'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div id="predict" className="px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-4xl">
        {/* Section 1: Personal Information */}
        <div className="neo-card mb-6 animate-fade-up">
          <SectionHeader
            icon={<User className="w-5 h-5 text-accent" />}
            title="Personal Information"
            desc="Tell us about yourself"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="age">Age</label>
              <input
                id="age"
                type="number"
                className="neo-input"
                min={10}
                max={100}
                value={data.age}
                onChange={e => update('age', Math.max(10, Math.min(100, Number(e.target.value) || 10)))}
                aria-label="Your age (10 to 100)"
              />
            </div>
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="gender">Gender</label>
              <select
                id="gender"
                className="neo-select"
                value={data.gender}
                onChange={e => update('gender', e.target.value as StudentData['gender'])}
                aria-label="Select your gender"
              >
                {GENDERS.map(g => <option key={g} value={g}>{g}</option>)}
              </select>
            </div>
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="country">Country</label>
              <select
                id="country"
                className="neo-select"
                value={data.country}
                onChange={e => update('country', e.target.value)}
                aria-label="Select your country"
              >
                {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="academic">Academic Level</label>
              <select
                id="academic"
                className="neo-select"
                value={data.academic_level}
                onChange={e => update('academic_level', e.target.value as StudentData['academic_level'])}
                aria-label="Select your academic level"
              >
                {ACADEMIC_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Social Media Habits */}
        <div className="neo-card mb-6 animate-fade-up delay-100">
          <SectionHeader
            icon={<Smartphone className="w-5 h-5 text-accent" />}
            title="Social Media Habits"
            desc="Your daily digital behavior"
          />
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="platform">Most Used Platform</label>
              <select
                id="platform"
                className="neo-select"
                value={data.most_used_platform}
                onChange={e => update('most_used_platform', e.target.value)}
                aria-label="Select your most used social media platform"
              >
                {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="purpose">Primary Purpose</label>
              <select
                id="purpose"
                className="neo-select"
                value={data.purpose_of_use}
                onChange={e => update('purpose_of_use', e.target.value as StudentData['purpose_of_use'])}
                aria-label="Select your primary purpose of social media use"
              >
                {PURPOSES.map(p => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="usage">
                Daily Usage (hours): <span className="text-accent font-bold">{data.avg_daily_usage_hours}h</span>
              </label>
              <input
                id="usage"
                type="range"
                className="neo-slider"
                min={0}
                max={24}
                step={0.5}
                value={data.avg_daily_usage_hours}
                onChange={e => update('avg_daily_usage_hours', Number(e.target.value))}
                aria-label="Average daily social media usage in hours"
              />
            </div>
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="unlocks">Daily Phone Unlocks</label>
              <input
                id="unlocks"
                type="number"
                className="neo-input"
                min={0}
                max={500}
                step={5}
                value={data.daily_unlocks}
                onChange={e => update('daily_unlocks', Math.max(0, Math.min(500, Number(e.target.value) || 0)))}
                aria-label="Number of times you unlock your phone daily"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Lifestyle */}
        <div className="neo-card mb-6 animate-fade-up delay-200">
          <SectionHeader
            icon={<Leaf className="w-5 h-5 text-accent" />}
            title="Lifestyle & Well-being"
            desc="Your daily habits and routines"
          />
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="study">
                Study Hours / Day: <span className="text-accent font-bold">{data.study_hours}h</span>
              </label>
              <input
                id="study"
                type="range"
                className="neo-slider"
                min={0}
                max={24}
                step={0.5}
                value={data.study_hours}
                onChange={e => update('study_hours', Number(e.target.value))}
                aria-label="Average hours spent studying per day"
              />
            </div>
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="activity">
                Physical Activity (hours): <span className="text-accent font-bold">{data.physical_activity_hours}h</span>
              </label>
              <input
                id="activity"
                type="range"
                className="neo-slider"
                min={0}
                max={24}
                step={0.5}
                value={data.physical_activity_hours}
                onChange={e => update('physical_activity_hours', Number(e.target.value))}
                aria-label="Average hours of physical activity per day"
              />
            </div>
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="sleep">
                Sleep Hours / Night: <span className="text-accent font-bold">{data.sleep_hours_per_night}h</span>
              </label>
              <input
                id="sleep"
                type="range"
                className="neo-slider"
                min={0}
                max={24}
                step={0.5}
                value={data.sleep_hours_per_night}
                onChange={e => update('sleep_hours_per_night', Number(e.target.value))}
                aria-label="Average hours of sleep per night"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Stress Level */}
        <div className="neo-card mb-6 animate-fade-up delay-300">
          <SectionHeader
            icon={<Brain className="w-5 h-5 text-accent" />}
            title="Stress Assessment"
            desc="How stressed do you feel on a typical day?"
          />
          <div className="neo-segment w-full !flex">
            {STRESS_LEVELS.map(level => (
              <button
                key={level}
                className={`neo-segment-option flex-1 ${data.stress_level === level ? 'active' : ''}`}
                onClick={() => update('stress_level', level as StudentData['stress_level'])}
                aria-pressed={data.stress_level === level}
                aria-label={`Set stress level to ${level}`}
              >
                {level}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="text-center animate-fade-up delay-400">
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="neo-btn neo-btn-primary w-full sm:w-auto"
            aria-label="Analyze your mental health"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5" />
                <span>Analyze My Mental Health</span>
              </>
            )}
          </button>
        </div>

        {/* Loading bar */}
        {loading && (
          <div className="mt-6 max-w-md mx-auto">
            <div className="neo-loading-bar">
              <div className="neo-loading-bar-fill" />
            </div>
            <p className="text-center text-sm text-muted mt-2">Analyzing your data with AI...</p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="mt-6 max-w-xl mx-auto neo-card text-center" style={{ borderColor: 'var(--neo-error)' }}>
            <p className="text-sm font-semibold" style={{ color: 'var(--neo-error)' }}>
              Couldn't get a prediction
            </p>
            <p className="text-xs text-muted mt-1">{error}</p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <>
            <hr className="neo-divider" />
            <div className="text-center mb-6 animate-fade-up">
              <p className="text-xs text-muted uppercase tracking-widest font-semibold">Analysis Complete</p>
              <h2 className="text-2xl font-extrabold text-primary mt-1">Your Mental Health Report</h2>
            </div>
            <ResultCard result={result} savedStatus={savedStatus} />
          </>
        )}
      </div>
    </div>
  );
}

function SectionHeader({ icon, title, desc }: { icon: React.ReactNode; title: string; desc: string }) {
  return (
    <div className="flex items-center gap-3 mb-5">
      <div className="neo-inset-sm !p-2.5 rounded-xl flex items-center justify-center">
        {icon}
      </div>
      <div>
        <p className="text-base font-bold text-primary">{title}</p>
        <p className="text-xs text-muted">{desc}</p>
      </div>
    </div>
  );
}
