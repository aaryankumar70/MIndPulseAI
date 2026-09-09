
import { Brain, LogOut, User } from 'lucide-react';

interface UserData {
  id: string;
  name: string;
  email: string;
}

interface HeaderProps {
  user: UserData;
  onLogout: () => void;
}

export function Header({ user, onLogout }: HeaderProps) {
  return (
    <header className="sticky top-0 z-50 px-4 py-4 sm:px-6">
      <div className="mx-auto max-w-6xl">
        <div className="neo-card-sm flex items-center justify-between !py-3 !px-5">

          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="neo-inset-sm !p-2 rounded-xl">
                <Brain
                  className="w-6 h-6 text-accent"
                  strokeWidth={2.5}
                />
              </div>
            </div>

            <div>
              <h1 className="text-lg font-extrabold text-primary tracking-tight">
                MindPulse
              </h1>

              <p className="text-xs text-muted -mt-0.5">
                Student Mental Health Prediction
              </p>
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-2">

            {/* Navigation */}
            <nav className="hidden sm:flex items-center gap-2">
              <a
                href="#predict"
                className="
                  neo-segment-option
                  text-secondary
                  transition-all
                  duration-200
                  ease-out
                  hover:-translate-y-0.5
                  hover:text-accent
                  hover:shadow-[4px_4px_8px_var(--neo-dark),-4px_-4px_8px_var(--neo-light)]
                  active:translate-y-0
                "
              >
                Predict
              </a>

              <a
                href="#history"
                className="
                  neo-segment-option
                  text-secondary
                  transition-all
                  duration-200
                  ease-out
                  hover:-translate-y-0.5
                  hover:text-accent
                  hover:shadow-[4px_4px_8px_var(--neo-dark),-4px_-4px_8px_var(--neo-light)]
                  active:translate-y-0
                "
              >
                History
              </a>

              <a
                href="#about"
                className="
                  neo-segment-option
                  text-secondary
                  transition-all
                  duration-200
                  ease-out
                  hover:-translate-y-0.5
                  hover:text-accent
                  hover:shadow-[4px_4px_8px_var(--neo-dark),-4px_-4px_8px_var(--neo-light)]
                  active:translate-y-0
                "
              >
                About
              </a>
            </nav>

            {/* User profile */}
            <div className="flex items-center gap-2 ml-2">

              <div
                className="
                  hidden sm:flex
                  items-center
                  gap-2
                  neo-inset-sm
                  !px-3
                  !py-2
                  transition-all
                  duration-200
                  ease-out
                  hover:-translate-y-0.5
                  hover:shadow-[4px_4px_8px_var(--neo-dark),-4px_-4px_8px_var(--neo-light)]
                "
              >
                <User className="w-4 h-4 text-accent" />

                <div className="leading-tight">
                  <p className="text-xs font-bold text-primary">
                    {user.name}
                  </p>

                  <p className="text-[10px] text-muted">
                    {user.email}
                  </p>
                </div>
              </div>

              {/* Logout */}
              <button
                type="button"
                onClick={onLogout}
                title="Sign out"
                className="
                  neo-btn
                  !px-3
                  !py-2
                  transition-all
                  duration-200
                  ease-out
                  hover:-translate-y-0.5
                  hover:text-accent
                  hover:shadow-[5px_5px_10px_var(--neo-dark),-5px_-5px_10px_var(--neo-light)]
                  active:translate-y-0
                  active:shadow-[inset_3px_3px_6px_var(--neo-dark),inset_-3px_-3px_6px_var(--neo-light)]
                "
              >
                <LogOut className="w-4 h-4" />

                <span className="hidden sm:inline">
                  Logout
                </span>
              </button>

            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
