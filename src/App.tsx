import React, { useState, useEffect, useCallback, useTransition, useRef } from 'react';
import { Command, Sparkles, ArrowRight, X, Compass } from 'lucide-react';
import { Analytics } from '@vercel/analytics/react';
import { SpeedInsights } from '@vercel/speed-insights/react';
import { TypingRecord } from './types';
import { Header } from './components/Header';
import { TypingArena } from './components/arena/TypingArena';
import { AICoachLab } from './components/coach/AICoachLab';
import { AnalyticsHub } from './components/analytics/AnalyticsHub';
import { ShaderBackground } from './components/ShaderBackground';
import { TourModal } from './components/tour/TourModal';
import { CreditsModal } from './components/CreditsModal';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { soundEngine } from './utils/soundEngine';
import { trackTestCompleted, trackTabChange, trackCoachDrillApplied } from './utils/telemetry';

export const CURRENT_TOUR_VERSION = '1.4.6';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'arena' | 'coach' | 'analytics'>('arena');
  const [isZenActive, setIsZenActive] = useState<boolean>(false);
  const [customDrillText, setCustomDrillText] = useState<string | null>(null);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [isCreditsOpen, setIsCreditsOpen] = useState<boolean>(false);
  const [showDiscoveryBanner, setShowDiscoveryBanner] = useState<boolean>(false);
  const [isCookieMode, setIsCookieMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('keywarp_cookie_mode') === 'true';
    } catch {
      return false;
    }
  });
  const [, startTransition] = useTransition();
  const { enterCookieTheme, exitCookieTheme } = useTheme();
  const secretCookieBufferRef = useRef<string>('');

  const handleToggleCookieMode = useCallback(() => {
    setIsCookieMode(prev => {
      const next = !prev;
      try {
        localStorage.setItem('keywarp_cookie_mode', String(next));
      } catch {}
      if (next) {
        soundEngine.playCookieUnlock();
        enterCookieTheme();
      } else {
        exitCookieTheme();
      }
      return next;
    });
  }, [enterCookieTheme, exitCookieTheme]);

  // Global secret cookie listener (active across all tabs without triggering Zen Mode or test start)
  useEffect(() => {
    const handleGlobalCookieKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'TEXTAREA' || (target.tagName === 'INPUT' && !target.classList.contains('cursor-text')))) {
        return;
      }
      if (e.key && e.key.length === 1 && !e.ctrlKey && !e.altKey && !e.metaKey) {
        secretCookieBufferRef.current = (secretCookieBufferRef.current + e.key.toLowerCase()).slice(-6);
        if (secretCookieBufferRef.current.endsWith('cookie') || secretCookieBufferRef.current.endsWith('baker')) {
          secretCookieBufferRef.current = '';
          handleToggleCookieMode();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalCookieKey);
    return () => window.removeEventListener('keydown', handleGlobalCookieKey);
  }, [handleToggleCookieMode]);

  // Sync version without resetting existing user completion flags
  useEffect(() => {
    try {
      localStorage.setItem('keywarp_tour_version', CURRENT_TOUR_VERSION);
    } catch {}
  }, []);

  // Load private personal records for this specific device/browser
  const [records, setRecords] = useState<TypingRecord[]>(() => {
    const saved = localStorage.getItem('keywarp_records') || localStorage.getItem('typepulse_records');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed;
        }
      } catch {
        // Corrupted storage fallback
      }
    }
    return [];
  });

  useEffect(() => {
    localStorage.setItem('keywarp_records', JSON.stringify(records));
  }, [records]);

  const handleSessionComplete = (newRecord: TypingRecord) => {
    setRecords(prev => [...prev, newRecord]);
    trackTestCompleted({
      mode: newRecord.mode,
      difficulty: newRecord.difficulty,
      netWpm: newRecord.netWpm,
      grossWpm: newRecord.grossWpm,
      accuracy: newRecord.accuracy,
      durationSeconds: newRecord.timeSeconds,
      isDisqualified: newRecord.isDisqualified
    });

    // Only display first-test discovery invitation if user has 0 prior sessions and has never seen or completed the tour
    const hasSeenDiscovery =
      localStorage.getItem('keywarp_discovery_seen') === 'true' ||
      localStorage.getItem('keywarp_discovery_completed') === 'true' ||
      localStorage.getItem('keywarp_tour_completed') === 'true';

    if (!hasSeenDiscovery && records.length === 0) {
      setShowDiscoveryBanner(true);
    }
  };

  const handleResetRecords = () => {
    setRecords([]);
    try {
      localStorage.removeItem('keywarp_records');
      localStorage.removeItem('keywarp_discovery_completed');
      localStorage.removeItem('keywarp_tour_completed');
      localStorage.removeItem('keywarp_first_next_test_clicked');
      localStorage.removeItem('keywarp_discovery_seen');
      localStorage.removeItem('typepulse_records');
    } catch {}
  };

  const handleImportRecords = (imported: TypingRecord[]) => {
    setRecords(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const filtered = imported.filter(r => !existingIds.has(r.id));
      return [...filtered, ...prev];
    });
  };

  const handleTabChange = useCallback((tab: 'arena' | 'coach' | 'analytics') => {
    trackTabChange(tab);
    startTransition(() => {
      setActiveTab(tab);
      if (tab !== 'arena') {
        setIsZenActive(false);
      }
    });
  }, []);

  const handleApplyCustomDrill = (drillText: string) => {
    trackCoachDrillApplied();
    setCustomDrillText(drillText);
    startTransition(() => {
      setActiveTab('arena');
    });
  };

  const handleClearCustomDrill = () => {
    setCustomDrillText(null);
  };

  return (
    <div className="min-h-screen bg-bg text-ink-100 flex flex-col font-sans selection:bg-accent/25 selection:text-ink-100 relative">
      <ShaderBackground />

      {/* Interactive Tour Modal */}
      <TourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onTabChange={handleTabChange}
      />

      {/* Interactive Developer Credits & Project Modal */}
      <CreditsModal
        isOpen={isCreditsOpen}
        onClose={() => setIsCreditsOpen(false)}
        isCookieMode={isCookieMode}
      />

      {/* Post-First-Session Graduation Discovery Toast (Mobile & Desktop Responsive) */}
      {showDiscoveryBanner && !isTourOpen ? (
        <aside
          aria-label="First Test Discovery"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:max-w-lg p-3 sm:p-4 rounded-xl bg-surface/98 border border-accent/60 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 font-sans flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 select-none ring-1 ring-accent/30 pointer-events-auto"
        >
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0">
              <div className="text-xs sm:text-sm font-semibold text-ink-100 whitespace-nowrap">
                🎉 First Test Recorded!
              </div>
              <div className="text-[11px] text-ink-400 whitespace-nowrap">
                Explore AI Coach diagnostics & heatmap
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0 pt-2 sm:pt-0 border-t sm:border-t-0 border-ink-400/10">
            <button
              type="button"
              onClick={() => {
                setShowDiscoveryBanner(false);
                localStorage.setItem('keywarp_discovery_seen', 'true');
                localStorage.setItem('keywarp_discovery_completed', 'true');
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-400 hover:text-ink-100 hover:bg-bg/60 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDiscoveryBanner(false);
                localStorage.setItem('keywarp_discovery_seen', 'true');
                localStorage.setItem('keywarp_discovery_completed', 'true');
                setIsTourOpen(true);
              }}
              className="px-3.5 py-1.5 rounded-md bg-accent text-accent-contrast text-xs font-semibold hover:opacity-90 active:scale-95 transition-all shadow-sm flex items-center gap-1 cursor-pointer whitespace-nowrap"
            >
              <span>Explore (30s)</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </aside>
      ) : null}

      {/* Accessibility Skip Link */}
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-50 focus:px-3 focus:py-1 focus:bg-surface focus:text-ink-100 focus:border focus:border-accent focus:rounded font-sans text-xs"
      >
        Skip to main content
      </a>

      {/* Top Header */}
      <Header
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isZenActive={isZenActive}
        onOpenTour={() => setIsTourOpen(true)}
        isCookieMode={isCookieMode}
        onToggleCookieMode={handleToggleCookieMode}
      />

      {/* Main Content Arena: Persistent Tab States (Zero Reset on Switching) */}
      <main
        id="main-content"
        className="flex-1 max-w-4xl w-full mx-auto px-4 py-3 sm:py-4 flex flex-col justify-center font-sans"
      >
        <div className={activeTab === 'arena' ? 'block' : 'hidden'}>
          <TypingArena
            isActiveTab={activeTab === 'arena'}
            onSessionComplete={handleSessionComplete}
            onOpenCoach={() => handleTabChange('coach')}
            onOpenTour={() => setIsTourOpen(true)}
            onZenModeChange={setIsZenActive}
            customDrillText={customDrillText}
            onClearCustomDrill={handleClearCustomDrill}
            isCookieMode={isCookieMode}
            onToggleCookieMode={handleToggleCookieMode}
          />
        </div>

        <div className={activeTab === 'coach' ? 'block' : 'hidden'}>
          <AICoachLab
            records={records}
            onApplyDrill={handleApplyCustomDrill}
          />
        </div>

        <div className={activeTab === 'analytics' ? 'block' : 'hidden'}>
          <AnalyticsHub
            records={records}
            onResetRecords={handleResetRecords}
            onImportRecords={handleImportRecords}
          />
        </div>
      </main>

      {/* Ambient Minimalist Footer */}
      <footer
        className={`border-t border-ink-400/15 py-3 text-xs text-ink-400 font-sans transition-opacity duration-200 ${
          isZenActive ? 'opacity-0 pointer-events-none' : 'opacity-100'
        }`}
      >
        <div className="max-w-4xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2.5">
          <div className="flex items-center gap-2">
            <span className="font-medium text-ink-100 font-mono">keywarp</span>
            <span className="text-[10px] font-mono text-ink-400/60 px-1.5 py-0.5 rounded bg-surface border border-ink-400/15">v1.4.6</span>
            <span className="text-ink-400/40">•</span>
            <span className="flex items-center gap-1 text-ink-400/80 font-mono text-[11px]">
              <Command className="w-3 h-3 text-accent" /> tab to restart
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <button
              type="button"
              onClick={() => setIsCreditsOpen(true)}
              className="flex items-center gap-1.5 text-ink-400 hover:text-accent transition-colors group cursor-pointer"
              title="View Creator Credits & Open Source Details"
            >
              <span className={`w-1.5 h-1.5 rounded-full ${isCookieMode ? 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.8)] animate-pulse' : 'bg-correct shadow-[0_0_6px_rgba(16,185,129,0.5)]'} inline-block`} />
              <span>{isCookieMode ? '🍪 oven hot (350°F)' : 'made with love :)'}</span>
              <span className="text-ink-400/60 group-hover:text-accent font-mono text-[10px] px-1 py-0.2 rounded bg-surface border border-ink-400/15">credits ⓘ</span>
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <ThemeProvider>
      <AppContent />
      <Analytics />
      <SpeedInsights />
    </ThemeProvider>
  );
};

export default App;
