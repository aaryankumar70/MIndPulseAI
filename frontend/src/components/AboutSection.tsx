import { Info, Cpu, ShieldCheck } from 'lucide-react';

export function AboutSection() {
  return (
    <section id="about" className="px-4 sm:px-6 py-8">
      <div className="mx-auto max-w-4xl">
        <div className="text-center mb-6">
          <h2 className="text-2xl font-extrabold text-primary">About MindPulse</h2>
          <p className="text-sm text-muted mt-1">How it works and what it means</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="neo-card-sm">
            <div className="neo-inset-sm !p-2.5 rounded-xl inline-flex mb-3">
              <Info className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary mb-1">What is MindPulse?</h3>
            <p className="text-sm text-secondary leading-relaxed">
              An AI-powered tool that predicts student mental health scores based on
              social media habits, lifestyle, and stress levels.
            </p>
          </div>

          <div className="neo-card-sm">
            <div className="neo-inset-sm !p-2.5 rounded-xl inline-flex mb-3">
              <Cpu className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary mb-1">How it works</h3>
            <p className="text-sm text-secondary leading-relaxed">
              A Random Forest model trained on real student data analyzes your inputs
              and generates a mental health score from 0 to 10 with personalized recommendations.
            </p>
          </div>

          <div className="neo-card-sm">
            <div className="neo-inset-sm !p-2.5 rounded-xl inline-flex mb-3">
              <ShieldCheck className="w-5 h-5 text-accent" />
            </div>
            <h3 className="font-bold text-primary mb-1">Privacy & Safety</h3>
            <p className="text-sm text-secondary leading-relaxed">
              Your data is stored securely and used only for prediction. This tool is for
              educational purposes and is not a substitute for professional help.
            </p>
          </div>
        </div>

        <div className="neo-card mt-4 text-center">
          <p className="text-sm text-muted">
            Model Accuracy: R² = 0.87 · Random Forest Pipeline · For educational purposes only
          </p>
        </div>
      </div>
    </section>
  );
}
