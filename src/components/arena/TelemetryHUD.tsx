import React from 'react';

export interface TelemetryHUDProps {
  netWpm: number;
  grossWpm: number;
  accuracy: number;
  streak: number;
  isTyping: boolean;
  mode: string;
  sprintRemainingSeconds?: number;
  progressPercent: number;
  isCookieMode?: boolean;
  /** Live 0-100 rhythm consistency computed from recent keystroke intervals */
  cadenceConsistency?: number;
}

export const TelemetryHUD: React.FC<TelemetryHUDProps> = ({
  netWpm,
  accuracy,
  streak,
  isTyping,
  mode,
  sprintRemainingSeconds,
  progressPercent,
  isCookieMode = false,
  cadenceConsistency = 0
}) => {
  const isTimeSprint = mode === 'Time' || mode === 'Sprint';

  return (
    <div className="w-full space-y-1.5 select-none animate-in fade-in duration-150 py-0.5">
      {/* Ambient metrics line */}
      <div className="flex items-center justify-between text-xs font-mono text-ink-400 px-0.5">
        <div className="flex items-center gap-3 tabular-nums">
          <span className="text-ink-100 font-medium flex items-center gap-1">
            {isCookieMode ? (
              <>
                <span className="animate-bounce inline-block text-[11px]">🍪</span>
                <span className="text-accent font-bold">{netWpm}</span>
                <span className="text-accent/90 text-[10px] uppercase tracking-wider font-semibold">cbpm</span>
              </>
            ) : (
              <>
                <span className="text-accent">{netWpm}</span> wpm
              </>
            )}
          </span>
          <span className="text-ink-400/30">•</span>
          <span className={accuracy < 95 ? 'text-incorrect font-medium' : 'text-correct'}>
            {accuracy}% acc
          </span>
          {isTyping && cadenceConsistency > 0 ? (
            <>
              <span className="text-ink-400/30">•</span>
              <span
                className={`tabular-nums ${cadenceConsistency >= 70 ? 'text-correct' : cadenceConsistency >= 40 ? 'text-accent' : 'text-incorrect'}`}
                title="Rhythm consistency — how even your keystroke intervals are"
              >
                {cadenceConsistency}% cadence
              </span>
            </>
          ) : null}
          {isTyping && streak >= 5 ? (
            <>
              <span className="text-ink-400/30">•</span>
              <span className="text-accent font-medium">
                {isCookieMode && streak >= 150
                  ? `👑 Master Chocolatier (${streak})`
                  : isCookieMode && streak >= 100
                  ? `🍪 Grandma is Proud! (${streak})`
                  : isCookieMode && streak >= 50
                  ? `🔥 Golden Crust (${streak})`
                  : isCookieMode && streak >= 25
                  ? `🥣 Dough Prepped (${streak})`
                  : `${streak} streak`}
              </span>
            </>
          ) : null}
        </div>

        {isTimeSprint ? (
          <div className="flex items-center gap-1.5 text-accent font-medium tabular-nums text-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
            <span>{sprintRemainingSeconds !== undefined ? `${Math.ceil(sprintRemainingSeconds)}s remaining` : '30s remaining'}</span>
          </div>
        ) : (
          <span className="text-ink-400/60 text-[11px] tabular-nums">
            {isTyping ? `${Math.round(progressPercent)}% done` : 'ready'}
          </span>
        )}
      </div>

      {/* Subtle minimal progress line */}
      <div className="w-full h-[2px] bg-ink-400/10 rounded-full overflow-hidden">
        <div
          className="h-full bg-accent transition-all duration-100 ease-out"
          style={{ width: `${Math.min(100, Math.max(0, progressPercent))}%` }}
        />
      </div>
    </div>
  );
};
