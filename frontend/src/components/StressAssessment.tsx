import { useState } from 'react';
import stressQuestions from '@/data/stressQuestions.json';

interface StressQuestion {
  id: number;
  text: string;
}

interface StressAssessmentResult {
  rawScore: number;
  stressScore: number;
}

interface StressAssessmentProps {
  onComplete?: (result: StressAssessmentResult) => void;
  onCancel?: () => void;
}

const responseOptions = [
  {
    value: 0,
    label: 'Did not apply to me at all',
  },
  {
    value: 1,
    label: 'Applied to me to some degree, or some of the time',
  },
  {
    value: 2,
    label: 'Applied to me to a considerable degree, or a good part of time',
  },
  {
    value: 3,
    label: 'Applied to me very much, or most of the time',
  },
];

export default function StressAssessment({
  onComplete,
  onCancel,
}: StressAssessmentProps) {
  const questions = stressQuestions as StressQuestion[];

  const [answers, setAnswers] = useState<Record<number, number>>({});
  const [showResult, setShowResult] = useState(false);
  const [result, setResult] = useState<StressAssessmentResult | null>(null);

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  };

  const calculateScore = () => {
    const rawScore = questions.reduce(
      (total, question) => total + (answers[question.id] ?? 0),
      0
    );

    // DASS-21 scoring:
    // Sum the seven Stress items and multiply by 2.
    const stressScore = rawScore * 2;

    return {
      rawScore,
      stressScore,
    };
  };

  const handleSubmit = () => {
    if (answeredCount !== questions.length) {
      return;
    }

    const calculatedResult = calculateScore();

    setResult(calculatedResult);
    setShowResult(true);

    onComplete?.(calculatedResult);
  };

  const handleRetake = () => {
    setAnswers({});
    setResult(null);
    setShowResult(false);
  };

  if (showResult && result) {
    return (
      <div className="neo-card">
        <div className="mb-6 text-center">
          <h2 className="text-2xl font-bold text-primary">
            Stress Assessment Complete
          </h2>

          <p className="mt-2 text-sm text-secondary">
            Your responses have been scored.
          </p>
        </div>

        <div className="neo-inset-sm mx-auto max-w-sm p-6 text-center">
          <p className="text-sm font-medium text-muted">
            Stress Score
          </p>

          <p className="mt-2 text-5xl font-bold text-accent">
            {result.stressScore}
          </p>

          <p className="mt-2 text-sm text-muted">
            out of 42
          </p>

          <p className="mt-4 text-xs text-muted">
            Raw score: {result.rawScore} / 21
          </p>
        </div>

        <div className="mt-6 rounded-xl bg-[var(--neo-bg-light)] p-4">
          <p className="text-sm leading-6 text-secondary">
            This result represents your responses to the stress assessment
            over the past week. It is an assessment score and is not a
            medical diagnosis.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap justify-center gap-3">
          <button
            type="button"
            onClick={handleRetake}
            className="neo-btn"
          >
            Retake Assessment
          </button>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="neo-btn neo-btn-primary"
            >
              Continue
            </button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="neo-card">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-primary">
              Stress Assessment
            </h2>

            <p className="mt-2 text-sm leading-6 text-secondary">
              Please answer each statement based on how much it applied
              to you during the past week.
            </p>
          </div>

          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="neo-btn !p-2"
              aria-label="Close assessment"
            >
              ×
            </button>
          )}
        </div>
      </div>

      {/* Response scale */}
      <div className="neo-inset-sm mb-6 p-4">
        <p className="mb-3 text-sm font-semibold text-primary">
          Response scale
        </p>

        <div className="space-y-2">
          {responseOptions.map((option) => (
            <div
              key={option.value}
              className="flex items-start gap-3 text-sm text-secondary"
            >
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[var(--neo-bg)] font-semibold text-accent shadow-[2px_2px_4px_var(--neo-dark),-2px_-2px_4px_var(--neo-light)]">
                {option.value}
              </span>

              <span>{option.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Progress */}
      <div className="mb-6">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-secondary">
            Progress
          </span>

          <span className="text-sm font-semibold text-accent">
            {answeredCount} / {questions.length}
          </span>
        </div>

        <div className="h-2 overflow-hidden rounded-full bg-[var(--neo-bg-dark)]">
          <div
            className="h-full rounded-full bg-[var(--neo-accent)] transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-5">
        {questions.map((question, index) => (
          <div
            key={question.id}
            className="neo-card-sm"
          >
            <div className="mb-4">
              <p className="text-sm font-semibold text-primary">
                {index + 1}. {question.text}
              </p>
            </div>

            <div className="grid gap-2 sm:grid-cols-2">
              {responseOptions.map((option) => {
                const selected = answers[question.id] === option.value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() =>
                      handleAnswer(question.id, option.value)
                    }
                    className={`
                      rounded-xl p-3 text-left text-sm
                      transition-all duration-200
                      ${
                        selected
                          ? 'bg-[var(--neo-accent)] text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.15)]'
                          : 'neo-btn text-secondary'
                      }
                    `}
                  >
                    <span className="mr-2 font-bold">
                      {option.value}
                    </span>

                    {option.label}
                  </button>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-7 flex flex-col items-center gap-3">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={answeredCount !== questions.length}
          className="
            neo-btn
            neo-btn-primary
            w-full
            max-w-sm
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          Calculate Stress Score
        </button>

        {answeredCount !== questions.length && (
          <p className="text-xs text-muted">
            Please answer all {questions.length} questions to continue.
          </p>
        )}
      </div>
    </div>
  );
}