import { useEffect, useRef, useState } from 'react';
import { TasksSection } from '@/components/TasksSection';
import { ActivityPage } from '@/components/ActivityPage';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PredictionForm } from '@/components/PredictionForm';
import { HistorySection } from '@/components/HistorySection';
import { AboutSection } from '@/components/AboutSection';
import { AuthPage } from '@/components/AuthPage';
import { MobilePlanPage } from '@/components/MobilePlanPage';
import { Chatbot } from '@/components/Chatbot';
import StressAssessment from '@/components/StressAssessment';

interface User {
  id: string;
  name: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [historyKey, setHistoryKey] = useState(0);

  const [selectedTask, setSelectedTask] =
    useState<null | import('@/types').WellbeingTask>(null);

  const [showStressAssessment, setShowStressAssessment] =
    useState(false);

  const predictRef = useRef<HTMLDivElement>(null);

  const planMatch =
    window.location.pathname.match(/^\/plan\/([^/]+)$/);

  if (planMatch) {
    return <MobilePlanPage planToken={planMatch[1]} />;
  }

  useEffect(() => {
    const savedUser =
      localStorage.getItem('mindpulse_user');

    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch {
        localStorage.removeItem('mindpulse_user');
        localStorage.removeItem('mindpulse_token');
      }
    }
  }, []);

  function handleLogin(
    token: string,
    loggedInUser: User
  ) {
    localStorage.setItem(
      'mindpulse_token',
      token
    );

    localStorage.setItem(
      'mindpulse_user',
      JSON.stringify(loggedInUser)
    );

    setUser(loggedInUser);
  }

  function handleRegister(
    token: string,
    registeredUser: User
  ) {
    localStorage.setItem(
      'mindpulse_token',
      token
    );

    localStorage.setItem(
      'mindpulse_user',
      JSON.stringify(registeredUser)
    );

    setUser(registeredUser);
  }

  function handleLogout() {
    localStorage.removeItem('mindpulse_token');
    localStorage.removeItem('mindpulse_user');

    setUser(null);
  }

  function scrollToPredict() {
    predictRef.current?.scrollIntoView({
      behavior: 'smooth',
      block: 'start',
    });
  }

  function handlePredictionSaved() {
    setHistoryKey((k) => k + 1);
  }

  /*
   * Authentication
   *
   * AuthPage handles the animated
   * Login <-> Register transition.
   */
  if (!user) {
    return (
      <AuthPage
        onLogin={handleLogin}
        onRegister={handleRegister}
      />
    );
  }

  /*
   * Activity page
   */
  if (selectedTask) {
    return (
      <div
        className="min-h-screen"
        style={{
          backgroundColor: 'var(--neo-bg)',
        }}
      >
        <Header
          user={user}
          onLogout={handleLogout}
        />

        <ActivityPage
          task={selectedTask}
          onBack={() => setSelectedTask(null)}
          onCompleted={() => setSelectedTask(null)}
        />
      </div>
    );
  }

  /*
   * Main dashboard
   */
  return (
    <div
      className="min-h-screen"
      style={{
        backgroundColor: 'var(--neo-bg)',
      }}
    >
      <Header
        user={user}
        onLogout={handleLogout}
      />

      <Hero onStart={scrollToPredict} />

      <div ref={predictRef}>
        {!showStressAssessment ? (
          <>
            {/* Existing prediction form */}
            <PredictionForm
              onPredictionSaved={handlePredictionSaved}
            />

            {/* Stress assessment entry point */}
            <div className="mx-auto max-w-4xl px-4 pb-8 sm:px-6">
              <div className="neo-card-sm text-center">
                <h2 className="text-xl font-bold text-primary">
                  Want a more structured stress input?
                </h2>

                <p className="mx-auto mt-2 max-w-2xl text-sm leading-6 text-secondary">
                  Complete the stress assessment to get a
                  structured stress score based on your
                  responses over the past week.
                </p>

                <button
                  type="button"
                  onClick={() =>
                    setShowStressAssessment(true)
                  }
                  className="neo-btn neo-btn-primary mt-5"
                >
                  Take Stress Assessment
                </button>
              </div>
            </div>
          </>
        ) : (
          /* Stress assessment */
          <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
            <StressAssessment
              onComplete={(result) => {
                console.log(
                  'Stress assessment result:',
                  result
                );
              }}
              onCancel={() =>
                setShowStressAssessment(false)
              }
            />
          </div>
        )}
      </div>

      <HistorySection key={historyKey} />

      <TasksSection
        refreshKey={historyKey}
        onStartActivity={(task) => {
          setSelectedTask(task);
        }}
      />

      <AboutSection />

      <Chatbot />

      <footer className="px-4 py-8 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <hr className="neo-divider" />

          <div className="text-center">
            <p className="text-sm text-muted">
              <strong className="text-secondary">
                MindPulse
              </strong>{' '}
              — Built with React, Vite & Machine Learning
            </p>

            <p className="mt-1 text-xs text-muted">
              &copy; {new Date().getFullYear()} MindPulse.
              All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;