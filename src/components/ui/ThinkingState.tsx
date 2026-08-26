import React, { useState, useEffect } from 'react';
import { ChevronDown, ChevronUp, Clock, Activity } from 'lucide-react';

export interface ThinkingStateProps {
  isThinking: boolean;
  thoughtTrace?: string[];
  durationMs?: number;
  label?: string;
  defaultExpanded?: boolean;
  className?: string;
}

export const ThinkingState: React.FC<ThinkingStateProps> = ({
  isThinking,
  thoughtTrace = [
    'Ingesting session logs and keystroke timestamp delta vectors…',
    'Filtering out intentional backspace corrections from cognitive pauses…',
    'Detecting rhythmic hesitation before symbol and uppercase transitions…',
    'Synthesizing optimal phonetic pattern density for maximum adaptation…',
    'Formulating high-precision drill candidate for user approval.'
  ],
  durationMs = 1420,
  label = 'AI diagnostics trace',
  defaultExpanded = true,
  className = ''
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const [elapsed, setElapsed] = useState(durationMs);

  useEffect(() => {
    if (isThinking) {
      const start = Date.now();
      const timer = setInterval(() => {
        setElapsed(Date.now() - start);
      }, 80);
      return () => clearInterval(timer);
    }
  }, [isThinking]);

  return (
    <div
      className={`w-full rounded border border-ink-400/15 bg-surface overflow-hidden transition-colors ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        aria-expanded={isExpanded}
        className="w-full px-4 py-3 flex items-center justify-between text-left hover:bg-ink-400/5 transition-colors cursor-pointer select-none"
      >
        <div className="flex items-center gap-2.5">
          <div className="text-accent flex items-center justify-center">
            <Activity
              className={`w-3.5 h-3.5 ${isThinking ? 'animate-spin' : ''}`}
              aria-hidden="true"
            />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-ink-100 font-sans">
                {label}
              </span>
              {isThinking ? (
                <span className="text-[11px] text-accent font-mono animate-pulse" aria-live="polite">
                  Analyzing telemetry…
                </span>
              ) : (
                <span className="text-[11px] text-ink-400 font-mono tabular-nums flex items-center gap-1">
                  <Clock className="w-3 h-3" aria-hidden="true" />
                  {(elapsed / 1000).toFixed(1)}s
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1 text-ink-400 text-xs font-mono">
          <span>{isExpanded ? 'Hide trace' : 'View trace'}</span>
          {isExpanded ? <ChevronUp className="w-3.5 h-3.5" aria-hidden="true" /> : <ChevronDown className="w-3.5 h-3.5" aria-hidden="true" />}
        </div>
      </button>

      {isExpanded ? (
        <div className="px-4 pb-3.5 pt-2.5 border-t border-ink-400/10 space-y-1.5 font-mono text-xs text-ink-400 bg-bg/40">
          {thoughtTrace.map((thought, idx) => (
            <div key={idx} className="flex items-start gap-2 leading-relaxed">
              <span className="text-accent select-none tabular-nums" aria-hidden="true">
                0{idx + 1}.
              </span>
              <span className="text-ink-400 hover:text-ink-100 transition-colors">{thought}</span>
            </div>
          ))}
        </div>
      ) : null}
    </div>
  );
};
