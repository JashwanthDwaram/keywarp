import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, BarChart3, Palette, Zap, Compass } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export interface HeaderProps {
  activeTab: 'arena' | 'coach' | 'analytics';
  onTabChange: (tab: 'arena' | 'coach' | 'analytics') => void;
  isZenActive: boolean;
  onOpenTour?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  isZenActive,
  onOpenTour
}) => {
  const { currentTheme, setThemeId, availableThemes } = useTheme();
  const [isThemeOpen, setIsThemeOpen] = useState(false);
  const themeRef = useRef<HTMLDivElement>(null);

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
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer select-none shrink-0"
          onClick={() => onTabChange('arena')}
        >
          <div className="w-6 h-6 rounded bg-surface border border-accent/40 flex items-center justify-center font-mono text-xs font-bold text-accent tracking-tighter shrink-0">
            kw
          </div>
          <span className="text-xs sm:text-sm font-medium text-ink-100 font-sans tracking-tight hidden sm:inline">
            keywarp
          </span>
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
