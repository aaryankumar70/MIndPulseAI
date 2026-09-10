
import { useEffect, useState } from 'react';
import { BreathingActivity } from '@/components/activities/BreathingActivity';
import { getTaskActivity, completeTask } from '@/tasks';
import type { TaskActivity, WellbeingTask } from '@/types';

interface ActivityPageProps {
  task: WellbeingTask;
  onBack: () => void;
  onCompleted: () => void;
}

const movementSteps = [
  {
    title: 'Stand Up',
    description: 'Stand comfortably and take a few relaxed breaths.',
    duration: '10 seconds',
    icon: '🧍',
  },
  {
    title: 'Shoulder Rolls',
    description: 'Slowly roll your shoulders backward 10 times.',
    duration: '30 seconds',
    icon: '🔄',
  },
  {
    title: 'Arm Stretch',
    description: 'Stretch both arms overhead and hold gently.',
    duration: '30 seconds',
    icon: '🙆',
  },
  {
    title: 'Walk Around',
    description: 'Walk around your room or nearby space at a comfortable pace.',
    duration: '2 minutes',
    icon: '🚶',
  },
];

const screenBreakSteps = [
  {
    title: 'Look Away',
    description: 'Look at something far away from your screen.',
    duration: '20 seconds',
    icon: '👀',
  },
  {
    title: 'Blink Slowly',
    description: 'Close your eyes gently, then blink slowly several times.',
    duration: '20 seconds',
    icon: '😌',
  },
  {
    title: 'Relax Your Shoulders',
    description: 'Drop your shoulders and release any tension you are holding.',
    duration: '20 seconds',
    icon: '🙆',
  },
  {
    title: 'Take a Screen-Free Moment',
    description: 'Step away from the screen and let your eyes rest.',
    duration: '1 minute',
    icon: '📵',
  },
];

const windDownSteps = [
  {
    title: 'Lower the Pace',
    description: 'Slow down and move away from demanding tasks.',
    icon: '🌙',
  },
  {
    title: 'Dim Your Environment',
    description: 'Reduce bright lights and screen brightness if possible.',
    icon: '💡',
  },
  {
    title: 'Take a Quiet Moment',
    description: 'Sit comfortably and take a few slow breaths.',
    icon: '🧘',
  },
  {
    title: 'Prepare for Rest',
    description: 'Put your phone aside and give yourself time to wind down.',
    icon: '🛏️',
  },
];

const focusPresets = [
  { minutes: 5, label: '5 min' },
  { minutes: 15, label: '15 min' },
  { minutes: 25, label: '25 min' },
];

function formatTime(totalSeconds: number) {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;

  return `${String(minutes).padStart(2, '0')}:${String(
    seconds
  ).padStart(2, '0')}`;
}

export function ActivityPage({
  task,
  onBack,
  onCompleted,
}: ActivityPageProps) {
  const [activity, setActivity] = useState<TaskActivity | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const [secondsRemaining, setSecondsRemaining] = useState(
    task.target * 60
  );

  const [isRunning, setIsRunning] = useState(false);
  const [completing, setCompleting] = useState(false);

  const [movementStep, setMovementStep] = useState(0);
  const [movementStarted, setMovementStarted] = useState(false);

  const [screenStep, setScreenStep] = useState(0);
  const [screenStarted, setScreenStarted] = useState(false);

  const [windDownStep, setWindDownStep] = useState(0);
  const [windDownStarted, setWindDownStarted] = useState(false);

  const [focusStarted, setFocusStarted] = useState(false);
  const [focusDuration, setFocusDuration] = useState(
    Math.max(1, task.target) * 60
  );
  const [focusRemaining, setFocusRemaining] = useState(
    Math.max(1, task.target) * 60
  );
  const [focusRunning, setFocusRunning] = useState(false);

  const [waterCount, setWaterCount] = useState(0);
  const waterGoal = 5;

  const [socialChoice, setSocialChoice] = useState('');
  const [socialStarted, setSocialStarted] = useState(false);

  useEffect(() => {
    async function loadActivity() {
      const token = localStorage.getItem('mindpulse_token');

      if (!token) {
        setError('Please log in again.');
        setLoading(false);
        return;
      }

      try {
        const data = await getTaskActivity(task.id, token);
        setActivity(data);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Unable to load activity.'
        );
      } finally {
        setLoading(false);
      }
    }

    loadActivity();
  }, [task.id]);

  /*
   * Generic timer.
   *
   * Special interactive activities manage their own timers.
   */
  useEffect(() => {
    if (
      !isRunning ||
      secondsRemaining <= 0 ||
      activity?.activity_type === 'breathing' ||
      activity?.activity_type === 'movement' ||
      activity?.activity_type === 'screen_break' ||
      activity?.activity_type === 'wind_down' ||
      activity?.activity_type === 'focus'
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

    return () => window.clearInterval(timer);
  }, [isRunning, secondsRemaining, activity?.activity_type]);

  /*
   * Focus timer.
   */
  useEffect(() => {
    if (!focusRunning || focusRemaining <= 0) {
      return;
    }

    const timer = window.setInterval(() => {
      setFocusRemaining((seconds) => {
        if (seconds <= 1) {
          setFocusRunning(false);
          return 0;
        }

        return seconds - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [focusRunning, focusRemaining]);

  async function handleComplete() {
    const token = localStorage.getItem('mindpulse_token');

    if (!token) {
      setError('Please log in again.');
      return;
    }

    try {
      setCompleting(true);
      setError('');

      await completeTask(task.id, token);

      onCompleted();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Unable to complete the activity.'
      );
    } finally {
      setCompleting(false);
    }
  }

  if (loading) {
    return (
      <section className="px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-3xl neo-card text-center">
          <p className="text-muted">Loading activity...</p>
        </div>
      </section>
    );
  }

  if (error && !activity) {
    return (
      <section className="px-4 sm:px-6 py-16">
        <div className="mx-auto max-w-3xl neo-card text-center">
          <p className="text-error font-semibold">{error}</p>

          <button
            type="button"
            className="neo-btn mt-6"
            onClick={onBack}
          >
            Back to Tasks
          </button>
        </div>
      </section>
    );
  }

  if (!activity) {
    return null;
  }

  /*
   * BREATHING
   */
  if (activity.activity_type === 'breathing') {
    return (
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            className="neo-btn mb-8"
            onClick={onBack}
          >
            ← Back to Tasks
          </button>

          <div className="neo-card">
            <div className="text-center">
              <p className="text-sm font-bold text-accent uppercase tracking-wider">
                MindPulse Activity
              </p>

              <h1 className="text-3xl sm:text-4xl font-black mt-3">
                {activity.title}
              </h1>

              <p className="text-muted mt-4 max-w-2xl mx-auto">
                {activity.description}
              </p>
            </div>

            <div className="mt-8">
              <BreathingActivity
                targetMinutes={activity.target}
                onComplete={handleComplete}
              />
            </div>

            {error && (
              <p className="text-error mt-5 text-center">
                {error}
              </p>
            )}
          </div>

          <Instructions instructions={activity.instructions} />
        </div>
      </section>
    );
  }

  /*
   * MOVEMENT
   */
  if (activity.activity_type === 'movement') {
    const currentStep = movementSteps[movementStep];
    const progress =
      ((movementStep + 1) / movementSteps.length) * 100;
    const isLast = movementStep === movementSteps.length - 1;

    return (
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            className="neo-btn mb-8"
            onClick={onBack}
          >
            ← Back to Tasks
          </button>

          <div className="neo-card">
            <ActivityHeader
              title={activity.title}
              description={activity.description}
            />

            {!movementStarted ? (
              <div className="text-center mt-10">
                <ActivityOrb emoji="🏃" />

                <h2 className="text-2xl font-black mt-8">
                  Ready to move?
                </h2>

                <p className="text-muted mt-3">
                  Follow the short guided sequence at your own
                  comfortable pace.
                </p>

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-7"
                  onClick={() => setMovementStarted(true)}
                >
                  ▶ Start Movement
                </button>
              </div>
            ) : (
              <div className="mt-10 text-center">
                <ActivityOrb emoji={currentStep.icon} />

                <p className="text-sm font-bold text-accent uppercase tracking-wider mt-7">
                  Step {movementStep + 1} of {movementSteps.length}
                </p>

                <h2 className="text-3xl font-black mt-2">
                  {currentStep.title}
                </h2>

                <p className="text-muted mt-4">
                  {currentStep.description}
                </p>

                <div className="neo-inset-sm inline-flex px-5 py-2 mt-5">
                  <span className="font-bold text-accent">
                    ⏱ {currentStep.duration}
                  </span>
                </div>

                <ProgressBar progress={progress} />

                <div className="flex justify-center gap-2 mt-5">
                  {movementSteps.map((_, index) => (
                    <StepDot
                      key={index}
                      active={index <= movementStep}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-8"
                  onClick={() => {
                    if (isLast) {
                      handleComplete();
                    } else {
                      setMovementStep((step) => step + 1);
                    }
                  }}
                  disabled={completing}
                >
                  {isLast
                    ? completing
                      ? 'Saving...'
                      : '✓ Complete Movement'
                    : '✓ Done — Next Step'}
                </button>
              </div>
            )}
          </div>

          <Instructions instructions={activity.instructions} />
        </div>
      </section>
    );
  }

  /*
   * SCREEN BREAK
   */
  if (activity.activity_type === 'screen_break') {
    const currentStep = screenBreakSteps[screenStep];
    const progress =
      ((screenStep + 1) / screenBreakSteps.length) * 100;
    const isLast = screenStep === screenBreakSteps.length - 1;

    return (
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            className="neo-btn mb-8"
            onClick={onBack}
          >
            ← Back to Tasks
          </button>

          <div className="neo-card">
            <ActivityHeader
              title={activity.title}
              description={activity.description}
            />

            {!screenStarted ? (
              <div className="text-center mt-10">
                <ActivityOrb emoji="📱" />

                <h2 className="text-2xl font-black mt-8">
                  Give your eyes a break
                </h2>

                <p className="text-muted mt-3">
                  Step away from your screen and follow the
                  short eye-relaxation sequence.
                </p>

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-7"
                  onClick={() => setScreenStarted(true)}
                >
                  👀 Start Screen Break
                </button>
              </div>
            ) : (
              <div className="mt-10 text-center">
                <ActivityOrb emoji={currentStep.icon} />

                <p className="text-sm font-bold text-accent uppercase tracking-wider mt-7">
                  Step {screenStep + 1} of {screenBreakSteps.length}
                </p>

                <h2 className="text-3xl font-black mt-2">
                  {currentStep.title}
                </h2>

                <p className="text-muted mt-4">
                  {currentStep.description}
                </p>

                <div className="neo-inset-sm inline-flex px-5 py-2 mt-5">
                  <span className="font-bold text-accent">
                    ⏱ {currentStep.duration}
                  </span>
                </div>

                <ProgressBar progress={progress} />

                <div className="flex justify-center gap-2 mt-5">
                  {screenBreakSteps.map((_, index) => (
                    <StepDot
                      key={index}
                      active={index <= screenStep}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-8"
                  onClick={() => {
                    if (isLast) {
                      handleComplete();
                    } else {
                      setScreenStep((step) => step + 1);
                    }
                  }}
                  disabled={completing}
                >
                  {isLast
                    ? completing
                      ? 'Saving...'
                      : '✓ Complete Screen Break'
                    : '✓ Done — Next Step'}
                </button>
              </div>
            )}
          </div>

          <Instructions instructions={activity.instructions} />
        </div>
      </section>
    );
  }

  /*
   * WIND DOWN
   */
  if (activity.activity_type === 'wind_down') {
    const currentStep = windDownSteps[windDownStep];
    const progress =
      ((windDownStep + 1) / windDownSteps.length) * 100;
    const isLast = windDownStep === windDownSteps.length - 1;

    return (
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            className="neo-btn mb-8"
            onClick={onBack}
          >
            ← Back to Tasks
          </button>

          <div className="neo-card">
            <ActivityHeader
              title={activity.title}
              description={activity.description}
            />

            {!windDownStarted ? (
              <div className="text-center mt-10">
                <ActivityOrb emoji="🌙" />

                <h2 className="text-2xl font-black mt-8">
                  Time to slow down
                </h2>

                <p className="text-muted mt-3">
                  Move through a few simple steps to create
                  a calmer transition toward rest.
                </p>

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-7"
                  onClick={() => setWindDownStarted(true)}
                >
                  🌙 Begin Wind-Down
                </button>
              </div>
            ) : (
              <div className="mt-10 text-center">
                <ActivityOrb emoji={currentStep.icon} />

                <p className="text-sm font-bold text-accent uppercase tracking-wider mt-7">
                  Step {windDownStep + 1} of {windDownSteps.length}
                </p>

                <h2 className="text-3xl font-black mt-2">
                  {currentStep.title}
                </h2>

                <p className="text-muted mt-4">
                  {currentStep.description}
                </p>

                <ProgressBar progress={progress} />

                <div className="flex justify-center gap-2 mt-5">
                  {windDownSteps.map((_, index) => (
                    <StepDot
                      key={index}
                      active={index <= windDownStep}
                    />
                  ))}
                </div>

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-8"
                  onClick={() => {
                    if (isLast) {
                      handleComplete();
                    } else {
                      setWindDownStep((step) => step + 1);
                    }
                  }}
                  disabled={completing}
                >
                  {isLast
                    ? completing
                      ? 'Saving...'
                      : '✓ Complete Wind-Down'
                    : '✓ Done — Next Step'}
                </button>
              </div>
            )}
          </div>

          <Instructions instructions={activity.instructions} />
        </div>
      </section>
    );
  }

  /*
   * FOCUS
   */
  if (activity.activity_type === 'focus') {
    const focusProgress =
      focusDuration > 0
        ? ((focusDuration - focusRemaining) / focusDuration) * 100
        : 0;

    const focusComplete = focusRemaining === 0;

    return (
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            className="neo-btn mb-8"
            onClick={onBack}
          >
            ← Back to Tasks
          </button>

          <div className="neo-card text-center">
            <ActivityHeader
              title={activity.title}
              description={activity.description}
            />

            {!focusStarted ? (
              <div className="mt-10">
                <ActivityOrb emoji="🎯" />

                <h2 className="text-2xl font-black mt-8">
                  Choose your focus session
                </h2>

                <div className="flex flex-wrap justify-center gap-3 mt-7">
                  {focusPresets.map((preset) => (
                    <button
                      key={preset.minutes}
                      type="button"
                      className={`neo-btn ${
                        focusDuration === preset.minutes * 60
                          ? 'neo-btn-primary'
                          : ''
                      }`}
                      onClick={() => {
                        setFocusDuration(preset.minutes * 60);
                        setFocusRemaining(preset.minutes * 60);
                      }}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-7"
                  onClick={() => {
                    setFocusStarted(true);
                    setFocusRunning(true);
                  }}
                >
                  ▶ Start Focus
                </button>
              </div>
            ) : (
              <div className="mt-10">
                <ActivityOrb emoji={focusComplete ? '🏆' : '🎯'} />

                <div className="neo-inset mt-8">
                  <div className="neo-score-value text-accent">
                    {formatTime(focusRemaining)}
                  </div>

                  <p className="text-muted mt-3">
                    {focusComplete
                      ? 'Focus session complete'
                      : focusRunning
                      ? 'Stay focused'
                      : 'Focus session paused'}
                  </p>

                  <ProgressBar progress={focusProgress} />
                </div>

                <div className="flex flex-wrap justify-center gap-4 mt-8">
                  {!focusComplete && !focusRunning && (
                    <button
                      type="button"
                      className="neo-btn neo-btn-primary"
                      onClick={() => setFocusRunning(true)}
                    >
                      ▶ Resume
                    </button>
                  )}

                  {!focusComplete && focusRunning && (
                    <button
                      type="button"
                      className="neo-btn"
                      onClick={() => setFocusRunning(false)}
                    >
                      ⏸ Pause
                    </button>
                  )}

                  <button
                    type="button"
                    className="neo-btn neo-btn-primary"
                    disabled={completing}
                    onClick={handleComplete}
                  >
                    {completing
                      ? 'Saving...'
                      : '✓ Complete Focus'}
                  </button>
                </div>
              </div>
            )}
          </div>

          <Instructions instructions={activity.instructions} />
        </div>
      </section>
    );
  }

  /*
   * HYDRATION
   */
  if (activity.activity_type === 'hydration') {
    const waterProgress = (waterCount / waterGoal) * 100;
    const hydrationComplete = waterCount >= waterGoal;

    return (
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            className="neo-btn mb-8"
            onClick={onBack}
          >
            ← Back to Tasks
          </button>

          <div className="neo-card text-center">
            <ActivityHeader
              title={activity.title}
              description={activity.description}
            />

            <div className="mt-10">
              <ActivityOrb
                emoji={hydrationComplete ? '💦' : '💧'}
              />

              <h2 className="text-2xl font-black mt-8">
                Hydration Check
              </h2>

              <p className="text-muted mt-3">
                Track a few glasses of water during this
                activity.
              </p>

              <div className="neo-inset mt-8 p-6">
                <div className="text-4xl font-black text-accent">
                  {waterCount} / {waterGoal}
                </div>

                <p className="text-muted mt-2">
                  glasses checked
                </p>

                <ProgressBar progress={waterProgress} />
              </div>

              <div className="flex justify-center gap-3 flex-wrap mt-8">
                {Array.from({ length: waterGoal }).map(
                  (_, index) => (
                    <button
                      key={index}
                      type="button"
                      aria-label={`Water ${index + 1}`}
                      className={`neo-inset-sm w-12 h-12 text-2xl transition-transform hover:scale-110 ${
                        index < waterCount
                          ? 'scale-110'
                          : 'opacity-50'
                      }`}
                      onClick={() =>
                        setWaterCount(index + 1)
                      }
                    >
                      💧
                    </button>
                  )
                )}
              </div>

              <button
                type="button"
                className="neo-btn neo-btn-primary mt-8"
                disabled={!hydrationComplete || completing}
                onClick={handleComplete}
              >
                {completing
                  ? 'Saving...'
                  : hydrationComplete
                  ? '✓ Complete Hydration Check'
                  : 'Check all 5 glasses'}
              </button>
            </div>
          </div>

          <Instructions instructions={activity.instructions} />
        </div>
      </section>
    );
  }

  /*
   * SOCIAL
   */
  if (activity.activity_type === 'social') {
    const choices = [
      'I feel connected',
      'I could use some connection',
      'I want to talk to someone',
    ];

    return (
      <section className="px-4 sm:px-6 py-12">
        <div className="mx-auto max-w-3xl">
          <button
            type="button"
            className="neo-btn mb-8"
            onClick={onBack}
          >
            ← Back to Tasks
          </button>

          <div className="neo-card text-center">
            <ActivityHeader
              title={activity.title}
              description={activity.description}
            />

            {!socialStarted ? (
              <div className="mt-10">
                <ActivityOrb emoji="🧑‍🤝‍🧑" />

                <h2 className="text-2xl font-black mt-8">
                  Quick connection check
                </h2>

                <p className="text-muted mt-3">
                  Take a moment to reflect on how connected
                  you feel right now.
                </p>

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-7"
                  onClick={() => setSocialStarted(true)}
                >
                  💬 Start Check-In
                </button>
              </div>
            ) : (
              <div className="mt-10">
                <ActivityOrb emoji="💬" />

                <h2 className="text-2xl font-black mt-8">
                  How are you feeling socially?
                </h2>

                <div className="grid gap-4 mt-7">
                  {choices.map((choice) => (
                    <button
                      key={choice}
                      type="button"
                      className={`neo-btn w-full ${
                        socialChoice === choice
                          ? 'neo-btn-primary'
                          : ''
                      }`}
                      onClick={() => setSocialChoice(choice)}
                    >
                      {choice}
                    </button>
                  ))}
                </div>

                {socialChoice && (
                  <div className="neo-inset mt-7 p-6">
                    <p className="font-bold">
                      Your check-in:
                    </p>

                    <p className="text-muted mt-2">
                      {socialChoice}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  className="neo-btn neo-btn-primary mt-8"
                  disabled={!socialChoice || completing}
                  onClick={handleComplete}
                >
                  {completing
                    ? 'Saving...'
                    : '✓ Complete Check-In'}
                </button>
              </div>
            )}
          </div>

          <Instructions instructions={activity.instructions} />
        </div>
      </section>
    );
  }

  /*
   * GENERIC FALLBACK
   */
  const totalSeconds = task.target * 60;

  const progress =
    totalSeconds > 0
      ? ((totalSeconds - secondsRemaining) / totalSeconds) * 100
      : 0;

  return (
    <section className="px-4 sm:px-6 py-12">
      <div className="mx-auto max-w-3xl">
        <button
          type="button"
          className="neo-btn mb-8"
          onClick={onBack}
        >
          ← Back to Tasks
        </button>

        <div className="neo-card text-center">
          <ActivityHeader
            title={activity.title}
            description={activity.description}
          />

          <div className="neo-inset mt-8">
            <div className="neo-score-value text-accent">
              {formatTime(secondsRemaining)}
            </div>

            <p className="text-muted mt-3">
              {secondsRemaining === 0
                ? 'Time complete'
                : isRunning
                ? 'Activity in progress'
                : 'Ready when you are'}
            </p>

            <ProgressBar progress={progress} />
          </div>

          <div className="flex flex-wrap justify-center gap-4 mt-8">
            {!isRunning && secondsRemaining > 0 && (
              <button
                type="button"
                className="neo-btn neo-btn-primary"
                onClick={() => setIsRunning(true)}
              >
                {secondsRemaining < totalSeconds
                  ? '▶ Resume'
                  : '▶ Start'}
              </button>
            )}

            {isRunning && (
              <button
                type="button"
                className="neo-btn"
                onClick={() => setIsRunning(false)}
              >
                ⏸ Pause
              </button>
            )}

            <button
              type="button"
              className="neo-btn"
              disabled={completing}
              onClick={handleComplete}
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

        <Instructions instructions={activity.instructions} />
      </div>
    </section>
  );
}

function ActivityHeader({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="text-center">
      <p className="text-sm font-bold text-accent uppercase tracking-wider">
        MindPulse Activity
      </p>

      <h1 className="text-3xl sm:text-4xl font-black mt-3">
        {title}
      </h1>

      <p className="text-muted mt-4 max-w-2xl mx-auto">
        {description}
      </p>
    </div>
  );
}

function ActivityOrb({ emoji }: { emoji: string }) {
  return (
    <div className="relative mx-auto w-36 h-36 flex items-center justify-center">
      <div className="absolute inset-0 rounded-full bg-accent/10 animate-pulse" />

      <div className="absolute inset-4 rounded-full border border-accent/20 animate-ping" />

      <div className="relative text-6xl animate-bounce">
        {emoji}
      </div>
    </div>
  );
}

function ProgressBar({ progress }: { progress: number }) {
  return (
    <div className="neo-loading-bar mt-8">
      <div
        className="neo-loading-bar-fill transition-all duration-500"
        style={{
          width: `${Math.min(100, Math.max(0, progress))}%`,
        }}
      />
    </div>
  );
}

function StepDot({ active }: { active: boolean }) {
  return (
    <div
      className={`w-3 h-3 rounded-full transition-all ${
        active
          ? 'bg-accent scale-110'
          : 'bg-muted/30'
      }`}
    />
  );
}

function Instructions({
  instructions,
}: {
  instructions: string[];
}) {
  return (
    <div className="neo-card mt-6">
      <h2 className="text-xl font-bold">
        Activity Instructions
      </h2>

      <ol className="mt-5 space-y-4">
        {instructions.map((instruction, index) => (
          <li
            key={index}
            className="flex gap-4 items-start"
          >
            <span className="neo-inset-sm shrink-0 w-9 h-9 flex items-center justify-center font-bold text-accent">
              {index + 1}
            </span>

            <span className="text-secondary pt-2">
              {instruction}
            </span>
          </li>
        ))}
      </ol>
    </div>
  );
}
