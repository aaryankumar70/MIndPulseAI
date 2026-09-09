import { useState } from 'react';
import { Brain, Mail, Lock, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (token: string, user: { id: string; name: string; email: string }) => void;
  onRegister: () => void;
}

export function LoginPage({ onLogin, onRegister }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    setError('');
    setLoading(true);

    try {
      const apiUrl =
        import.meta.env.VITE_API_URL ||
        'http://127.0.0.1:8000';

      const response = await fetch(`${apiUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || 'Login failed');
      }

      localStorage.setItem('mindpulse_token', data.access_token);
      localStorage.setItem(
        'mindpulse_user',
        JSON.stringify(data.user)
      );

      onLogin(data.access_token, data.user);

    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : 'Something went wrong'
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="min-h-screen flex items-center justify-center px-4 py-10"
      style={{ backgroundColor: 'var(--neo-bg)' }}
    >
      <div className="w-full max-w-md">

        {/* Logo */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-5">
            <div className="neo-card-sm !p-3 rounded-2xl">
              <Brain
                className="w-8 h-8 text-accent"
                strokeWidth={2.5}
              />
            </div>
          </div>

          <h1 className="text-3xl font-extrabold text-primary tracking-tight">
            MindPulse
          </h1>

          <p className="text-sm text-muted mt-2">
            Your personal mental wellness companion
          </p>
        </div>

        {/* Login Card */}
        <div className="neo-card">

          <div className="mb-7">
            <h2 className="text-xl font-bold text-primary">
              Welcome back
            </h2>

            <p className="text-sm text-muted mt-1">
              Sign in to continue your journey.
            </p>
          </div>

          <form
            onSubmit={handleSubmit}
            className="space-y-5"
          >

            {/* Email */}
            <div className="neo-input-wrap">
              <label className="neo-label">
                <Mail className="w-4 h-4" />
                Email
              </label>

              <input
                type="email"
                className="neo-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            {/* Password */}
            <div className="neo-input-wrap">
              <label className="neo-label">
                <Lock className="w-4 h-4" />
                Password
              </label>

              <input
                type="password"
                className="neo-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {/* Error */}
            {error && (
              <div className="neo-inset-sm !p-3">
                <p className="text-sm text-error">
                  {error}
                </p>
              </div>
            )}

            {/* Submit */}
            <button
              type="submit"
              className="neo-btn neo-btn-primary w-full"
              disabled={loading}
            >
              {loading ? (
                'Signing in...'
              ) : (
                <>
                  Sign in
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

          </form>

          {/* Register */}
          <div className="mt-7 pt-6 border-t border-[var(--neo-bg-dark)] text-center">
            <p className="text-sm text-muted">
              Don't have an account?{' '}
              <button
                type="button"
                onClick={onRegister}
                className="font-bold text-accent hover:text-[var(--neo-accent-dark)] transition-colors"
              >
                Create one
              </button>
            </p>
          </div>

        </div>

        {/* Disclaimer */}
        <p className="text-xs text-muted text-center mt-6 px-4">
          MindPulse provides wellness insights and is not a
          substitute for professional medical advice.
        </p>

      </div>
    </div>
  );
}