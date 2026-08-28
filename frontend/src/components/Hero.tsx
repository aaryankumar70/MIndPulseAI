import { Brain, ArrowDown, Activity } from 'lucide-react';

export function Hero({ onStart }: { onStart: () => void }) {
  return (
    <section className="px-4 sm:px-6 pt-8 pb-12">
      <div className="mx-auto max-w-4xl text-center">
        {/* Logo with glow */}
        <div className="relative inline-flex items-center justify-center mb-6 animate-fade-up">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-32 h-32 rounded-full border-2 border-indigo-400/30 animate-pulse-ring" />
          </div>
          <div className="neo-inset !p-6 rounded-full animate-logo-glow">
            <Brain className="w-12 h-12 text-accent" strokeWidth={2} />
          </div>
        </div>

        {/* Badge */}
        <div className="inline-block animate-fade-up delay-100 mb-4">
          <div className="neo-card-sm !py-2 !px-4 inline-flex items-center gap-2">
            <Activity className="w-4 h-4 text-accent" />
            <span className="text-xs font-semibold text-secondary tracking-widest uppercase">
              AI-Powered Analysis
            </span>
          </div>
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-primary tracking-tight mb-4 animate-fade-up delay-200">
          MindPulse
        </h1>

        {/* Tagline */}
        <p className="text-lg sm:text-xl text-secondary font-medium mb-3 animate-fade-up delay-300">
          Student Mental Health Prediction
        </p>

        {/* Description */}
        <p className="text-base text-muted max-w-2xl mx-auto leading-relaxed mb-8 animate-fade-up delay-400">
          Understand how your social media habits, lifestyle, and stress levels impact your
          mental well-being. Powered by Machine Learning with 87% accuracy.
        </p>

        {/* CTA */}
        <div className="animate-fade-up delay-500">
          <button
            onClick={onStart}
            className="neo-btn neo-btn-primary group"
            aria-label="Start your mental health prediction"
          >
            <span>Start Prediction</span>
            <ArrowDown className="w-5 h-5 group-hover:translate-y-0.5 transition-transform" />
          </button>
        </div>
      </div>
    </section>
  );
}
