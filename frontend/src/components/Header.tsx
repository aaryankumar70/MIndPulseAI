import { Brain } from 'lucide-react';

export function Header() {
  return (
    <header className="sticky top-0 z-50 px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="neo-card-sm flex items-center justify-between !py-3 !px-5">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="neo-inset-sm !p-2 rounded-xl">
                <Brain className="w-6 h-6 text-accent" strokeWidth={2.5} />
              </div>
            </div>
            <div>
              <h1 className="text-lg font-extrabold text-primary tracking-tight">MindPulse</h1>
              <p className="text-xs text-muted -mt-0.5">Student Mental Health Prediction</p>
            </div>
          </div>
          <nav className="hidden sm:flex items-center gap-2">
            <a href="#predict" className="neo-segment-option text-secondary hover:text-primary transition-colors">
              Predict
            </a>
            <a href="#history" className="neo-segment-option text-secondary hover:text-primary transition-colors">
              History
            </a>
            <a href="#about" className="neo-segment-option text-secondary hover:text-primary transition-colors">
              About
            </a>
          </nav>
        </div>
      </div>
    </header>
  );
}
