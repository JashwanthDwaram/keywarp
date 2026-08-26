import React, { useState, useEffect, useTransition } from 'react';
import { Command } from 'lucide-react';
import { TypingRecord } from './types';
import { Header } from './components/Header';
import { TypingArena } from './components/arena/TypingArena';
import { AICoachLab } from './components/coach/AICoachLab';
import { AnalyticsHub } from './components/analytics/AnalyticsHub';
import { ShaderBackground } from './components/ShaderBackground';
import { TourModal } from './components/tour/TourModal';
import { ThemeProvider } from './context/ThemeContext';

export const AppContent: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'arena' | 'coach' | 'analytics'>('arena');
  const [isZenActive, setIsZenActive] = useState<boolean>(false);
  const [customDrillText, setCustomDrillText] = useState<string | null>(null);
  const [, startTransition] = useTransition();

  // Auto-launch interactive tour for first-time visitors
  const [isTourOpen, setIsTourOpen] = useState<boolean>(() => {
    return !localStorage.getItem('typepulse_tour_completed');
  });

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
    setRecords(prev => [...prev, newRecord]);
  };

  const handleResetRecords = () => {
    setRecords([]);
    localStorage.removeItem('typepulse_records');
  };

  const handleImportRecords = (imported: TypingRecord[]) => {
    setRecords(prev => {
      const existingIds = new Set(prev.map(r => r.id));
      const filtered = imported.filter(r => !existingIds.has(r.id));
      return [...filtered, ...prev];
    });
  };

  const handleTabChange = (tab: 'arena' | 'coach' | 'analytics') => {
    startTransition(() => {
      setActiveTab(tab);
    });
  };

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
        className="flex-1 max-w-4xl w-full mx-auto px-4 py-6 flex flex-col justify-center font-sans"
      >
        <div className={activeTab === 'arena' ? 'block' : 'hidden'}>
          <TypingArena
            onSessionComplete={handleSessionComplete}
            onOpenCoach={() => handleTabChange('coach')}
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
            <span className="text-[10px] font-mono text-ink-400/60 px-1.5 py-0.5 rounded bg-surface border border-ink-400/15">v1.2.4</span>
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
