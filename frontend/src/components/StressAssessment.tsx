import { useState } from 'react';
import { X, Check, Brain } from 'lucide-react';
import stressQuestions from '@/data/stressQuestions.json';

interface StressQuestion {
  id: number;
  text: string;
}

export interface StressAssessmentResult {
  rawScore: number;
  stressScore: number;
  stressLevel: 'Low' | 'Medium' | 'High' | 'Very High';
}

interface StressAssessmentProps {
  onComplete: (result: StressAssessmentResult) => void;
  onCancel: () => void;
}

const responseOptions = [
  {
    value: 0,
    shortLabel: 'Not at all',
    label: 'Did not apply to me at all',
  },
  {
    value: 1,
    shortLabel: 'Some degree',
    label: 'Applied to me to some degree, or some of the time',
  },
  {
    value: 2,
    shortLabel: 'Considerable',
    label:
      'Applied to me to a considerable degree, or a good part of time',
  },
  {
    value: 3,
    shortLabel: 'Very much',
    label: 'Applied to me very much, or most of the time',
  },
];

/*
 * IMPORTANT:
 * The questionnaire calculates the DASS-style stress score internally.
 *
 * We are intentionally keeping the category mapping in one place.
 * Do NOT treat these boundaries as clinically validated thresholds.
 *
 * We will replace this with the proper mapping for your ML dataset
 * after verifying how the original Stress_Level labels were generated.
 */
function getStressLevel(
  stressScore: number
): 'Low' | 'Medium' | 'High' | 'Very High' {
  /*
   * Temporary application mapping so the UI can work end-to-end.
   * These values should be revisited before the final ML integration.
   */
  if (stressScore <= 14) {
    return 'Low';
  }

  if (stressScore <= 20) {
    return 'Medium';
  }

  if (stressScore <= 26) {
    return 'High';
  }

  return 'Very High';
}

export default function StressAssessment({
  onComplete,
  onCancel,
}: StressAssessmentProps) {
  const questions = stressQuestions as StressQuestion[];

  const [answers, setAnswers] = useState<Record<number, number>>({});

  const answeredCount = Object.keys(answers).length;
  const progress = (answeredCount / questions.length) * 100;

  const handleAnswer = (questionId: number, value: number) => {
    setAnswers((previous) => ({
      ...previous,
      [questionId]: value,
    }));
  };

  const calculateResult = (): StressAssessmentResult => {
    const rawScore = questions.reduce(
      (total, question) => total + (answers[question.id] ?? 0),
      0
    );

    // DASS-21 scoring:
    // Sum the seven Stress items and multiply by 2.
    const stressScore = rawScore * 2;

    const stressLevel = getStressLevel(stressScore);

    return {
      rawScore,
      stressScore,
      stressLevel,
    };
  };

  const handleDone = () => {
    if (answeredCount !== questions.length) {
      return;
    }

    const result = calculateResult();

    onComplete(result);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/20 px-4 py-6 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stress-assessment-title"
    >
      <div className="relative flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl bg-[var(--neo-bg)] shadow-[var(--shadow-out-lg)]">
        {/* Header */}
        <div className="shrink-0 border-b border-[var(--neo-bg-dark)]/40 px-5 py-4 sm:px-7">
          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="neo-inset-sm flex h-10 w-10 shrink-0 items-center justify-center rounded-xl !p-2">
                <Brain className="h-5 w-5 text-accent" />
              </div>

              <div className="min-w-0">
                <h2
                  id="stress-assessment-title"
                  className="text-lg font-bold text-primary sm:text-xl"
                >
                  Stress Assessment
                </h2>

                <p className="mt-0.5 text-xs text-muted sm:text-sm">
                  Based on how you felt during the past week
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onCancel}
              className="neo-btn shrink-0 !p-2"
              aria-label="Close stress assessment"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Progress */}
          <div className="mt-5">
            <div className="mb-2 flex items-center justify-between">
              <span className="text-xs font-medium text-secondary">
                Progress
              </span>

              <span className="text-xs font-semibold text-accent">
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
        </div>

        {/* Questionnaire */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5 sm:px-7">
          <div className="mb-5 rounded-xl bg-[var(--neo-bg-light)] px-4 py-3">
            <p className="text-xs leading-5 text-secondary sm:text-sm">
              Select the response that best describes how much each
              statement applied to you.
            </p>
          </div>

          <div className="space-y-4">
            {questions.map((question, index) => (
              <div
                key={question.id}
                className="rounded-xl bg-[var(--neo-bg)] p-4 shadow-[var(--shadow-out-sm)]"
              >
                {/* Question */}
                <div className="mb-3 flex items-start gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[var(--neo-bg)] text-xs font-bold text-accent shadow-[2px_2px_5px_var(--neo-dark),-2px_-2px_5px_var(--neo-light)]">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  <p className="pt-1 text-sm font-semibold leading-5 text-primary">
                    {question.text}
                  </p>
                </div>

                {/* Answers */}
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                  {responseOptions.map((option) => {
                    const selected =
                      answers[question.id] === option.value;

                    return (
                      <button
                        key={option.value}
                        type="button"
                        onClick={() =>
                          handleAnswer(question.id, option.value)
                        }
                        className={`
                          flex min-h-[58px] items-center gap-3 rounded-xl
                          px-3 py-2.5 text-left transition-all duration-200
                          ${
                            selected
                              ? 'bg-[var(--neo-accent)] text-white shadow-[inset_3px_3px_6px_rgba(0,0,0,0.16)]'
                              : 'bg-[var(--neo-bg)] text-secondary shadow-[3px_3px_7px_var(--neo-dark),-3px_-3px_7px_var(--neo-light)] hover:-translate-y-[1px]'
                          }
                        `}
                        aria-pressed={selected}
                      >
                        <span
                          className={`
                            flex h-7 w-7 shrink-0 items-center justify-center
                            rounded-full text-xs font-bold
                            ${
                              selected
                                ? 'bg-white/20 text-white'
                                : 'bg-[var(--neo-bg)] text-accent shadow-[inset_2px_2px_4px_var(--neo-dark),inset_-2px_-2px_4px_var(--neo-light)]'
                            }
                          `}
                        >
                          {selected ? (
                            <Check className="h-4 w-4" />
                          ) : (
                            option.value
                          )}
                        </span>

                        <span className="text-xs font-medium leading-4 sm:text-sm">
                          {option.shortLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 border-t border-[var(--neo-bg-dark)]/40 px-5 py-4 sm:px-7">
          <div className="flex flex-col-reverse items-center gap-3 sm:flex-row sm:justify-between">
            <p className="text-center text-xs text-muted sm:text-left">
              {answeredCount === questions.length
                ? 'All questions answered.'
                : `Answer all ${questions.length} questions to continue.`}
            </p>

            <button
              type="button"
              onClick={handleDone}
              disabled={answeredCount !== questions.length}
              className="
                neo-btn
                neo-btn-primary
                w-full
                sm:w-auto
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              Done
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}