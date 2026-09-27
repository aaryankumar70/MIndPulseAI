import { useState } from 'react';
import {
  User,
  Smartphone,
  Leaf,
  Brain,
  Sparkles,
  Loader2,
  ClipboardCheck,
} from 'lucide-react';

import type { StudentData, PredictionResult } from '../types';

import {
  PLATFORMS,
  COUNTRIES,
  GENDERS,
  ACADEMIC_LEVELS,
  PURPOSES,
  STRESS_LEVELS,
  DEFAULT_VALUES,
} from '../types';

import { predictMentalHealth } from '../prediction';
import { ResultCard } from './ResultCard';
import StressAssessment, {
  StressAssessmentResult,
} from './StressAssessment';

interface Props {
  onPredictionSaved: () => void;
}

export function PredictionForm({ onPredictionSaved }: Props) {
  const [data, setData] = useState<StudentData>(DEFAULT_VALUES);

  const [result, setResult] = useState<PredictionResult | null>(null);

  const [loading, setLoading] = useState(false);

  const [savedStatus, setSavedStatus] = useState<
    'idle' | 'saved' | 'failed'
  >('idle');

  const [error, setError] = useState<string | null>(null);

  const [showStressAssessment, setShowStressAssessment] =
    useState(false);

  const [stressAssessmentCompleted, setStressAssessmentCompleted] =
    useState(false);

  function update<K extends keyof StudentData>(
    key: K,
    value: StudentData[K]
  ) {
    setData((prev) => ({
      ...prev,
      [key]: value,
    }));
  }

  async function handleSubmit() {
    setLoading(true);
    setResult(null);
    setSavedStatus('idle');
    setError(null);

    try {
      const token = localStorage.getItem('mindpulse_token');

      if (!token) {
        throw new Error(
          'You are not logged in. Please sign in again.'
        );
      }

      const prediction = await predictMentalHealth(data, token);

      setResult(prediction);
      setSavedStatus('saved');

      onPredictionSaved();
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

  function handleStressAssessmentComplete(
    assessmentResult: StressAssessmentResult
  ) {
    /*
     * Only the categorical stress level is passed into the prediction form.
     *
     * The numeric assessment score remains internal and is not displayed.
     */
    update('stress_level', assessmentResult.stressLevel);

    setStressAssessmentCompleted(true);
    setShowStressAssessment(false);
  }

  return (
    <div id="predict" className="px-4 py-8 sm:px-6">
      <div className="mx-auto max-w-4xl">

        {/* Section 1: Personal Information */}
        <div className="neo-card mb-6 animate-fade-up">
          <SectionHeader
            icon={<User className="h-5 w-5 text-accent" />}
            title="Personal Information"
            desc="Tell us about yourself"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="age">
                Age
              </label>

              <input
                id="age"
                type="number"
                className="neo-input"
                min={16}
                max={26}
                value={data.age}
                onChange={(e) =>
                  update(
                    'age',
                    Math.max(
                      16,
                      Math.min(
                        26,
                        Number(e.target.value) || 16
                      )
                    )
                  )
                }
                aria-label="Your age (16 to 26 years old)"
              />
            </div>

            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="gender">
                Gender
              </label>

              <select
                id="gender"
                className="neo-select"
                value={data.gender}
                onChange={(e) =>
                  update(
                    'gender',
                    e.target.value as StudentData['gender']
                  )
                }
                aria-label="Select your gender"
              >
                {GENDERS.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="country">
                Country
              </label>

              <select
                id="country"
                className="neo-select"
                value={data.country}
                onChange={(e) =>
                  update('country', e.target.value)
                }
                aria-label="Select your country"
              >
                {COUNTRIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="academic">
                Academic Level
              </label>

              <select
                id="academic"
                className="neo-select"
                value={data.academic_level}
                onChange={(e) =>
                  update(
                    'academic_level',
                    e.target.value as StudentData['academic_level']
                  )
                }
                aria-label="Select your academic level"
              >
                {ACADEMIC_LEVELS.map((a) => (
                  <option key={a} value={a}>
                    {a}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Section 2: Social Media Habits */}
        <div className="neo-card mb-6 animate-fade-up delay-100">
          <SectionHeader
            icon={<Smartphone className="h-5 w-5 text-accent" />}
            title="Social Media Habits"
            desc="Your daily digital behavior"
          />

          <div className="mb-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="platform">
                Most Used Platform
              </label>

              <select
                id="platform"
                className="neo-select"
                value={data.most_used_platform}
                onChange={(e) =>
                  update(
                    'most_used_platform',
                    e.target.value
                  )
                }
                aria-label="Select your most used social media platform"
              >
                {PLATFORMS.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="purpose">
                Primary Purpose
              </label>

              <select
                id="purpose"
                className="neo-select"
                value={data.purpose_of_use}
                onChange={(e) =>
                  update(
                    'purpose_of_use',
                    e.target.value as StudentData['purpose_of_use']
                  )
                }
                aria-label="Select your primary purpose of social media use"
              >
                {PURPOSES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="usage">
                Daily Usage (hours):{' '}
                <span className="font-bold text-accent">
                  {data.avg_daily_usage_hours}h
                </span>
              </label>

              <input
                id="usage"
                type="range"
                className="neo-slider"
                min={0}
                max={24}
                step={0.5}
                value={data.avg_daily_usage_hours}
                onChange={(e) =>
                  update(
                    'avg_daily_usage_hours',
                    Number(e.target.value)
                  )
                }
                aria-label="Average daily social media usage in hours"
              />
            </div>

            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="unlocks">
                Daily Phone Unlocks
              </label>

              <input
                id="unlocks"
                type="number"
                className="neo-input"
                min={0}
                max={500}
                step={5}
                value={data.daily_unlocks}
                onChange={(e) =>
                  update(
                    'daily_unlocks',
                    Math.max(
                      0,
                      Math.min(
                        500,
                        Number(e.target.value) || 0
                      )
                    )
                  )
                }
                aria-label="Number of times you unlock your phone daily"
              />
            </div>
          </div>
        </div>

        {/* Section 3: Lifestyle */}
        <div className="neo-card mb-6 animate-fade-up delay-200">
          <SectionHeader
            icon={<Leaf className="h-5 w-5 text-accent" />}
            title="Lifestyle & Well-being"
            desc="Your daily habits and routines"
          />

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="study">
                Study Hours / Day:{' '}
                <span className="font-bold text-accent">
                  {data.study_hours}h
                </span>
              </label>

              <input
                id="study"
                type="range"
                className="neo-slider"
                min={0}
                max={24}
                step={0.5}
                value={data.study_hours}
                onChange={(e) =>
                  update(
                    'study_hours',
                    Number(e.target.value)
                  )
                }
                aria-label="Average hours spent studying per day"
              />
            </div>

            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="activity">
                Physical Activity (hours):{' '}
                <span className="font-bold text-accent">
                  {data.physical_activity_hours}h
                </span>
              </label>

              <input
                id="activity"
                type="range"
                className="neo-slider"
                min={0}
                max={24}
                step={0.5}
                value={data.physical_activity_hours}
                onChange={(e) =>
                  update(
                    'physical_activity_hours',
                    Number(e.target.value)
                  )
                }
                aria-label="Average hours of physical activity per day"
              />
            </div>

            <div className="neo-input-wrap">
              <label className="neo-label" htmlFor="sleep">
                Sleep Hours / Night:{' '}
                <span className="font-bold text-accent">
                  {data.sleep_hours_per_night}h
                </span>
              </label>

              <input
                id="sleep"
                type="range"
                className="neo-slider"
                min={0}
                max={24}
                step={0.5}
                value={data.sleep_hours_per_night}
                onChange={(e) =>
                  update(
                    'sleep_hours_per_night',
                    Number(e.target.value)
                  )
                }
                aria-label="Average hours of sleep per night"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Stress Assessment */}
        <div className="neo-card mb-6 animate-fade-up delay-300">
          <SectionHeader
            icon={<Brain className="h-5 w-5 text-accent" />}
            title="Stress Assessment"
            desc="Complete a short structured assessment"
          />

          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-primary">
                {stressAssessmentCompleted
                  ? `Assessment completed — ${data.stress_level}`
                  : 'Want a more structured stress input?'}
              </p>

              <p className="mt-1 text-xs leading-5 text-muted">
                {stressAssessmentCompleted
                  ? 'Your assessment result has been applied to the prediction form.'
                  : 'Answer seven short questions about how you felt during the past week.'}
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowStressAssessment(true)}
              className="neo-btn neo-btn-primary flex shrink-0 items-center justify-center gap-2"
            >
              <ClipboardCheck className="h-4 w-4" />

              {stressAssessmentCompleted
                ? 'Retake Assessment'
                : 'Take Stress Assessment'}
            </button>
          </div>

          {/* Current selected stress level */}
          <div className="mt-5 rounded-xl bg-[var(--neo-bg-light)] p-4">
            <div className="flex items-center justify-between gap-4">
              <span className="text-sm font-medium text-secondary">
                Stress Level
              </span>

              <span className="rounded-lg bg-[var(--neo-bg)] px-3 py-1.5 text-sm font-bold text-accent shadow-[2px_2px_5px_var(--neo-dark),-2px_-2px_5px_var(--neo-light)]">
                {data.stress_level}
              </span>
            </div>
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
                <Loader2 className="h-5 w-5 animate-spin" />
                <span>Analyzing...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-5 w-5" />
                <span>Analyze My Mental Health</span>
              </>
            )}
          </button>
        </div>

        {/* Loading bar */}
        {loading && (
          <div className="mx-auto mt-6 max-w-md">
            <div className="neo-loading-bar">
              <div className="neo-loading-bar-fill" />
            </div>

            <p className="mt-2 text-center text-sm text-muted">
              Analyzing your data with AI...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div
            className="neo-card mx-auto mt-6 max-w-xl text-center"
            style={{ borderColor: 'var(--neo-error)' }}
          >
            <p
              className="text-sm font-semibold"
              style={{ color: 'var(--neo-error)' }}
            >
              Couldn't get a prediction
            </p>

            <p className="mt-1 text-xs text-muted">
              {error}
            </p>
          </div>
        )}

        {/* Result */}
        {result && !loading && (
          <>
            <hr className="neo-divider" />

            <div className="mb-6 text-center animate-fade-up">
              <p className="text-xs font-semibold uppercase tracking-widest text-muted">
                Analysis Complete
              </p>

              <h2 className="mt-1 text-2xl font-extrabold text-primary">
                Your Mental Health Report
              </h2>
            </div>

            <ResultCard
              result={result}
              savedStatus={savedStatus}
            />
          </>
        )}
      </div>

      {/* Stress Assessment Modal */}
      {showStressAssessment && (
        <StressAssessment
          onComplete={handleStressAssessmentComplete}
          onCancel={() => setShowStressAssessment(false)}
        />
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  desc,
}: {
  icon: React.ReactNode;
  title: string;
  desc: string;
}) {
  return (
    <div className="mb-5 flex items-center gap-3">
      <div className="neo-inset-sm flex items-center justify-center rounded-xl !p-2.5">
        {icon}
      </div>

      <div>
        <p className="text-base font-bold text-primary">
          {title}
        </p>

        <p className="text-xs text-muted">
          {desc}
        </p>
      </div>
    </div>
  );
}