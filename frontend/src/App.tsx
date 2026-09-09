import { useEffect, useRef, useState } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PredictionForm } from '@/components/PredictionForm';
import { HistorySection } from '@/components/HistorySection';
import { AboutSection } from '@/components/AboutSection';
import { LoginPage } from '@/components/LoginPage';
import { RegisterPage } from '@/components/RegisterPage';

interface User {
  id: string;
  name: string;
  email: string;
}

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [authPage, setAuthPage] = useState<'login' | 'register'>('login');
  const [historyKey, setHistoryKey] = useState(0);
  const predictRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const savedUser = localStorage.getItem('mindpulse_user');

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
    localStorage.setItem('mindpulse_token', token);
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
    localStorage.setItem('mindpulse_token', token);
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
    setAuthPage('login');
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

  if (!user) {
    if (authPage === 'login') {
      return (
        <LoginPage
          onLogin={handleLogin}
          onRegister={() => setAuthPage('register')}
        />
      );
    }

    return (
      <RegisterPage
        onRegister={handleRegister}
        onLogin={() => setAuthPage('login')}
      />
    );
  }

  return (
    <div
      className="min-h-screen"
      style={{ backgroundColor: 'var(--neo-bg)' }}
    >
      <Header
        user={user}
        onLogout={handleLogout}
      />

      <Hero onStart={scrollToPredict} />

      <div ref={predictRef}>
        <PredictionForm
          onPredictionSaved={handlePredictionSaved}
        />
      </div>

      <HistorySection key={historyKey} />

      <AboutSection />

      <footer className="px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <hr className="neo-divider" />

          <div className="text-center">
            <p className="text-sm text-muted">
              <strong className="text-secondary">
                MindPulse
              </strong>{' '}
              — Built with React, Vite & Machine Learning
            </p>

            <p className="text-xs text-muted mt-1">
              &copy; {new Date().getFullYear()} MindPulse. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;