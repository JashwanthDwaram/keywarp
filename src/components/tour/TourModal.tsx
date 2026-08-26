import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, BarChart3, X, ArrowRight, ArrowLeft, Check, HelpCircle, Palette } from 'lucide-react';

export interface TourModalProps {
  isOpen: boolean;
  onClose: () => void;
  onTabChange: (tab: 'arena' | 'coach' | 'analytics') => void;
}

export const TourModal: React.FC<TourModalProps> = ({ isOpen, onClose, onTabChange }) => {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      tab: 'arena' as const,
      icon: <Zap className="w-4 h-4 text-accent" />,
      title: 'Practice Modes & Ribbon',
      stepLabel: '1/5',
      badge: 'Modes',
      mobileLead: 'Select Time/Words sprints or Quotes & Code snippets from the top ribbon.',
      summary: 'Pick your typing style on the mode ribbon:',
      bullets: [
        { label: 'Time & Words', text: 'Quick sprints (15s–120s) or fixed word targets.' },
        { label: 'Quotes', text: 'Famous philosophy passages with clean author credits.' },
        { label: 'Code & Custom', text: 'Programming snippets or paste your own article.' }
      ],
      tip: 'Tab restarts instantly • Esc toggles Zen mode'
    },
    {
      tab: 'arena' as const,
      icon: <Palette className="w-4 h-4 text-accent" />,
      title: 'Themes, Sounds & Modalities',
      stepLabel: '2/5',
      badge: 'Customize',
      mobileLead: 'Change color themes in the top-right header and mechanical switch audio on the ribbon.',
      summary: 'Personalize your visual & audio setup:',
      bullets: [
        { label: 'Themes', text: 'Click the palette in the top-right header to switch color themes.' },
        { label: 'Sounds', text: 'Click "thock" on the ribbon for mechanical switch audio.' },
        { label: 'Modalities (⚙)', text: 'Click the gear to toggle Blind Mode or Sudden Death.' }
      ],
      tip: 'Themes in top header • Sounds & ⚙ on the ribbon'
    },
    {
      tab: 'coach' as const,
      icon: <Sparkles className="w-4 h-4 text-accent" />,
      title: 'AI Kinesiology Coach',
      stepLabel: '3/5',
      badge: 'AI Coach',
      mobileLead: 'Powered by Gemini 3.6 Flash to diagnose finger hesitation and generate custom workouts.',
      summary: 'Powered by Gemini 3.6 Flash for smart training:',
      bullets: [
        { label: 'Diagnostics', text: 'Analyzes microsecond keystrokes to find hesitation keys.' },
        { label: 'Custom Drills', text: 'Generates 45s workouts targeting your weak transitions.' },
        { label: 'Instant Launch', text: 'Click "Launch Module" to send drills directly into the Arena.' }
      ],
      tip: 'Generates new adaptive drills after each session'
    },
    {
      tab: 'analytics' as const,
      icon: <BarChart3 className="w-4 h-4 text-accent" />,
      title: 'Biomechanical Telemetry',
      stepLabel: '4/5',
      badge: 'Stats',
      mobileLead: 'Switch between Rhythm trajectory, Keystroke Latency, and Left vs Right hand balance.',
      summary: 'Explore 3-in-1 switchable performance views:',
      bullets: [
        { label: 'Rhythm', text: 'Session sparkbars with accuracy-graded colors.' },
        { label: 'Latency', text: 'Millisecond intervals and fastest flow digraphs.' },
        { label: 'Balance', text: 'Left vs Right hand physical workload distribution.' }
      ],
      tip: 'Toggle Rhythm / Latency / Balance buttons above'
    },
    {
      tab: 'arena' as const,
      icon: <HelpCircle className="w-4 h-4 text-accent" />,
      title: 'Ready to Type!',
      stepLabel: '5/5',
      badge: 'Guide',
      mobileLead: '100% private and stored in your browser. Tap Start Typing below to begin!',
      summary: 'You have complete control over TypePulse:',
      bullets: [
        { label: 'Private Data', text: 'All your telemetry is stored 100% locally in your browser.' },
        { label: 'Re-open Tour', text: 'Click the ? Tour button in the top header anytime.' },
        { label: 'Fast Shortcuts', text: 'Tab to restart • Esc for Zen • Ctrl+Backspace to clear.' }
      ],
      tip: 'Click Start Typing below to begin!'
    }
  ];

  // Automatically navigate tabs as the user steps through the tour
  useEffect(() => {
    if (isOpen) {
      onTabChange(steps[currentStep].tab);
    }
  }, [currentStep, isOpen, onTabChange]);

  if (!isOpen) return null;

  const step = steps[currentStep];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(prev => prev + 1);
    } else {
      handleComplete();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(prev => prev - 1);
    }
  };

  const handleComplete = () => {
    localStorage.setItem('typepulse_tour_completed', 'true');
    onTabChange('arena');
    onClose();
  };

  return (
    /* Non-blocking, docked floating coachmark widget in bottom-right corner */
    <aside
      aria-label="Interactive Walkthrough"
      className="fixed bottom-3 sm:bottom-6 right-3 sm:right-6 z-50 w-[calc(100vw-1.5rem)] sm:w-[400px] max-h-[85vh] overflow-y-auto pointer-events-auto animate-in slide-in-from-bottom-5 fade-in duration-200"
    >
      <div className="rounded-lg bg-surface/95 border border-accent/40 shadow-2xl p-3.5 sm:p-5 space-y-2.5 sm:space-y-3.5 font-sans select-none backdrop-blur-md">
        {/* Top Header Row */}
        <div className="flex items-center justify-between gap-2 border-b border-ink-400/10 pb-2">
          <div className="flex items-center gap-2 min-w-0">
            <div className="w-6 h-6 sm:w-7 sm:h-7 rounded bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shrink-0">
              {step.icon}
            </div>
            <div className="flex items-center gap-1.5 min-w-0">
              <h3 className="text-xs sm:text-sm font-semibold text-ink-100 truncate">
                {step.title}
              </h3>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-bg border border-ink-400/20 text-accent shrink-0">
                {step.stepLabel}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleComplete}
            className="text-ink-400 hover:text-ink-100 p-1 rounded hover:bg-bg/60 transition-colors cursor-pointer shrink-0"
            title="Dismiss Tour"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Mobile Concise Lead (Clean & compact on phones) */}
        <div className="block sm:hidden text-xs text-ink-100/90 leading-relaxed font-normal">
          {step.mobileLead}
        </div>

        {/* Desktop Structured Bullet Points */}
        <div className="hidden sm:block space-y-2">
          <div className="text-xs font-medium text-ink-100">
            {step.summary}
          </div>
          <div className="space-y-1.5">
            {step.bullets.map((b, i) => (
              <div key={i} className="flex items-start gap-2 text-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-accent mt-1.5 shrink-0" />
                <div className="text-ink-100/90 leading-snug">
                  <strong className="text-ink-100 font-semibold">{b.label}:</strong>{' '}
                  <span className="text-ink-400">{b.text}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Highlighted Footer Tip */}
        <div className="p-1.5 sm:p-2 rounded bg-bg/80 border border-ink-400/15 flex items-center gap-1.5 sm:gap-2 text-[10px] sm:text-[11px] font-mono text-ink-400">
          <span className="w-1.5 h-1.5 rounded-full bg-correct shrink-0" />
          <span className="text-ink-100/90 truncate">{step.tip}</span>
        </div>

        {/* Bottom Navigator Bar */}
        <div className="flex items-center justify-between pt-1">
          {/* Step Dots */}
          <div className="flex items-center gap-1">
            {steps.map((_, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => setCurrentStep(idx)}
                className={`h-1.5 rounded-sm transition-all cursor-pointer ${
                  currentStep === idx
                    ? 'w-3.5 sm:w-4 bg-accent'
                    : 'w-1.5 bg-ink-400/30 hover:bg-ink-400/60'
                }`}
                title={`Jump to step ${idx + 1}`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5">
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrev}
                className="px-2 sm:px-2.5 py-1 rounded text-xs font-medium text-ink-400 hover:text-ink-100 hover:bg-bg/50 transition-colors flex items-center gap-1 cursor-pointer"
              >
                <ArrowLeft className="w-3 h-3" />
                <span className="hidden sm:inline">Back</span>
              </button>
            )}

            <button
              type="button"
              onClick={handleNext}
              className="px-3 sm:px-3.5 py-1.5 rounded bg-accent text-accent-contrast text-xs font-semibold hover:opacity-90 active:scale-95 transition-all flex items-center gap-1.5 shadow-xs cursor-pointer"
            >
              <span>{currentStep === steps.length - 1 ? 'Start Typing' : 'Next'}</span>
              {currentStep === steps.length - 1 ? (
                <Check className="w-3.5 h-3.5" />
              ) : (
                <ArrowRight className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        </div>
      </div>
    </aside>
  );
};
