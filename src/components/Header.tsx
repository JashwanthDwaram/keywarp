import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, BarChart3, Palette, Zap, Compass } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { soundEngine } from '../utils/soundEngine';

export interface HeaderProps {
  activeTab: 'arena' | 'coach' | 'analytics';
  onTabChange: (tab: 'arena' | 'coach' | 'analytics') => void;
  isZenActive: boolean;
  onOpenTour?: () => void;
  isCookieMode?: boolean;
  onToggleCookieMode?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isZenActive,
  onOpenTour,
  isCookieMode = false,
  onToggleCookieMode
}) => {
  const { currentTheme, setThemeId, availableThemes, enterCookieTheme, exitCookieTheme } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);
  const logoClickRef = useRef<{ count: number; lastTime: number }>({ count: 0, lastTime: 0 });

  const handleLogoClick = () => {
    onTabChange('arena');

    // If already in cookie mode, clicking the logo toggles it off and reverts theme
    if (isCookieMode) {
      if (onToggleCookieMode) {
        onToggleCookieMode();
      }
      exitCookieTheme();
      return;
    }

    const now = Date.now();
    if (now - logoClickRef.current.lastTime < 600) {
      logoClickRef.current.count += 1;
    } else {
      logoClickRef.current.count = 1;
    }
    logoClickRef.current.lastTime = now;

    if (logoClickRef.current.count >= 5) {
      logoClickRef.current.count = 0;
      try {
        soundEngine.playCookieUnlock();
      } catch {}
      if (onToggleCookieMode) {
        onToggleCookieMode();
      }
      enterCookieTheme();
    }
  };

  // Close dropdown on outside click
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (themeRef.current && !themeRef.current.contains(event.target as Node)) {
        setIsThemeOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header
      className={`sticky top-0 z-50 border-b border-ink-400/15 bg-bg/95 backdrop-blur-sm transition-all duration-200 ${
        isZenActive ? 'opacity-0 pointer-events-none -translate-y-full' : 'opacity-100 translate-y-0'
      }`}
    >
      <div className="max-w-4xl mx-auto px-3 sm:px-4 h-14 flex items-center justify-between gap-1.5 sm:gap-2">
        {/* Monogrammed "kw" Logo & lowercase "keywarp" */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none shrink-0 group"
          onClick={handleLogoClick}
          title={isCookieMode ? '🍪 Cookie Mode Active! Click to switch' : 'keywarp (click 5x for cookie surprise)'}
        >
          <div className={`w-6 h-6 rounded bg-surface border flex items-center justify-center font-mono text-xs font-bold transition-all shrink-0 ${
            isCookieMode
              ? 'border-amber-500 text-amber-500 shadow-[0_0_10px_rgba(245,158,11,0.6)] animate-pulse'
              : 'border-accent/40 text-accent group-hover:border-accent'
          }`}>
            {isCookieMode ? '🍪' : 'kw'}
          </div>
          <div className="flex items-center gap-1">
            <span className="text-xs sm:text-sm font-medium text-ink-100 font-sans tracking-tight hidden sm:inline">
              keywarp
            </span>
            {isCookieMode ? (
              <span className="text-[10px] font-mono px-1 py-0.2 rounded bg-amber-500/15 border border-amber-500/40 text-amber-500 font-semibold animate-in fade-in">
                bake
              </span>
            ) : null}
          </div>
        </div>

        {/* Tab Navigation Pill Bar (All 3 tabs clearly visible on mobile) */}
        <nav
          role="tablist"
          aria-label="Main navigation"
          className="flex items-center gap-0.5 sm:gap-1 p-0.5 rounded bg-surface border border-ink-400/15 shrink-0"
        >
          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'arena'}
            onClick={() => onTabChange('arena')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded text-xs font-sans transition-colors cursor-pointer select-none ${
              activeTab === 'arena'
                ? 'bg-bg text-ink-100 border border-accent/60 font-medium shadow-sm'
                : 'text-ink-400 hover:text-ink-100 hover:bg-bg/40'
            }`}
          >
            <Zap className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Arena</span>
          </button>

          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'coach'}
            onClick={() => onTabChange('coach')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded text-xs font-sans transition-colors cursor-pointer select-none ${
              activeTab === 'coach'
                ? 'bg-bg text-ink-100 border border-accent/60 font-medium shadow-sm'
                : 'text-ink-400 hover:text-ink-100 hover:bg-bg/40'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Coach</span>
          </button>

          <button
            role="tab"
            type="button"
            aria-selected={activeTab === 'analytics'}
            onClick={() => onTabChange('analytics')}
            className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1 rounded text-xs font-sans transition-colors cursor-pointer select-none ${
              activeTab === 'analytics'
                ? 'bg-bg text-ink-100 border border-accent/60 font-medium shadow-sm'
                : 'text-ink-400 hover:text-ink-100 hover:bg-bg/40'
            }`}
          >
            <BarChart3 className="w-3.5 h-3.5 text-accent" aria-hidden="true" />
            <span>Stats</span>
          </button>
        </nav>

        {/* Action Controls: Tour & Theme Dropdown */}
        <div className="flex items-center gap-1 sm:gap-2 shrink-0">
          {/* Guide / Tour Button */}
          {onOpenTour && (
            <button
              id="header-tour-button"
              type="button"
              onClick={onOpenTour}
              className="flex items-center gap-1 px-2 py-1 rounded bg-surface border border-ink-400/15 text-xs text-ink-400 hover:text-accent hover:border-accent/40 transition-colors cursor-pointer"
              title="Interactive Tour & Guide"
            >
              <Compass className="w-3.5 h-3.5 text-accent" />
              <span className="hidden md:inline font-sans text-[11px]">Tour</span>
            </button>
          )}

          {/* Theme Picker Dropdown */}
          <div className="relative" ref={themeRef}>
            <button
              type="button"
              onClick={() => setIsThemeOpen(prev => !prev)}
              className={`flex items-center gap-1 sm:gap-1.5 px-2 sm:px-2.5 py-1 rounded bg-surface border text-xs font-sans transition-colors cursor-pointer ${
                isThemeOpen ? 'border-accent text-ink-100' : 'border-ink-400/15 text-ink-400 hover:text-ink-100'
              }`}
              aria-label="Theme selector"
              aria-expanded={isThemeOpen}
            >
              <Palette className="w-3.5 h-3.5 text-accent" />
              <span className="hidden md:inline">{currentTheme.name}</span>
            </button>

            {/* Dropdown Menu */}
            {isThemeOpen ? (
              <div className="absolute right-0 top-full mt-1.5 w-44 rounded border border-ink-400/20 bg-surface p-1.5 shadow-lg z-50 animate-in fade-in zoom-in-95 duration-100">
                <div className="text-[10px] font-sans text-ink-400 px-2 py-1 select-none">
                  Visual themes
                </div>
                {availableThemes.map(t => (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => {
                      setThemeId(t.id);
                      setIsThemeOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-xs font-sans transition-colors text-left cursor-pointer ${
                      currentTheme.id === t.id
                        ? 'bg-bg text-ink-100 border border-accent/50 font-medium'
                        : 'text-ink-400 hover:text-ink-100 hover:bg-bg/50'
                    }`}
                  >
                    <span>{t.name}</span>
                    <span
                      className="w-2.5 h-2.5 rounded-full border border-ink-400/30"
                      style={{ backgroundColor: t.main }}
                    />
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </header>
  );
};
