import { useState, useRef } from 'react';
import { Header } from '@/components/Header';
import { Hero } from '@/components/Hero';
import { PredictionForm } from '@/components/PredictionForm';
import { HistorySection } from '@/components/HistorySection';
import { AboutSection } from '@/components/AboutSection';

function App() {
  const [historyKey, setHistoryKey] = useState(0);
  const predictRef = useRef<HTMLDivElement>(null);

  function scrollToPredict() {
    predictRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handlePredictionSaved() {
    setHistoryKey(k => k + 1);
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: 'var(--neo-bg)' }}>
      <Header />
      <Hero onStart={scrollToPredict} />
      <div ref={predictRef}>
        <PredictionForm onPredictionSaved={handlePredictionSaved} />
      </div>
      <HistorySection key={historyKey} />
      <AboutSection />
      <footer className="px-4 sm:px-6 py-8">
        <div className="mx-auto max-w-4xl">
          <hr className="neo-divider" />
          <div className="text-center">
            <p className="text-sm text-muted">
              <strong className="text-secondary">MindPulse</strong> — Built with React, Vite & Machine Learning
            </p>
            <p className="text-xs text-muted mt-1">
              Model Accuracy: R² = 0.87 · Random Forest Pipeline · For educational purposes only
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
