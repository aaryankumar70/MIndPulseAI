import { useState } from 'react';
import { Brain, LogOut, User, ChevronDown } from 'lucide-react';

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
  const [showProfileMenu, setShowProfileMenu] = useState(false);

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

            {/* User profile toggle */}
            <div className="relative ml-2">
              <button
                type="button"
                onClick={() => setShowProfileMenu((open) => !open)}
                aria-expanded={showProfileMenu}
                aria-label="Open user menu"
                className="
                  hidden sm:flex
                  items-center
                  gap-2
                  neo-inset-sm
                  !px-3
                  !py-2
                  min-w-[8rem]
                  justify-center
                  transition-all
                  duration-200
                  ease-out
                  hover:-translate-y-0.5
                  hover:text-accent
                  hover:shadow-[4px_4px_8px_var(--neo-dark),-4px_-4px_8px_var(--neo-light)]
                  active:translate-y-0
                "
              >
                <User className="w-4 h-4 text-accent" />

                <p className="text-xs font-bold text-primary">
                  {user.name}
                </p>

                <ChevronDown
                  className={`w-4 h-4 text-muted transition-transform duration-200 ${
                    showProfileMenu ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Logout dropdown */}
              {showProfileMenu && (
                <div
                  className="
                    absolute
                    right-0
                    top-[calc(100%+0.75rem)]
                    w-40
                    neo-card-sm
                    !p-2
                    z-50
                  "
                >
                  <button
                    type="button"
                    onClick={onLogout}
                    className="
                      w-full
                      flex
                      items-center
                      gap-2
                      rounded-xl
                      !px-3
                      !py-2
                      text-sm
                      text-secondary
                      transition-all
                      duration-200
                      hover:text-accent
                      hover:bg-[var(--neo-bg-light)]
                      active:scale-[0.98]
                    "
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Logout</span>
                  </button>
                </div>
              )}
            </div>

          </div>
        </div>
      </div>
    </header>
  );
}
  