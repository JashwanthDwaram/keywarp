import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Sparkles, Zap, BarChart3, Activity, X, ArrowRight, ArrowLeft, Check, Keyboard } from 'lucide-react';
import { soundEngine } from '../../utils/soundEngine';

export interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: 'arena' | 'coach' | 'analytics') => void;
}

interface TourStep {
  tab: 'arena' | 'coach' | 'analytics';
  targetId: string;
  icon: React.ReactNode;
  title: string;
  badge: string;
  stepLabel: string;
  description: string;
  actionHint: string;
  nextLabel: string;
}

export const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose, onTabChange }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const activeElementRef = useRef<HTMLElement | null>(null);

  const steps: TourStep[] = [
    {
      tab: 'arena',
      targetId: '#session-results-card',
      icon: <Zap className="w-4 h-4 text-accent" />,
      title: 'Session Summary & Velocity Waveform',
      badge: 'Waveform',
      stepLabel: 'Step 1 of 5',
      description: 'Your dual-line cadence waveform graphs second-by-second pacing, Net WPM, raw gross velocity, and rhythm acceleration.',
      actionHint: 'Hover along the waveform line to inspect second-by-second pacing.',
      nextLabel: 'Next: AI Coach Diagnostics'
    },
    {
      tab: 'coach',
      targetId: '#coach-diagnostics-card',
      icon: <Sparkles className="w-4 h-4 text-accent" />,
      title: 'AI Kinesiology Coach',
      badge: 'Gemini AI',
      stepLabel: 'Step 2 of 5',
      description: 'Gemini analyzes your microsecond key intervals, diagnoses weak transitions, and generates tailored 45-second remedial workouts.',
      actionHint: 'Click "Launch Module" on any drill to send custom exercises directly to the Arena.',
      nextLabel: 'Next: Rhythm & Velocity Horizon'
    },
    {
      tab: 'analytics',
      targetId: '#progression-chart-card',
      icon: <Activity className="w-4 h-4 text-accent" />,
      title: 'Rhythm & Velocity Horizon',
      badge: 'Horizon',
      stepLabel: 'Step 3 of 5',
      description: 'Track your 14-session speed trajectory, consistency flow score, and peak bursts. Switch between Rhythm, Latency, and Hand Balance.',
      actionHint: 'Toggle Rhythm, Latency, and Balance tabs to view physical workload distribution.',
      nextLabel: 'Next: Key Heatmap'
    },
    {
      tab: 'analytics',
      targetId: '#analytics-heatmap-card',
      icon: <BarChart3 className="w-4 h-4 text-accent" />,
      title: 'Biomechanical Key Heatmap',
      badge: 'Biomechanics',
      stepLabel: 'Step 4 of 5',
      description: 'Interactive QWERTY reach mapping: 🟢 Green for fluent speed, 🟡 amber for friction, and 🔴 red for finger error bottlenecks.',
      actionHint: 'Hover over any key to inspect assigned anatomical finger reach data.',
      nextLabel: 'Next: Arena Shortcuts'
    },
    {
      tab: 'arena',
      targetId: '#arena-ribbon-card',
      icon: <Keyboard className="w-4 h-4 text-accent" />,
      title: 'Power Shortcuts & Coding Modes',
      badge: 'Shortcuts',
      stepLabel: 'Step 5 of 5',
      description: 'Press Tab to restart instantly, Esc for Zen mode, and switch ribbon to "code" for real TypeScript, Python, Rust, and SQL presets.',
      actionHint: 'Click the sound pill on the ribbon to customize mechanical switch clicks and flow soundscapes.',
      nextLabel: 'Start Typing'
    }
  ];

  // Always reset to the very first card (Step 1) whenever the tour is opened
  useEffect(() => {
    if (isOpen) {
      setCurrentStep(0);
    }
  }, [isOpen]);

  // Update target element highlighting
  const updateSpotlight = useCallback(() => {
    if (!isOpen) return;

    const step = steps[currentStep];
    if (!step) return;

    // Switch tab
    onTabChange(step.tab);

    // Give DOM a frame to settle after tab change
    setTimeout(() => {
      // Clear previous highlight
      if (activeElementRef.current) {
        activeElementRef.current.classList.remove('tour-spotlight-active');
      }

      const target = document.querySelector(step.targetId) as HTMLElement | null;
      if (target) {
        target.classList.add('tour-spotlight-active');
        activeElementRef.current = target;

        // Scroll target into view nicely
        target.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 80);
  }, [currentStep, isOpen, onTabChange]);

  useEffect(() => {
    updateSpotlight();
    // Play preview mechanical switch sound when reaching shortcuts/sound step
    if (isOpen && currentStep === 4) {
      try {
        soundEngine.playKeyClick(' ', false);
      } catch {}
    }
    return () => {
      if (activeElementRef.current) {
        activeElementRef.current.classList.remove('tour-spotlight-active');
      }
    };
  }, [updateSpotlight, isOpen, currentStep]);

  const handleNext = () => {
    try {
      soundEngine.playKeyClick('a', false);
    } catch {}
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    try {
      soundEngine.playKeyClick('a', false);
    } catch {}
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    if (activeElementRef.current) {
      activeElementRef.current.classList.remove('tour-spotlight-active');
    }
    try {
      soundEngine.playStreakChime(1);
    } catch {}
    localStorage.setItem('typepulse_discovery_completed', 'true');
    localStorage.setItem('typepulse_tour_completed', 'true');
    localStorage.setItem('typepulse_tour_version', '1.3.0');
    onTabChange('arena');
    setCurrentStep(0);
    onClose();
  };

  // Keyboard navigation (<kbd>Enter</kbd>, <kbd>→</kbd>, <kbd>←</kbd>, <kbd>Esc</kbd>)
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA')) {
        return;
      }

      if (e.key === 'ArrowRight' || (e.key === 'Enter' && !e.shiftKey)) {
        e.preventDefault();
        handleNext();
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        handlePrev();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        handleComplete();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, currentStep]);

  if (!isOpen) return null;

  const step = steps[currentStep];

  return (
    <>
      {/* 1. Backdrop Dimmer at z-30 (Dims page, while glowing target at z-40 shines brightly on top!) */}
      <div
        className="fixed inset-0 bg-black/50 backdrop-blur-[2px] z-30 pointer-events-none transition-opacity duration-300"
        aria-hidden="true"
      />

      {/* 2. Side-Docked Floating Tour Card at z-50 (Mobile & Desktop Responsive) */}
      <aside
        aria-label="Interactive Spotlight Walkthrough"
        className="fixed z-50 bottom-3 left-3 right-3 sm:left-auto sm:right-6 sm:bottom-6 sm:w-[410px] lg:w-[440px] max-h-[85vh] overflow-y-auto rounded-2xl bg-surface/98 border border-accent/60 shadow-2xl p-3.5 sm:p-5 space-y-2.5 sm:space-y-3 font-sans select-none ring-1 ring-accent/30 backdrop-blur-md animate-in slide-in-from-bottom-5 duration-200 pointer-events-auto"
      >
        {/* Header Row */}
        <div className="flex items-center justify-between gap-2.5 border-b border-ink-400/10 pb-2">
          <div className="flex items-center gap-2 sm:gap-2.5 min-w-0 flex-1">
            <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-accent/15 border border-accent/40 flex items-center justify-center text-accent shrink-0">
              {step.icon}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5 flex-wrap">
                <h3 className="text-xs sm:text-sm font-semibold text-ink-100 whitespace-normal sm:whitespace-nowrap leading-tight">
                  {step.title}
                </h3>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-bg border border-ink-400/20 text-accent font-medium shrink-0 whitespace-nowrap">
                  {step.stepLabel}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="text-ink-400 hover:text-ink-100 p-1 rounded-lg hover:bg-bg/60 transition-colors cursor-pointer shrink-0"
            title="Dismiss Tour (Esc)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Full Rich Description */}
        <p className="text-xs sm:text-[13px] text-ink-100/90 leading-relaxed font-normal">
          {step.description}
        </p>

        {/* Action Hint Box */}
        <div className="p-2.5 rounded-xl bg-bg/85 border border-ink-400/15 flex items-start gap-2 text-xs font-mono text-ink-400">
          <span className="w-1.5 h-1.5 rounded-full bg-accent shrink-0 mt-1.5" />
          <span className="text-ink-100/90 leading-normal">{step.actionHint}</span>
        </div>

        {/* Navigation Footer */}
        <div className="flex items-center justify-between pt-1.5 border-t border-ink-400/10">
          {/* Progress Step Dots */}
          <div className="flex items-center gap-1.5">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-5 bg-accent'
                    : 'w-1.5 bg-ink-400/30 hover:bg-ink-400/60'
                }`}
                title={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2.5 py-1.5 rounded-lg text-xs font-medium text-ink-400 hover:text-ink-100 hover:bg-bg/60 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-3.5 py-1.5 rounded-lg bg-accent text-accent-contrast text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-sm cursor-pointer whitespace-nowrap"
            >
              <span>{step.nextLabel}</span>
              {currentStep === steps.length - 1 ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
