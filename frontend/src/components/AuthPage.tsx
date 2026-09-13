
import { useState } from 'react';
import {
  Activity,
  Brain,
  CheckCircle2,
  Lock,
  Mail,
  Sparkles,
  User,
  ArrowRight,
  Eye,
  EyeOff,
} from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface AuthPageProps {
  onLogin: (token: string, user: UserData) => void;
  onRegister: (token: string, user: UserData) => void;
}

export function AuthPage({
  onLogin,
  onRegister,
}: AuthPageProps) {
  const [isRegister, setIsRegister] = useState(false);

  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState('');

  const [registerName, setRegisterName] = useState('');
  const [registerEmail, setRegisterEmail] = useState('');
  const [registerPassword, setRegisterPassword] = useState('');
  const [showRegisterPassword, setShowRegisterPassword] = useState(false);
  const [registerLoading, setRegisterLoading] = useState(false);
  const [registerError, setRegisterError] = useState('');

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();

    setLoginError('');
    setLoginLoading(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        'http://127.0.0.1:8000';

      const response = await fetch(
        `${apiUrl}/auth/login`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            email: loginEmail,
            password: loginPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem(
        'mindpulse_token',
        data.access_token
      );

      localStorage.setItem(
        'mindpulse_user',
        JSON.stringify(data.user)
      );

      onLogin(data.access_token, data.user);
    } catch (err) {
      setLoginError(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      );
    } finally {
      setLoginLoading(false);
    }
  }

  async function handleRegister(e: React.FormEvent) {
    e.preventDefault();

    setRegisterError('');
    setRegisterLoading(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        'http://127.0.0.1:8000';

      const response = await fetch(
        `${apiUrl}/auth/register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: registerName,
            email: registerEmail,
            password: registerPassword,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(
          data.detail || 'Registration failed'
        );
      }

      localStorage.setItem(
        'mindpulse_token',
        data.access_token
      );

      localStorage.setItem(
        'mindpulse_user',
        JSON.stringify(data.user)
      );

      onRegister(data.access_token, data.user);
    } catch (err) {
      setRegisterError(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      );
    } finally {
      setRegisterLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen relative overflow-hidden"
      style={{
        backgroundColor: 'var(--neo-bg)',
      }}
    >
      {/* Ambient background */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        

        <div
          className="absolute -bottom-48 -right-40 w-[29rem] h-[25rem] rounded-full opacity-30 blur-3xl animate-pulse"
          style={{
            backgroundColor: 'var(--neo-accent-lessdark)',
            animationDelay: '1s',
          }}
        />

        <div className="absolute inset-0 opacity-[0.025] bg-[radial-gradient(circle_at_1px_1px,currentColor_1px,transparent_0)] [background-size:24px_24px]" />
      </div>

      {/* Desktop auth shell */}
      <div className="relative min-h-screen flex items-center justify-center px-4 py-4 sm:px-6 lg:py-3">
        <div className="w-full max-w-[1400px]">
          <div className="relative h-[calc(100vh-2rem)] min-h-[620px] max-h-[760px] overflow-hidden rounded-[2rem]">

            {/* =====================================================
                LEFT CONTENT PANEL
            ====================================================== */}
            <div
              className="
                hidden lg:block
                absolute inset-y-0 left-0
                w-1/2
                px-8 xl:px-10
              "
            >
              {/* FIXED BRAND — this never moves when switching modes */}
              <div className="absolute top-9 left-8 xl:left-10 z-30 flex items-center gap-3">
                <div
                  className="neo-card-sm !p-0 rounded-2xl shrink-0 flex items-center justify-center animate-[mpGlow_4s_ease-in-out_infinite]"
                  style={{
                    width: '3.25rem',
                    height: '3.25rem',
                    minWidth: '3.25rem',
                  }}
                >
                  <Brain
                    className="w-6 h-6 text-accent shrink-0"
                    strokeWidth={2.5}
                  />
                </div>

                <div>
                  <h1 className="text-2xl font-extrabold text-primary tracking-tight">
                    MindPulse
                  </h1>
                  <p className="text-xs text-muted tracking-wider uppercase">
                    Student Well-being
                  </p>
                </div>
              </div>

              {/* ONLY THE CONTENT BELOW THE BRAND MOVES */}
              <div className="absolute left-8 right-0 xl:left-10 xl:right-0 top-[8.5rem] bottom-6">
                {/* Login content */}
                <div
                  className={`
                    absolute inset-x-0 top-0
                    transition-all duration-500
                    ease-[cubic-bezier(0.77,0,0.18,1)]
                    ${
                      isRegister
                        ? 'opacity-0 -translate-x-12 pointer-events-none'
                        : 'opacity-100 translate-x-0'
                    }
                  `}
                >
                  <div className="inline-flex items-center gap-2 text-accent text-sm font-semibold mb-4">
                    <Sparkles className="w-4 h-4" />
                    Understand. Reflect. Improve.
                  </div>

                  <h2 className="text-4xl xl:text-[3rem] font-extrabold text-primary leading-[1.08] tracking-tight">
                    A smarter way to understand your{' '}
                    <span className="text-accent">
                      well-being.
                    </span>
                  </h2>

                  <p className="text-muted text-base xl:text-lg leading-relaxed mt-5 max-w-xl">
                    MindPulseAI turns your everyday student
                    habits into meaningful insights, personalized
                    activities, and practical next steps.
                  </p>

                  <div className="space-y-3.5 mt-7">
                    <Feature
                      icon={<CheckCircle2 className="w-5 h-5 text-accent" />}
                      title="Personalized prediction"
                      description="See how your reported habits relate to your predicted well-being score."
                    />

                    <Feature
                      icon={<Activity className="w-5 h-5 text-accent" />}
                      title="Actionable activities"
                      description="Get practical activities based on your current MindPulse assessment."
                    />

                    <Feature
                      icon={<Sparkles className="w-5 h-5 text-accent" />}
                      title="MindPulse Companion"
                      description="Ask questions and explore your results with your AI companion."
                    />
                  </div>
                </div>

                {/* Register content */}
                <div
                  className={`
                    absolute inset-x-0 top-0
                    transition-all duration-500
                    ease-[cubic-bezier(0.77,0,0.18,1)]
                    ${
                      isRegister
                        ? 'opacity-100 translate-x-0'
                        : 'opacity-0 translate-x-12 pointer-events-none'
                    }
                  `}
                >
                  <div className="inline-flex items-center gap-2 text-accent text-sm font-semibold mb-4">
                    <Sparkles className="w-4 h-4" />
                    Start your MindPulse journey
                  </div>

                  <h2 className="text-4xl xl:text-[3rem] font-extrabold text-primary leading-[1.08] tracking-tight">
                    Understand your habits.{' '}
                    <span className="text-accent">
                      Understand yourself.
                    </span>
                  </h2>

                  <p className="text-muted text-base xl:text-lg leading-relaxed mt-5 max-w-xl">
                    Create your MindPulse account and turn your
                    everyday student habits into meaningful
                    insights and practical next steps.
                  </p>

                  <div className="space-y-3.5 mt-7">
                    <Feature
                      icon={<CheckCircle2 className="w-5 h-5 text-accent" />}
                      title="Personalized insights"
                      description="Explore a prediction based on the habits and information you report."
                    />

                    <Feature
                      icon={<Activity className="w-5 h-5 text-accent" />}
                      title="Practical activities"
                      description="Receive activities designed around your current MindPulse results."
                    />

                    <Feature
                      icon={<Sparkles className="w-5 h-5 text-accent" />}
                      title="AI-powered companion"
                      description="Ask questions about your MindPulse results, habits, and plan."
                    />
                  </div>
                </div>

                
              </div>
            </div>

            {/* =====================================================
                RIGHT FORM PANEL
            ====================================================== */}
            <div
              className="
                absolute inset-y-0 right-0
                w-full lg:w-1/2
                flex items-center justify-center
                px-4 sm:px-7 lg:px-9
              "
            >
              <div className="w-full max-w-md">

                {/* Mobile brand */}
                <div className="lg:hidden text-center mb-7">
                  <div className="flex justify-center mb-4">
                    <div
                      className="neo-card-sm !p-0 rounded-2xl shrink-0 flex items-center justify-center"
                      style={{ width: '3.5rem', height: '3.5rem' }}
                    >
                      <Brain
                        className="w-7 h-7 text-accent shrink-0"
                        strokeWidth={2.5}
                      />
                    </div>
                  </div>

                  <h1 className="text-3xl font-extrabold text-primary tracking-tight">
                    MindPulse
                  </h1>

                  <p className="text-sm text-muted mt-2">
                    Student well-being, made actionable.
                  </p>
                </div>

                {/* Login form */}
                <div
                  className={`
                    transition-all duration-500
                    ${
                      isRegister
                        ? 'opacity-0 -translate-x-10 pointer-events-none absolute'
                        : 'opacity-100 translate-x-0 relative'
                    }
                  `}
                >
                  <div className="neo-card">
                    <div className="mb-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-primary">
                            Welcome back
                          </h2>

                          <p className="text-sm text-muted mt-1.5">
                            Sign in to continue your journey.
                          </p>
                        </div>

                        <div className="hidden sm:flex neo-inset-sm !p-2.5 rounded-xl">
                          <Lock className="w-4 h-4 text-accent" />
                        </div>
                      </div>
                    </div>

                    <form
                      onSubmit={handleLogin}
                      className="space-y-4"
                    >
                      <div className="neo-input-wrap">
                        <label className="neo-label">
                          <Mail className="w-4 h-4" />
                          Email
                        </label>

                        <input
                          type="email"
                          className="neo-input"
                          placeholder="you@example.com"
                          value={loginEmail}
                          onChange={(e) =>
                            setLoginEmail(e.target.value)
                          }
                          required
                          autoComplete="email"
                        />
                      </div>

                      <div className="neo-input-wrap">
                        <label className="neo-label">
                          <Lock className="w-4 h-4" />
                          Password
                        </label>

                        <div className="relative">
                          <input
                            type={showLoginPassword ? 'text' : 'password'}
                            className="neo-input pr-12"
                            placeholder="••••••••"
                            value={loginPassword}
                            onChange={(e) =>
                              setLoginPassword(e.target.value)
                            }
                            required
                            autoComplete="current-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowLoginPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                            aria-label={showLoginPassword ? 'Hide password' : 'Show password'}
                          >
                            {showLoginPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {loginError && (
                        <div className="neo-inset-sm !p-3.5">
                          <p className="text-sm text-error">
                            {loginError}
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="neo-btn neo-btn-primary w-full"
                        disabled={loginLoading}
                      >
                        {loginLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Signing in...
                          </span>
                        ) : (
                          <>
                            Sign in
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-5 pt-4 border-t border-[var(--neo-bg-dark)] text-center">
                      <p className="text-sm text-muted transition-colors duration-500 hover:text-accent">
                        Don't have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setIsRegister(true)}
                          className="font-bold text-accent hover:text-[var(--neo-accent-dark)] transition-colors"
                        >
                          Create one
                        </button>
                      </p>
                    </div>
                  </div>

                  <Disclaimer />
                </div>

                {/* Register form */}
                <div
                  className={`
                    transition-all duration-500
                    ${
                      isRegister
                        ? 'opacity-100 translate-x-0 relative'
                        : 'opacity-0 translate-x-10 pointer-events-none absolute'
                    }
                  `}
                >
                  <div className="neo-card">
                    <div className="mb-5">
                      <div className="flex items-center justify-between gap-4">
                        <div>
                          <h2 className="text-2xl font-bold text-primary">
                            Create your account
                          </h2>

                          <p className="text-sm text-muted mt-1.5">
                            Start your MindPulse journey.
                          </p>
                        </div>

                        <div className="hidden sm:flex neo-inset-sm !p-2.5 rounded-xl">
                          <User className="w-4 h-4 text-accent" />
                        </div>
                      </div>
                    </div>

                    <form
                      onSubmit={handleRegister}
                      className="space-y-4"
                    >
                      <div className="neo-input-wrap">
                        <label className="neo-label">
                          <User className="w-4 h-4" />
                          Name
                        </label>

                        <input
                          type="text"
                          className="neo-input"
                          placeholder="Your name"
                          value={registerName}
                          onChange={(e) =>
                            setRegisterName(e.target.value)
                          }
                          required
                          minLength={2}
                          maxLength={100}
                          autoComplete="name"
                        />
                      </div>

                      <div className="neo-input-wrap">
                        <label className="neo-label">
                          <Mail className="w-4 h-4" />
                          Email
                        </label>

                        <input
                          type="email"
                          className="neo-input"
                          placeholder="you@example.com"
                          value={registerEmail}
                          onChange={(e) =>
                            setRegisterEmail(e.target.value)
                          }
                          required
                          autoComplete="email"
                        />
                      </div>

                      <div className="neo-input-wrap">
                        <label className="neo-label">
                          <Lock className="w-4 h-4" />
                          Password
                        </label>

                        <div className="relative">
                          <input
                            type={showRegisterPassword ? 'text' : 'password'}
                            className="neo-input pr-12"
                            placeholder="At least 6 characters"
                            value={registerPassword}
                            onChange={(e) =>
                              setRegisterPassword(e.target.value)
                            }
                            required
                            minLength={6}
                            maxLength={72}
                            autoComplete="new-password"
                          />
                          <button
                            type="button"
                            onClick={() => setShowRegisterPassword((value) => !value)}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-accent transition-colors"
                            aria-label={showRegisterPassword ? 'Hide password' : 'Show password'}
                          >
                            {showRegisterPassword ? (
                              <EyeOff className="w-5 h-5" />
                            ) : (
                              <Eye className="w-5 h-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {registerError && (
                        <div className="neo-inset-sm !p-3.5">
                          <p className="text-sm text-error">
                            {registerError}
                          </p>
                        </div>
                      )}

                      <button
                        type="submit"
                        className="neo-btn neo-btn-primary w-full"
                        disabled={registerLoading}
                      >
                        {registerLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                            Creating account...
                          </span>
                        ) : (
                          <>
                            Create account
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </form>

                    <div className="mt-5 pt-4 border-t border-[var(--neo-bg-dark)] text-center">
                      <p className="text-sm text-muted">
                        Already have an account?{' '}
                        <button
                          type="button"
                          onClick={() => setIsRegister(false)}
                          className="font-bold text-accent hover:text-[var(--neo-accent-dark)] transition-colors"
                        >
                          Sign in
                        </button>
                      </p>
                    </div>
                  </div>

                  <Disclaimer />
                </div>
              </div>
            </div>

            {/* =====================================================
                MOBILE CONTENT
            ====================================================== */}
            <div className="lg:hidden pt-4">
              {/* Mobile forms are handled by the right panel above */}
            </div>
          </div>
        </div>
      </div>

      
    </div>
  );
}

function Feature({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="group flex items-start gap-3">
      <div className="mt-0.5 shrink-0">
        {icon}
      </div>

      <div>
        <p className="font-bold text-primary text-sm">
          {title}
        </p>

        <p className="text-muted text-sm mt-0.5">
          {description}
        </p>
      </div>
    </div>
  );
}

function Disclaimer() {
  return (
    <p className="text-xs text-muted text-center mt-3 px-4 leading-relaxed">
      MindPulse provides wellness insights and is not a
      substitute for professional medical advice.
    </p>
  );
}
