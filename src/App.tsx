import React, { useState, useEffect, useCallback, useTransition } from 'react';
import { Command, Sparkles, ArrowRight, X, Compass } from 'lucide-react';
import { TypingRecord } from './types';
import { Header } from './components/Header';
import { TypingArena } from './components/arena/TypingArena';
import { AICoachLab } from './components/coach/AICoachLab';
import { AnalyticsHub } from './components/analytics/AnalyticsHub';
import { ShaderBackground } from './components/ShaderBackground';
import { TourModal } from './components/tour/TourModal';
import { ThemeProvider } from './context/ThemeContext';

export const CURRENT_TOUR_VERSION = '1.2.8';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'arena' | 'coach' | 'analytics'>('arena');
  const [isZenActive, setIsZenActive] = useState<boolean>(false);
  const [customDrillText, setCustomDrillText] = useState<string | null>(null);
  const [isTourOpen, setIsTourOpen] = useState<boolean>(false);
  const [showDiscoveryBanner, setShowDiscoveryBanner] = useState<boolean>(false);
  const [, startTransition] = useTransition();

  // Version migration: ensures returning users on Vercel get the new v1.2.8 tour while preserving their typing records
  useEffect(() => {
    try {
      const storedVersion = localStorage.getItem('typepulse_tour_version');
      if (storedVersion !== CURRENT_TOUR_VERSION) {
        localStorage.removeItem('typepulse_discovery_completed');
        localStorage.removeItem('typepulse_tour_completed');
        localStorage.removeItem('typepulse_first_next_test_clicked');
      }
    } catch {}
  }, []);

  // Load private personal records for this specific device/browser
  const [records, setRecords] = useState<TypingRecord[]>(() => {
    const saved = localStorage.getItem('typepulse_records');
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
    localStorage.setItem('typepulse_records', JSON.stringify(records));
  }, [records]);

  const handleSessionComplete = (newRecord: TypingRecord) => {
    setRecords(prev => {
      const next = [...prev, newRecord];
      const hasSeenWalkthrough = localStorage.getItem('typepulse_1_2_8_walkthrough_completed');
      if (!hasSeenWalkthrough) {
        localStorage.setItem('typepulse_1_2_8_walkthrough_completed', 'true');
        setTimeout(() => {
          setIsTourOpen(true);
        }, 400);
      }
      return next;
    });
  };

  const handleResetRecords = () => {
    setRecords([]);
    localStorage.removeItem('typepulse_records');
    localStorage.removeItem('typepulse_discovery_completed');
    localStorage.removeItem('typepulse_tour_completed');
    localStorage.removeItem('typepulse_first_next_test_clicked');
    localStorage.removeItem('typepulse_tour_version');
    localStorage.removeItem('typepulse_1_2_8_test_completed');
    localStorage.removeItem('typepulse_1_2_8_walkthrough_completed');
  };

  const handleImportRecords = (imported: TypingRecord[]) => {
    setRecords(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const filtered = imported.filter(r => !existingIds.has(r.id));
      return [...filtered, ...prev];
    });
  };

  const handleTabChange = useCallback((tab: 'arena' | 'coach' | 'analytics') => {
    startTransition(() => {
      setActiveTab(tab);
    });
  }, []);

  const handleApplyCustomDrill = (drillText: string) => {
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

      {/* Interactive First-Time & On-Demand Tab-Navigating Tour */}
      <TourModal
        isOpen={isTourOpen}
        onClose={() => setIsTourOpen(false)}
        onTabChange={handleTabChange}
      />

      {/* Post-First-Session Graduation Discovery Toast (Mobile & Desktop Responsive) */}
      {showDiscoveryBanner && !isTourOpen ? (
        <aside
          aria-label="First Test Discovery"
          className="fixed bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 z-50 sm:w-[480px] p-3 sm:p-4 rounded-xl bg-surface/98 border border-accent/60 shadow-2xl backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 font-sans flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2.5 sm:gap-3 select-none ring-1 ring-accent/30 pointer-events-auto"
        >
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-lg bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shrink-0">
              <Compass className="w-4 h-4" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs sm:text-sm font-semibold text-ink-100 truncate sm:whitespace-nowrap">
                🎉 First Test Recorded!
              </div>
              <div className="text-[11px] text-ink-400 truncate sm:whitespace-nowrap">
                Explore your AI Coach diagnostics & Key Heatmap
              </div>
            </div>
          </div>
          <div className="flex items-center justify-end gap-2 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-ink-400/10">
            <button
              type="button"
              onClick={() => {
                setShowDiscoveryBanner(false);
                localStorage.setItem('typepulse_discovery_completed', 'true');
              }}
              className="px-2.5 py-1.5 rounded-md text-xs font-medium text-ink-400 hover:text-ink-100 hover:bg-bg/60 transition-colors cursor-pointer"
            >
              Dismiss
            </button>
            <button
              type="button"
              onClick={() => {
                setShowDiscoveryBanner(false);
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
      />

      {/* Main Content Arena: Persistent Tab States (Zero Reset on Switching) */}
      <main
        id="main-content"
        className="flex-1 max-w-4xl w-full mx-auto px-4 py-3 sm:py-4 flex flex-col justify-center font-sans"
      >
        <div className={activeTab === 'arena' ? 'block' : 'hidden'}>
          <TypingArena
            onSessionComplete={handleSessionComplete}
            onOpenCoach={() => handleTabChange('coach')}
            onOpenTour={() => setIsTourOpen(true)}
            onZenModeChange={setIsZenActive}
            customDrillText={customDrillText}
            onClearCustomDrill={handleClearCustomDrill}
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
            <span className="font-medium text-ink-100 font-mono">typepulse</span>
            <span className="text-[10px] font-mono text-ink-400/60 px-1.5 py-0.5 rounded bg-surface border border-ink-400/15">v1.2.8</span>
            <span className="text-ink-400/40">•</span>
            <span className="flex items-center gap-1 text-ink-400/80 font-mono text-[11px]">
              <Command className="w-3 h-3 text-accent" /> tab to restart
            </span>
          </div>

          <div className="flex items-center gap-3 text-[11px]">
            <a
              href="https://github.com/JashwanthDwaram/typepulse"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 text-ink-400 hover:text-accent transition-colors group cursor-pointer"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-correct group-hover:bg-accent transition-colors inline-block" />
              <span>crafted by <strong className="font-medium text-ink-100/90 group-hover:text-accent">Jashwanth Dwaram</strong></span>
              <span className="text-ink-400/60 group-hover:text-accent font-mono">↗</span>
            </a>
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
    </ThemeProvider>
  );
};

export default App;
